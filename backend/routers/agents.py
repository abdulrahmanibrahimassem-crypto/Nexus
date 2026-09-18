from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from backend.database import get_db
from backend.models import DocumentModel, CourseModel, FlashcardModel, QuizModel, TaskModel
from backend.services.agents import (
    CourseStrategyAgent,
    TechniqueAgent,
    FlashcardAgent,
    QuizAgent,
    AdaptiveScheduleAgent
)

router = APIRouter(prefix="/api/ai", tags=["AI Study Agents"])

@router.post("/strategy")
def generate_course_strategy(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Triggers the CourseStrategyAgent to generate an A+ master roadmap for a specific course.
    """
    course_id = payload.get("courseId")
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first() if course_id else None
    
    course_name = course.name if course else payload.get("courseName", "General Course")
    course_code = course.code if course else payload.get("courseCode", "COURSE 101")

    # Aggregate extracted document context if available
    doc_context = ""
    if course:
        docs = db.query(DocumentModel).filter(DocumentModel.course_id == course.id).all()
        doc_context = "\n".join([f"Document {d.filename}: {d.summary}" for d in docs])

    strategy = CourseStrategyAgent.generate_strategy(
        course_name=course_name,
        course_code=course_code,
        syllabus_text=doc_context
    )
    return strategy


@router.post("/techniques")
def generate_techniques(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Triggers the TechniqueAgent to generate granular Active Recall, Feynman analogies, and Pomodoro plans for a document.
    """
    document_id = payload.get("documentId")
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first() if document_id else None

    title = doc.filename if doc else payload.get("documentTitle", "Lecture Notes")
    text = doc.extracted_text if doc else payload.get("text", "")
    course_code = payload.get("courseCode", "Study Topic")

    techniques = TechniqueAgent.generate_techniques(
        document_title=title,
        text=text,
        course_code=course_code
    )
    return techniques


@router.post("/flashcards/generate")
def generate_flashcards(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Triggers the FlashcardAgent to extract atomic, high-yield flashcards from document content.
    """
    text = payload.get("text", "")
    course_id = payload.get("courseId", "general")
    course_code = payload.get("courseCode", "General")
    count = payload.get("count", 5)

    cards = FlashcardAgent.generate_cards(text=text, course_code=course_code, count=count)
    return {"cards": cards}


@router.post("/quiz/generate")
def generate_quiz(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Triggers the QuizAgent to construct a diagnostic quiz with distractors and pedagogical grading rationales.
    """
    text = payload.get("text", "")
    title = payload.get("title", "Exam Diagnostic Quiz")
    course_code = payload.get("courseCode", "Course")
    count = payload.get("count", 3)

    quiz_data = QuizAgent.generate_quiz(text=text, title=title, course_code=course_code, count=count)
    return quiz_data


@router.post("/task-feedback")
def get_task_feedback(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Triggers AdaptiveScheduleAgent upon task completion to give analytical feedback and adjust future study load.
    """
    task_id = payload.get("taskId")
    task_title = payload.get("taskTitle", "Completed Academic Milestone")
    course_code = payload.get("courseCode", "Academic Focus")
    remaining_tasks_count = payload.get("remainingTasksCount", 3)

    feedback = AdaptiveScheduleAgent.process_task_completion(
        task_title=task_title,
        course_code=course_code,
        remaining_tasks_count=remaining_tasks_count
    )

    # If task exists in DB, update completed status and store feedback
    if task_id:
        t = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if t:
            t.completed = True
            t.ai_feedback = feedback.get("feedbackText")
            db.commit()

    return feedback
