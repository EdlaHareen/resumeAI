from io import BytesIO
from typing import Dict
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER


def _apply_accepted(resume_structured: dict, accepted_bullets: Dict[str, str]) -> dict:
    """Return a copy of resume_structured with bullets replaced by accepted versions."""
    import copy
    result = copy.deepcopy(resume_structured)
    for section in result.get("sections", []):
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                bid = bullet["bullet_id"]
                if bid in accepted_bullets:
                    bullet["text"] = accepted_bullets[bid]
    return result


def generate_pdf(resume_structured: dict, accepted_bullets: Dict[str, str]) -> bytes:
    """Generate an ATS-friendly PDF from structured resume data."""
    resume = _apply_accepted(resume_structured, accepted_bullets)
    buf = BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        "Name",
        parent=styles["Normal"],
        fontSize=18,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    contact_style = ParagraphStyle(
        "Contact",
        parent=styles["Normal"],
        fontSize=10,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    section_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=4,
        textColor=colors.black,
    )
    entry_header_style = ParagraphStyle(
        "EntryHeader",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        spaceAfter=2,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=styles["Normal"],
        fontSize=10,
        leftIndent=12,
        spaceAfter=2,
        bulletIndent=0,
    )

    story = []

    # Name
    name = resume.get("name", "")
    if name:
        story.append(Paragraph(name, name_style))

    # Contact line
    contact = resume.get("contact", {})
    contact_parts = [v for v in [
        contact.get("email"),
        contact.get("phone"),
        contact.get("location"),
        contact.get("linkedin"),
    ] if v]
    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), contact_style))

    # Summary
    summary = resume.get("summary")
    if summary:
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black))
        story.append(Paragraph("SUMMARY", section_style))
        story.append(Paragraph(summary, styles["Normal"]))
        story.append(Spacer(1, 4))

    # Sections
    for section in resume.get("sections", []):
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black))
        story.append(Paragraph(section["title"].upper(), section_style))

        for entry in section.get("entries", []):
            if entry.get("header"):
                story.append(Paragraph(entry["header"], entry_header_style))
            for bullet in entry.get("bullets", []):
                text = bullet.get("text", "").strip()
                if text:
                    story.append(Paragraph(f"• {text}", bullet_style))

        story.append(Spacer(1, 4))

    doc.build(story)
    return buf.getvalue()
