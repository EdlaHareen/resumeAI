from typing import List
from api.models.responses import BulletDiff, EdgeCase


def get_revert_edge_cases(resume_structured: dict, rewrites: dict, verdicts: dict) -> List[EdgeCase]:
    """
    Return EdgeCases for bullets Stage 4 reverted due to hallucinations.
    Surfaces otherwise-silent reverts so users understand why a bullet wasn't changed.
    """
    cases = []
    for section in resume_structured.get("sections", []):
        section_title = section.get("title", "Unknown")
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                bid = bullet["bullet_id"]
                if bid not in verdicts:
                    continue
                verdict = verdicts[bid]
                if verdict.get("verdict") == "revert" or verdict.get("is_fabricated"):
                    detail = verdict.get("fabrication_detail") or "Added information not present in your original resume."
                    cases.append(EdgeCase(
                        type="reverted_bullet",
                        message=f'In "{section_title}": AI suggestion reverted — {detail}',
                        severity="info",
                    ))
    return cases


def build_diff(resume_structured: dict, rewrites: dict, verdicts: dict) -> List[BulletDiff]:
    """
    Build the diff list from structured resume, rewrites, and validation verdicts.
    Only includes bullets that changed and passed validation.
    Fabricated bullets are automatically reverted.
    """
    diffs = []

    for section in resume_structured.get("sections", []):
        section_title = section.get("title", "Unknown")
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                bid = bullet["bullet_id"]
                original_text = bullet["text"]

                if bid not in rewrites:
                    continue

                rw = rewrites[bid]
                tailored_text = rw.get("tailored", original_text)

                # Check validation verdict
                verdict = verdicts.get(bid, {})
                if verdict.get("verdict") == "revert" or verdict.get("is_fabricated"):
                    # Revert to original -- skip this diff (or add as unchanged)
                    continue

                # Only include if actually changed
                if tailored_text.strip() == original_text.strip():
                    continue

                diffs.append(BulletDiff(
                    bullet_id=bid,
                    section=section_title,
                    original=original_text,
                    tailored=tailored_text,
                    keywords_added=rw.get("keywords_added", []),
                    injected_keywords=rw.get("injected_keywords", []),
                    action_verb_changed=rw.get("action_verb_changed", False),
                ))

    return diffs
