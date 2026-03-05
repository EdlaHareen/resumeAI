from docx import Document
from io import BytesIO


def parse_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes. Returns raw text."""
    doc = Document(BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)
