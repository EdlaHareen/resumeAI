"""
LaTeX resume generator.
Renders structured resume data into a LaTeX document matching the user's template,
then compiles it with tectonic to produce an ATS-friendly, professionally formatted PDF.
"""

import os
import re
import shutil
import subprocess
import tempfile
from typing import Dict


# ---------------------------------------------------------------------------
# LaTeX character escaping
# ---------------------------------------------------------------------------

_LATEX_SPECIAL = {
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
    "\\": r"\textbackslash{}",
}


def _esc(text: str) -> str:
    """Escape special LaTeX characters in plain text."""
    if not text:
        return ""
    # Replace backslash first to avoid double-escaping
    result = text.replace("\\", r"\textbackslash{}")
    for char, replacement in _LATEX_SPECIAL.items():
        if char != "\\":
            result = result.replace(char, replacement)
    return result


def _esc_url(url: str) -> str:
    r"""Minimal escaping for URLs inside \href{}."""
    return url.replace("%", r"\%")


# ---------------------------------------------------------------------------
# Apply accepted bullet choices to structured resume
# ---------------------------------------------------------------------------

def _apply_bullets(resume_structured: dict, accepted_bullets: Dict[str, str]) -> dict:
    import copy
    result = copy.deepcopy(resume_structured)
    for section in result.get("sections", []):
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                bid = bullet["bullet_id"]
                if bid in accepted_bullets and accepted_bullets[bid] != "original":
                    bullet["text"] = accepted_bullets[bid]
    return result


# ---------------------------------------------------------------------------
# Section renderers
# ---------------------------------------------------------------------------

def _render_header(resume: dict) -> str:
    name = _esc(resume.get("name", ""))
    contact = resume.get("contact", {})
    email = contact.get("email", "")
    phone = _esc(contact.get("phone", ""))
    location = _esc(contact.get("location", ""))
    linkedin = contact.get("linkedin", "")

    # Build subtitle line (title if present)
    summary_title = _esc(resume.get("title", ""))

    lines = [r"\begin{center}"]
    lines.append(r"    {\LARGE \textbf{" + name + r"}} \\[2pt]")
    if summary_title:
        lines.append(f"    {summary_title} \\\\")
    if location:
        lines.append(f"    {location} \\\\[4pt]")

    # Contact row
    contact_parts = []
    if phone:
        contact_parts.append(phone)
    if email:
        contact_parts.append(
            r"\href{mailto:" + _esc_url(email) + r"}{" + _esc(email) + r"}"
        )
    if linkedin:
        # Normalize linkedin URL
        if not linkedin.startswith("http"):
            linkedin_url = "https://" + linkedin
        else:
            linkedin_url = linkedin
        display = linkedin.replace("https://", "").replace("http://", "")
        contact_parts.append(
            r"\href{" + _esc_url(linkedin_url) + r"}{" + _esc(display) + r"}"
        )

    if contact_parts:
        lines.append("    " + r" \quad ".join(contact_parts))

    lines.append(r"\end{center}")
    return "\n".join(lines)


def _render_summary(resume: dict) -> str:
    summary = resume.get("summary", "")
    if not summary:
        return ""
    return (
        r"\section*{Professional Summary}" + "\n\n"
        + _esc(summary) + "\n"
    )


def _get_entry_fields(entry: dict) -> dict:
    """
    Extract company/role/dates/location from entry.
    Prefers explicit fields (from improved parser); falls back to header parsing.
    """
    company = entry.get("company", "")
    role = entry.get("role", "")
    location = entry.get("location", "")
    dates = entry.get("dates", "")

    # Fall back to header parsing if explicit fields are missing
    if not company:
        header_parts = _parse_entry_header(entry.get("header", ""))
        company = header_parts.get("company", entry.get("header", ""))
        role = role or header_parts.get("role", "")
        location = location or header_parts.get("location", "")
        dates = dates or header_parts.get("dates", "")

    return {
        "company": company,
        "role": role,
        "location": location,
        "dates": dates,
    }


def _render_experience(section: dict) -> str:
    lines = [r"\section*{Work Experience}", ""]
    for entry in section.get("entries", []):
        fields = _get_entry_fields(entry)

        company = _esc(fields["company"])
        role = _esc(fields["role"])
        dates = _esc(fields["dates"])
        location = _esc(fields["location"])

        # Company line: bold name, location right-aligned
        company_line = r"\textbf{" + company + r"}"
        if location:
            company_line += r" \hfill " + location
        company_line += r" \\"
        lines.append(company_line)

        # Role line: italic title, dates right-aligned
        if role:
            role_line = r"\textit{" + role + r"}"
            if dates:
                role_line += r" \hfill " + dates
            role_line += r" \\"
            lines.append(role_line)

        bullets = entry.get("bullets", [])
        if bullets:
            lines.append(r"\begin{itemize}")
            for b in bullets:
                text = b.get("text", "").strip()
                if text:
                    lines.append(r"    \item " + _esc(text))
            lines.append(r"\end{itemize}")

        lines.append("")

    return "\n".join(lines)


def _render_education(section: dict) -> str:
    lines = [r"\section*{Education}", ""]
    for entry in section.get("entries", []):
        fields = _get_entry_fields(entry)

        school = _esc(fields["company"])
        degree = _esc(fields["role"])
        dates = _esc(fields["dates"])

        school_line = r"\textbf{" + school + r"}"
        if dates:
            school_line += r" \hfill " + dates
        school_line += r" \\"
        lines.append(school_line)

        if degree:
            lines.append(degree)

        # bullets (honors, GPA, coursework)
        for b in entry.get("bullets", []):
            text = b.get("text", "").strip()
            if text:
                lines.append(_esc(text))

        lines.append("")

    return "\n".join(lines)


def _render_skills(section: dict) -> str:
    """Render skills as bold-category: items pairs, matching the LaTeX template style."""
    lines = [r"\section*{Technical Skills}", ""]
    skill_lines = []

    for entry in section.get("entries", []):
        # Each bullet may be "Category: items" or just a flat skill
        for b in entry.get("bullets", []):
            text = b.get("text", "").strip()
            if not text:
                continue
            # If "Category: items" format, bold the category
            if ":" in text:
                cat, _, items = text.partition(":")
                skill_lines.append(
                    r"\textbf{" + _esc(cat.strip()) + r":} " + _esc(items.strip())
                )
            else:
                skill_lines.append(_esc(text))

        # Also handle entry-level header as a skill line (no bullets)
        if not entry.get("bullets"):
            header = entry.get("header", "").strip() or entry.get("company", "").strip()
            if header:
                if ":" in header:
                    cat, _, items = header.partition(":")
                    skill_lines.append(
                        r"\textbf{" + _esc(cat.strip()) + r":} " + _esc(items.strip())
                    )
                else:
                    skill_lines.append(_esc(header))

    if skill_lines:
        lines.append(r" \\".join(skill_lines))

    return "\n".join(lines)


def _render_certifications(section: dict) -> str:
    """Render certifications as a comma-separated line or list."""
    lines = [r"\section*{Certifications}", ""]
    certs = []

    for entry in section.get("entries", []):
        header = entry.get("header", "").strip() or entry.get("company", "").strip()
        if header:
            certs.append(_esc(header))
        for b in entry.get("bullets", []):
            text = b.get("text", "").strip()
            if text:
                certs.append(_esc(text))

    if certs:
        lines.append(", ".join(certs))

    return "\n".join(lines)


def _render_generic_section(section: dict) -> str:
    title = _esc(section.get("title", "Section"))
    lines = [r"\section*{" + title + r"}", ""]

    for entry in section.get("entries", []):
        header = entry.get("header", "").strip()
        if header:
            lines.append(r"\textbf{" + _esc(header) + r"}")

        bullets = entry.get("bullets", [])
        if bullets:
            lines.append(r"\begin{itemize}")
            for b in bullets:
                text = b.get("text", "").strip()
                if text:
                    lines.append(r"    \item " + _esc(text))
            lines.append(r"\end{itemize}")
        lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Header parser for entry headers
# ---------------------------------------------------------------------------

def _parse_entry_header(header: str) -> dict:
    """
    Attempt to parse an entry header into company/role/dates/location.
    Handles common formats:
      "Company, Location | Role | Jan 2022 - Dec 2023"
      "Company\nRole\nDates"
      "Company • Role • Dates"
    """
    if not header:
        return {}

    # Try newline split (most structured)
    lines = [l.strip() for l in header.split("\n") if l.strip()]
    if len(lines) >= 2:
        # Guess: line 0 = company [+ location], line 1 = role [+ dates]
        company_part = lines[0]
        role_part = lines[1] if len(lines) > 1 else ""
        dates_part = lines[2] if len(lines) > 2 else ""

        # Split company from location by last comma or tab
        company, location = _split_company_location(company_part)
        role, dates = _split_role_dates(role_part)
        if not dates and dates_part:
            dates = dates_part

        return {"company": company, "role": role, "dates": dates, "location": location}

    # Try pipe/bullet split
    for sep in ["|", "•", "–", "-"]:
        if sep in header:
            parts = [p.strip() for p in header.split(sep)]
            if len(parts) >= 2:
                company, location = _split_company_location(parts[0])
                role = parts[1] if len(parts) > 1 else ""
                dates = parts[2] if len(parts) > 2 else ""
                return {"company": company, "role": role, "dates": dates, "location": location}

    # Fallback: treat whole string as company
    return {"company": header.strip()}


def _split_company_location(text: str) -> tuple:
    """Split 'Company, City, State' into company and location."""
    # Look for common US city/state patterns at the end
    location_pattern = re.compile(
        r",?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)?,\s*(?:[A-Z]{2}|United States|India|Canada|UK))\s*$"
    )
    m = location_pattern.search(text)
    if m:
        location = m.group(1).strip()
        company = text[: m.start()].strip().rstrip(",").strip()
        return company, location
    return text.strip(), ""


def _split_role_dates(text: str) -> tuple:
    """Split 'Software Engineer  Jan 2022 – Present' into role and dates."""
    date_pattern = re.compile(
        r"\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\w*\.?\s+\d{4}.*|(?:\d{4}\s*[-–]\s*(?:\d{4}|Present|present|Current|current)))"
    )
    m = date_pattern.search(text)
    if m:
        role = text[: m.start()].strip()
        dates = m.group(1).strip()
        return role, dates
    return text.strip(), ""


# ---------------------------------------------------------------------------
# Main LaTeX document builder
# ---------------------------------------------------------------------------

LATEX_PREAMBLE = r"""\documentclass[11pt]{article}

\usepackage[a4paper,margin=0.5in]{geometry}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{parskip}

\pagenumbering{gobble}

% Section formatting
\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{8pt}{4pt}

\setlist[itemize]{noitemsep, topsep=2pt, leftmargin=*}

\begin{document}
"""

LATEX_POSTAMBLE = r"""
\end{document}
"""


def build_latex(resume: dict) -> str:
    """Build a complete LaTeX document string from structured resume data."""
    body_parts = []

    # Header (name + contact)
    body_parts.append(_render_header(resume))
    body_parts.append("")

    # Summary
    summary_tex = _render_summary(resume)
    if summary_tex:
        body_parts.append(summary_tex)
        body_parts.append("")

    # Sections in order: experience, projects, education, skills, certifications, other
    section_order = ["experience", "projects", "education", "skills", "certifications", "other"]
    sections_by_type: Dict[str, list] = {}
    for section in resume.get("sections", []):
        stype = section.get("type", "other")
        sections_by_type.setdefault(stype, []).append(section)

    for stype in section_order:
        for section in sections_by_type.get(stype, []):
            if stype == "experience":
                body_parts.append(_render_experience(section))
            elif stype == "education":
                body_parts.append(_render_education(section))
            elif stype == "skills":
                body_parts.append(_render_skills(section))
            elif stype == "certifications":
                body_parts.append(_render_certifications(section))
            else:
                body_parts.append(_render_generic_section(section))
            body_parts.append("")

    return LATEX_PREAMBLE + "\n".join(body_parts) + LATEX_POSTAMBLE


# ---------------------------------------------------------------------------
# Compile LaTeX → PDF via tectonic
# ---------------------------------------------------------------------------

def compile_latex_to_pdf(latex_source: str) -> bytes:
    """
    Write LaTeX to a temp file, compile with tectonic, return PDF bytes.
    Raises RuntimeError if compilation fails.
    """
    tectonic_path = shutil.which("tectonic") or "/opt/homebrew/bin/tectonic"
    if not tectonic_path or not os.path.exists(tectonic_path):
        raise RuntimeError(
            "tectonic not found. Install with: brew install tectonic"
        )

    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "resume.tex")
        pdf_path = os.path.join(tmpdir, "resume.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_source)

        result = subprocess.run(
            [tectonic_path, "--outdir", tmpdir, tex_path],
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"LaTeX compilation failed:\n{result.stderr[-2000:]}"
            )

        if not os.path.exists(pdf_path):
            raise RuntimeError("tectonic ran but no PDF was produced.")

        with open(pdf_path, "rb") as f:
            return f.read()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_pdf_latex(resume_structured: dict, accepted_bullets: Dict[str, str]) -> bytes:
    """Entry point: apply bullets, build LaTeX, compile, return PDF bytes."""
    resume = _apply_bullets(resume_structured, accepted_bullets)
    latex_source = build_latex(resume)
    return compile_latex_to_pdf(latex_source)
