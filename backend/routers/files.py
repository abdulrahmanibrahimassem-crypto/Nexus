import uuid
import os
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.models import DocumentModel, CourseModel, DocumentResponse
from backend.services.parser import extract_text_from_pdf, extract_text_from_pptx

router = APIRouter(prefix="/api/files", tags=["Files & Document Ingestion"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    course_id: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Ingests PDF and PPTX files assigned to a specific course, parses text and structural sections.
    """
    # Verify course exists
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course with ID {course_id} not found.")

    filename = file.filename or "uploaded_file"
    ext = filename.split(".")[-1].lower()

    if ext not in ["pdf", "pptx", "txt"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '.{ext}'. Only PDF (.pdf) and PowerPoint (.pptx) are supported."
        )

    content_bytes = await file.read()
    file_size_kb = len(content_bytes) / 1024
    file_size_str = f"{file_size_kb / 1024:.1f} MB" if file_size_kb > 1000 else f"{file_size_kb:.0f} KB"

    # Extract text and sections
    try:
        if ext == "pdf":
            parsed = extract_text_from_pdf(content_bytes)
            file_type = "pdf"
        elif ext == "pptx":
            parsed = extract_text_from_pptx(content_bytes)
            file_type = "pptx"
        else:
            text = content_bytes.decode("utf-8", errors="ignore")
            parsed = {
                "text": text,
                "page_count": 1,
                "sections": [{"title": "Document Content", "pageNumber": 1, "content": text[:1000]}],
                "key_topics": ["Academic Notes"],
                "summary": text[:200]
            }
            file_type = "notes"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    new_doc = DocumentModel(
        id=doc_id,
        course_id=course.id,
        filename=filename,
        file_type=file_type,
        file_size=file_size_str,
        extracted_text=parsed["text"],
        slide_count=parsed.get("page_count", 1),
        sections=parsed.get("sections", []),
        summary=parsed.get("summary", ""),
        key_topics=parsed.get("key_topics", [])
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return new_doc


@router.get("/course/{course_id}", response_model=List[DocumentResponse])
def get_documents_by_course(course_id: str, db: Session = Depends(get_db)):
    """Retrieves all parsed documents belonging to a specific course"""
    return db.query(DocumentModel).filter(DocumentModel.course_id == course_id).all()


@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    """Deletes a document by ID"""
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": f"Document {doc_id} deleted successfully"}
