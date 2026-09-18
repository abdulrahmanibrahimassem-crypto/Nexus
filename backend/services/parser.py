import io
import re
from typing import Dict, Any, List

def extract_text_from_pdf(file_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text and structured page sections from PDF files using pdfplumber with PyPDF2 fallback.
    """
    sections = []
    full_text_parts = []
    total_pages = 0

    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            total_pages = len(pdf.pages)
            for page_idx, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    full_text_parts.append(f"--- Page {page_idx + 1} ---\n{page_text}")
                    # Extract top line as title candidate
                    lines = [l.strip() for l in page_text.splitlines() if l.strip()]
                    title = lines[0][:80] if lines else f"Page {page_idx + 1}"
                    sections.append({
                        "title": title,
                        "pageNumber": page_idx + 1,
                        "content": page_text[:1200],
                        "keyPoints": [l for l in lines[1:5] if len(l) > 15][:3]
                    })
    except Exception as e:
        # Fallback to PyPDF2
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            total_pages = len(reader.pages)
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    full_text_parts.append(f"--- Page {page_idx + 1} ---\n{page_text}")
                    lines = [l.strip() for l in page_text.splitlines() if l.strip()]
                    title = lines[0][:80] if lines else f"Page {page_idx + 1}"
                    sections.append({
                        "title": title,
                        "pageNumber": page_idx + 1,
                        "content": page_text[:1200],
                        "keyPoints": [l for l in lines[1:5] if len(l) > 15][:3]
                    })
        except Exception as fallback_err:
            raise RuntimeError(f"PDF extraction failed: {str(e)} | Fallback: {str(fallback_err)}")

    full_text = "\n\n".join(full_text_parts)
    key_topics = _extract_keywords(full_text)

    return {
        "text": full_text,
        "page_count": total_pages,
        "sections": sections,
        "key_topics": key_topics,
        "summary": _generate_rule_based_summary(full_text)
    }


def extract_text_from_pptx(file_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts structured slides, bullet points, titles, and speaker notes from PPTX files using python-pptx.
    """
    from pptx import Presentation

    prs = Presentation(io.BytesIO(file_bytes))
    sections = []
    full_text_parts = []
    total_slides = len(prs.slides)

    for slide_idx, slide in enumerate(prs.slides):
        slide_title = f"Slide {slide_idx + 1}"
        slide_texts = []

        for shape in slide.shapes:
            if shape.has_text_frame:
                for paragraph in shape.text_frame.paragraphs:
                    text = paragraph.text.strip()
                    if text:
                        slide_texts.append(text)

        # Check if slide has a distinct title shape
        if slide.shapes.title and slide.shapes.title.text.strip():
            slide_title = slide.shapes.title.text.strip()

        # Check notes
        notes_text = ""
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes_text = slide.notes_slide.notes_text_frame.text.strip()

        joined_content = "\n".join(slide_texts)
        if notes_text:
            joined_content += f"\n[Speaker Notes]: {notes_text}"

        full_text_parts.append(f"=== Slide {slide_idx + 1}: {slide_title} ===\n{joined_content}")

        sections.append({
            "title": f"Slide {slide_idx + 1}: {slide_title}",
            "pageNumber": slide_idx + 1,
            "content": joined_content[:1200],
            "keyPoints": [t for t in slide_texts if len(t) > 15 and t != slide_title][:3]
        })

    full_text = "\n\n".join(full_text_parts)
    key_topics = _extract_keywords(full_text)

    return {
        "text": full_text,
        "page_count": total_slides,
        "sections": sections,
        "key_topics": key_topics,
        "summary": _generate_rule_based_summary(full_text)
    }


def _extract_keywords(text: str) -> List[str]:
    """Heuristic keyword and concept extraction from parsed academic text"""
    words = re.findall(r'\b[A-Z][a-z]{3,}(?:\s+[A-Z][a-z]{3,})*\b', text)
    stopwords = {"Chapter", "Lecture", "Figure", "Table", "Section", "Course", "University", "Introduction", "Summary"}
    filtered = [w for w in words if w not in stopwords and len(w) > 4]
    
    # Count frequency and pick top 6 unique
    freq = {}
    for w in filtered:
        freq[w] = freq.get(w, 0) + 1
    sorted_keywords = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)
    return sorted_keywords[:8] if sorted_keywords else ["Core Concept", "Key Principles", "Methodology"]


def _generate_rule_based_summary(text: str) -> str:
    """Creates a concise 2-sentence summary anchor from the text"""
    sentences = re.split(r'(?<=[.!?]) +', text.strip())
    substantive = [s.strip() for s in sentences if len(s.strip()) > 30 and not s.startswith("---") and not s.startswith("===")]
    if len(substantive) >= 2:
        return f"{substantive[0]} {substantive[1]}"
    elif substantive:
        return substantive[0]
    return "Structured academic study materials parsed and prepared for AI study agents."
