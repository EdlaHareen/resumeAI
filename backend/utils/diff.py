from typing import List
from api.models.responses import BulletDiff


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
                    action_verb_changed=rw.get("action_verb_changed", False),
                ))

    return diffs
