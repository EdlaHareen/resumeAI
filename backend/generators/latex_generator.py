"""
LaTeX resume generator — Jake's Resume format.
Renders structured resume data into a Jake's-style LaTeX document and compiles via tectonic.
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
    if not text:
        return ""
    result = text.replace("\\", r"\textbackslash{}")
    for char, replacement in _LATEX_SPECIAL.items():
        if char != "\\":
            result = result.replace(char, replacement)
    return result


def _esc_url(url: str) -> str:
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
# Section renderers — Jake's Resume macros
# ---------------------------------------------------------------------------

def _render_header(resume: dict) -> str:
    name = _esc(resume.get("name", ""))
    contact = resume.get("contact", {})
    email = contact.get("email", "")
    phone = _esc(contact.get("phone", ""))
    location = _esc(contact.get("location", ""))
    linkedin = contact.get("linkedin", "")
    github = contact.get("github", "")
    portfolio = contact.get("portfolio", "")

    # Build contact pipe-separated line
    parts = []
    if phone:
        parts.append(phone)
    if email:
        parts.append(
            r"\href{mailto:" + _esc_url(email) + r"}{\underline{" + _esc(email) + r"}}"
        )
    if linkedin:
        url = linkedin if linkedin.startswith("http") else "https://" + linkedin
        display = linkedin.replace("https://", "").replace("http://", "")
        parts.append(r"\href{" + _esc_url(url) + r"}{\underline{" + _esc(display) + r"}}")
    if github:
        url = github if github.startswith("http") else "https://" + github
        display = github.replace("https://", "").replace("http://", "")
        parts.append(r"\href{" + _esc_url(url) + r"}{\underline{" + _esc(display) + r"}}")
    if portfolio:
        url = portfolio if portfolio.startswith("http") else "https://" + portfolio
        display = portfolio.replace("https://", "").replace("http://", "")
        parts.append(r"\href{" + _esc_url(url) + r"}{\underline{" + _esc(display) + r"}}")

    contact_line = r" $|$ ".join(parts)

    lines = [
        r"\begin{center}",
        r"    {\Huge \scshape " + name + r"} \\ \vspace{1pt}",
    ]
    if location:
        lines.append(r"    \small " + location + r" $|$ " + contact_line + r" \\")
    elif contact_line:
        lines.append(r"    \small " + contact_line + r" \\")
    lines.append(r"\end{center}")
    return "\n".join(lines)


def _render_summary(resume: dict) -> str:
    summary = resume.get("summary", "")
    if not summary:
        return ""
    return "\n".join([
        r"\section{Summary}",
        r"\small " + _esc(summary),
    ])


def _get_entry_fields(entry: dict) -> dict:
    company = entry.get("company", "")
    role = entry.get("role", "")
    location = entry.get("location", "")
    dates = entry.get("dates", "")

    if not company:
        header_parts = _parse_entry_header(entry.get("header", ""))
        company = header_parts.get("company", entry.get("header", ""))
        role = role or header_parts.get("role", "")
        location = location or header_parts.get("location", "")
        dates = dates or header_parts.get("dates", "")

    return {"company": company, "role": role, "location": location, "dates": dates}


def _render_experience(section: dict) -> str:
    lines = [
        r"\section{Experience}",
        r"  \resumeSubHeadingListStart",
        r"",
    ]
    for entry in section.get("entries", []):
        fields = _get_entry_fields(entry)
        company = _esc(fields["company"])
        role = _esc(fields["role"])
        dates = _esc(fields["dates"])
        location = _esc(fields["location"])

        lines.append(
            r"    \resumeSubheading"
            + "\n      {" + company + "}{" + dates + "}"
            + "\n      {" + role + "}{" + location + "}"
        )

        bullets = [b for b in entry.get("bullets", []) if b.get("text", "").strip()]
        if bullets:
            lines.append(r"      \resumeItemListStart")
            for b in bullets:
                lines.append(r"        \resumeItem{" + _esc(b["text"].strip()) + "}")
            lines.append(r"      \resumeItemListEnd")
        lines.append("")

    lines.append(r"  \resumeSubHeadingListEnd")
    return "\n".join(lines)


def _render_education(section: dict) -> str:
    lines = [
        r"\section{Education}",
        r"  \resumeSubHeadingListStart",
        r"",
    ]
    for entry in section.get("entries", []):
        fields = _get_entry_fields(entry)
        school = _esc(fields["company"])
        degree = _esc(fields["role"])
        dates = _esc(fields["dates"])
        location = _esc(fields["location"])

        lines.append(
            r"    \resumeSubheading"
            + "\n      {" + school + "}{" + dates + "}"
            + "\n      {" + degree + "}{" + location + "}"
        )

        # Extra info lines (GPA, coursework etc.) as plain text bullets
        for b in entry.get("bullets", []):
            text = b.get("text", "").strip()
            if text:
                lines.append(r"      \resumeItemListStart")
                lines.append(r"        \resumeItem{" + _esc(text) + "}")
                lines.append(r"      \resumeItemListEnd")
        lines.append("")

    lines.append(r"  \resumeSubHeadingListEnd")
    return "\n".join(lines)


def _render_projects(section: dict) -> str:
    lines = [
        r"\section{Projects}",
        r"    \resumeSubHeadingListStart",
        r"",
    ]
    for entry in section.get("entries", []):
        fields = _get_entry_fields(entry)
        name = _esc(fields["company"] or entry.get("header", ""))
        # role field often holds tech stack for project entries
        stack = fields["role"]
        dates = _esc(fields["dates"])

        if stack:
            heading = r"\textbf{" + name + r"} $|$ \emph{" + _esc(stack) + r"}"
        else:
            heading = r"\textbf{" + name + r"}"

        lines.append(r"      \resumeProjectHeading")
        lines.append(r"          {" + heading + "}{" + dates + "}")

        bullets = [b for b in entry.get("bullets", []) if b.get("text", "").strip()]
        if bullets:
            lines.append(r"          \resumeItemListStart")
            for b in bullets:
                lines.append(r"            \resumeItem{" + _esc(b["text"].strip()) + "}")
            lines.append(r"          \resumeItemListEnd")
        lines.append("")

    lines.append(r"    \resumeSubHeadingListEnd")
    return "\n".join(lines)


def _render_skills(section: dict) -> str:
    skill_lines = []
    for entry in section.get("entries", []):
        for b in entry.get("bullets", []):
            text = b.get("text", "").strip()
            if not text:
                continue
            if ":" in text:
                cat, _, items = text.partition(":")
                skill_lines.append(
                    r"     \textbf{" + _esc(cat.strip()) + r"}{: " + _esc(items.strip()) + r"} \\"
                )
            else:
                skill_lines.append(_esc(text) + r" \\")

        if not entry.get("bullets"):
            header = (entry.get("header", "") or entry.get("company", "")).strip()
            if header:
                if ":" in header:
                    cat, _, items = header.partition(":")
                    skill_lines.append(
                        r"     \textbf{" + _esc(cat.strip()) + r"}{: " + _esc(items.strip()) + r"} \\"
                    )
                else:
                    skill_lines.append(_esc(header) + r" \\")

    if not skill_lines:
        return ""

    lines = [
        r"\section{Technical Skills}",
        r" \begin{itemize}[leftmargin=0.15in, label={}]",
        r"    \small{\item{",
    ]
    lines += skill_lines
    lines += [
        r"    }}",
        r" \end{itemize}",
    ]
    return "\n".join(lines)


def _render_certifications(section: dict) -> str:
    certs = []
    for entry in section.get("entries", []):
        header = (entry.get("header", "") or entry.get("company", "")).strip()
        if header:
            certs.append(_esc(header))
        for b in entry.get("bullets", []):
            text = b.get("text", "").strip()
            if text:
                certs.append(_esc(text))

    if not certs:
        return ""

    return "\n".join([
        r"\section{Certifications}",
        ", ".join(certs),
    ])


def _render_generic_section(section: dict) -> str:
    title = _esc(section.get("title", "Section"))
    lines = [
        r"\section{" + title + r"}",
        r"  \resumeSubHeadingListStart",
        r"",
    ]
    for entry in section.get("entries", []):
        header = (entry.get("header", "") or entry.get("company", "")).strip()
        if header:
            lines.append(r"    \item \textbf{" + _esc(header) + r"}")

        bullets = [b for b in entry.get("bullets", []) if b.get("text", "").strip()]
        if bullets:
            lines.append(r"      \resumeItemListStart")
            for b in bullets:
                lines.append(r"        \resumeItem{" + _esc(b["text"].strip()) + "}")
            lines.append(r"      \resumeItemListEnd")
        lines.append("")

    lines.append(r"  \resumeSubHeadingListEnd")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Entry header parser
# ---------------------------------------------------------------------------

def _parse_entry_header(header: str) -> dict:
    if not header:
        return {}

    lines = [l.strip() for l in header.split("\n") if l.strip()]
    if len(lines) >= 2:
        company_part = lines[0]
        role_part = lines[1] if len(lines) > 1 else ""
        dates_part = lines[2] if len(lines) > 2 else ""
        company, location = _split_company_location(company_part)
        role, dates = _split_role_dates(role_part)
        if not dates and dates_part:
            dates = dates_part
        return {"company": company, "role": role, "dates": dates, "location": location}

    for sep in ["|", "•", "–", "-"]:
        if sep in header:
            parts = [p.strip() for p in header.split(sep)]
            if len(parts) >= 2:
                company, location = _split_company_location(parts[0])
                role = parts[1] if len(parts) > 1 else ""
                dates = parts[2] if len(parts) > 2 else ""
                return {"company": company, "role": role, "dates": dates, "location": location}

    return {"company": header.strip()}


def _split_company_location(text: str) -> tuple:
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
# Jake's Resume preamble
# ---------------------------------------------------------------------------

LATEX_PREAMBLE = r"""\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section heading: small-caps, left-aligned, followed by titlerule
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
%-------------------------------------------

\begin{document}
"""

LATEX_POSTAMBLE = "\n%-------------------------------------------\n\\end{document}\n"


# ---------------------------------------------------------------------------
# Main LaTeX document builder
# ---------------------------------------------------------------------------

def build_latex(resume: dict) -> str:
    body_parts = []

    body_parts.append(_render_header(resume))

    summary_tex = _render_summary(resume)
    if summary_tex:
        body_parts.append(summary_tex)

    section_order = ["experience", "projects", "education", "skills", "certifications", "other"]
    sections_by_type: Dict[str, list] = {}
    for section in resume.get("sections", []):
        stype = section.get("type", "other")
        sections_by_type.setdefault(stype, []).append(section)

    for stype in section_order:
        for section in sections_by_type.get(stype, []):
            if stype == "experience":
                tex = _render_experience(section)
            elif stype == "education":
                tex = _render_education(section)
            elif stype == "projects":
                tex = _render_projects(section)
            elif stype == "skills":
                tex = _render_skills(section)
            elif stype == "certifications":
                tex = _render_certifications(section)
            else:
                tex = _render_generic_section(section)
            if tex:
                body_parts.append(tex)

    result = LATEX_PREAMBLE
    for i, part in enumerate(body_parts):
        result += part
        if i < len(body_parts) - 1:
            result += "\n\n"
    result += LATEX_POSTAMBLE
    return result


# ---------------------------------------------------------------------------
# Compile LaTeX → PDF via tectonic
# ---------------------------------------------------------------------------

def compile_latex_to_pdf(latex_source: str) -> bytes:
    tectonic_path = shutil.which("tectonic") or "/opt/homebrew/bin/tectonic"
    if not tectonic_path or not os.path.exists(tectonic_path):
        raise RuntimeError("tectonic not found. Install with: brew install tectonic")

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
            raise RuntimeError(f"LaTeX compilation failed:\n{result.stderr[-2000:]}")

        if not os.path.exists(pdf_path):
            raise RuntimeError("tectonic ran but no PDF was produced.")

        with open(pdf_path, "rb") as f:
            return f.read()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_pdf_latex(resume_structured: dict, accepted_bullets: Dict[str, str]) -> bytes:
    resume = _apply_bullets(resume_structured, accepted_bullets)
    latex_source = build_latex(resume)
    return compile_latex_to_pdf(latex_source)
