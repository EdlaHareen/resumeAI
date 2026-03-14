import pdfplumber
from io import BytesIO


def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes. Returns raw text."""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        pages = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n\n".join(pages)
