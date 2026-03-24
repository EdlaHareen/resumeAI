from __future__ import annotations
"""
LaTeX cover letter generator.
Renders AI-generated cover letter data into a professionally formatted PDF
matching the user's LaTeX cover letter template exactly.
"""

from generators.latex_generator import _esc, _esc_url, compile_latex_to_pdf


def _latex_preamble() -> list:
    return [
        r"\documentclass[11pt,a4paper]{article}",
        r"\usepackage[utf8]{inputenc}",
        r"\usepackage[T1]{fontenc}",
        r"\usepackage{geometry}",
        r"\geometry{margin=1in}",
        r"\usepackage{xcolor}",
        r"\usepackage{hyperref}",
        r"\usepackage{parskip}",
        r"",
        r"\definecolor{primary}{RGB}{0, 79, 144}",
        r"\hypersetup{",
        r"    colorlinks=true,",
        r"    linkcolor=primary,",
        r"    filecolor=primary,",
        r"    urlcolor=primary,",
        r"}",
        r"",
        r"\begin{document}",
        r"\pagestyle{empty}",
        r"",
    ]


def _build_header_block(resume_summary: dict) -> tuple[list, str]:
    """Build a centered header matching the template style."""
    contact = resume_summary.get("contact", {})
    name = _esc(resume_summary.get("name", ""))
    email = contact.get("email", "")
    phone = _esc(contact.get("phone", ""))
    location = _esc(contact.get("location", ""))
    linkedin = contact.get("linkedin", "")

    email_link = (
        r"\href{mailto:" + _esc_url(email) + r"}{" + _esc(email) + r"}"
        if email else ""
    )
    if linkedin:
        linkedin_url = linkedin if linkedin.startswith("http") else "https://" + linkedin
        linkedin_display = _esc(linkedin.replace("https://", "").replace("http://", ""))
        linkedin_link = r"\href{" + _esc_url(linkedin_url) + r"}{" + linkedin_display + r"}"
    else:
        linkedin_link = ""

    # Address line in darkgray
    address_line = (
        r"\textcolor{darkgray}{" + location + r"} \\"
        if location else ""
    )

    # Contact bar: email | phone | linkedin with \quad|\quad separators
    contact_parts = [p for p in [email_link, phone, linkedin_link] if p]
    contact_bar = r" \quad|\quad ".join(contact_parts)

    lines = [
        r"\begin{center}",
        r"    {\Huge \textbf{" + name + r"}}\\[0.8em]",
    ]
    if address_line:
        lines.append(r"    " + address_line)
    if contact_bar:
        lines.append(r"    " + contact_bar)
    lines.append(r"\end{center}")

    return lines, name


def _build_body(
    name: str,
    hiring_manager: str,
    job_title: str,
    company_name: str,
    paragraphs: list,
) -> list:
    hm = hiring_manager or "Hiring Manager"
    recipient_parts = []
    if hm:
        recipient_parts.append(r"\textbf{" + _esc(hm) + r"} \\")
    if job_title:
        recipient_parts.append(_esc(job_title) + r" \\")
    if company_name:
        recipient_parts.append(_esc(company_name) + r" \\")

    lines = [
        r"\vspace{2.5em}",
        r"",
        r"\today",
        r"",
        r"\vspace{1.5em}",
        r"",
        r"\noindent",
    ]
    lines += recipient_parts
    lines += [
        r"",
        r"\vspace{2em}",
        r"",
        r"\noindent",
        r"Dear " + _esc(hm) + r",",
        r"",
    ]
    lines += paragraphs
    lines += [
        r"",
        r"\vspace{2em}",
        r"",
        r"\noindent",
        r"Sincerely, \\[1.5em]",
        r"\textbf{" + name + r"}",
        r"",
        r"\end{document}",
    ]
    return lines


def build_cover_letter_latex(resume_summary: dict, cover_data: dict) -> str:
    """Build LaTeX from structured AI output (4 named paragraphs)."""
    header_lines, name = _build_header_block(resume_summary)

    hiring_manager = cover_data.get("hiring_manager", "Hiring Manager")
    company_name = cover_data.get("company_name", "")
    job_title = cover_data.get("job_title", "")

    paragraphs = [
        _esc(cover_data.get(f"paragraph{i}", ""))
        for i in range(1, 5)
    ]
    paragraphs = [p for p in paragraphs if p.strip()]

    lines = (
        _latex_preamble()
        + header_lines
        + _build_body(name, hiring_manager, job_title, company_name, paragraphs)
    )
    return "\n".join(lines)


def build_cover_letter_latex_from_text(
    resume_summary: dict,
    body_text: str,
    hiring_manager: str,
    company_name: str,
    job_title: str,
) -> str:
    """Build LaTeX from free-form body text (supports user-edited content)."""
    header_lines, name = _build_header_block(resume_summary)

    paragraphs = [
        _esc(p.strip())
        for p in body_text.split("\n\n")
        if p.strip()
    ]

    lines = (
        _latex_preamble()
        + header_lines
        + _build_body(name, hiring_manager, job_title, company_name, paragraphs)
    )
    return "\n".join(lines)


def generate_cover_letter_pdf(resume_summary: dict, cover_data: dict) -> bytes:
    """Compile structured cover letter to PDF bytes via tectonic."""
    latex_source = build_cover_letter_latex(resume_summary, cover_data)
    return compile_latex_to_pdf(latex_source)


def generate_cover_letter_pdf_from_text(
    resume_summary: dict,
    body_text: str,
    hiring_manager: str,
    company_name: str,
    job_title: str,
) -> bytes:
    """Compile free-form (possibly user-edited) cover letter to PDF bytes."""
    latex_source = build_cover_letter_latex_from_text(
        resume_summary, body_text, hiring_manager, company_name, job_title
    )
    return compile_latex_to_pdf(latex_source)
