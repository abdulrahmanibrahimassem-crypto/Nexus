import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from backend.database import Base

# ==========================================
# SQLAlchemy ORM Models
# ==========================================

class CourseModel(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=lambda: f"course-{uuid.uuid4().hex[:8]}")
    code = Column(String(20), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    color = Column(String(30), default="#06B6D4")
    semester = Column(String(50), default="Fall 2026")
    instructor = Column(String(100), default="Professor")
    target_grade = Column(String(10), default="A+")
    current_score = Column(Float, default=95.0)
    credits = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("DocumentModel", back_populates="course", cascade="all, delete-orphan")
    tasks = relationship("TaskModel", back_populates="course", cascade="all, delete-orphan")
    events = relationship("ScheduleEventModel", back_populates="course", cascade="all, delete-orphan")
    flashcards = relationship("FlashcardModel", back_populates="course", cascade="all, delete-orphan")
    quizzes = relationship("QuizModel", back_populates="course", cascade="all, delete-orphan")


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: f"doc-{uuid.uuid4().hex[:8]}")
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False) # 'pdf', 'pptx', 'notes'
    upload_date = Column(DateTime, default=datetime.utcnow)
    file_size = Column(String(50), default="0 KB")
    extracted_text = Column(Text, nullable=False)
    slide_count = Column(Integer, default=0)
    sections = Column(JSON, default=list) # [{'title': str, 'pageNumber': int, 'content': str}]
    summary = Column(Text, default="")
    key_topics = Column(JSON, default=list)

    course = relationship("CourseModel", back_populates="documents")


class FlashcardModel(Base):
    __tablename__ = "flashcards"

    id = Column(String, primary_key=True, default=lambda: f"fc-{uuid.uuid4().hex[:8]}")
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    document_id = Column(String, nullable=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    difficulty = Column(String(20), default="medium") # easy, medium, hard
    mastery_level = Column(Integer, default=0) # 0-5 Leitner box
    last_reviewed = Column(DateTime, nullable=True)
    tag = Column(String(50), default="General")

    course = relationship("CourseModel", back_populates="flashcards")


class QuizModel(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=lambda: f"quiz-{uuid.uuid4().hex[:8]}")
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    document_id = Column(String, nullable=True)
    title = Column(String(255), nullable=False)
    questions = Column(JSON, nullable=False) # list of question objects
    created_at = Column(DateTime, default=datetime.utcnow)
    best_score = Column(Float, default=0.0)
    total_attempts = Column(Integer, default=0)

    course = relationship("CourseModel", back_populates="quizzes")


class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: f"task-{uuid.uuid4().hex[:8]}")
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    task_type = Column(String(50), default="assignment") # assignment, reading, quiz_prep, review, sheet
    due_date = Column(String(50), nullable=False)
    estimated_minutes = Column(Integer, default=45)
    priority = Column(String(20), default="medium") # urgent, high, medium, low
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    study_technique_recommendation = Column(Text, nullable=True)

    course = relationship("CourseModel", back_populates="tasks")


class ScheduleEventModel(Base):
    __tablename__ = "schedule_events"

    id = Column(String, primary_key=True, default=lambda: f"ev-{uuid.uuid4().hex[:8]}")
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    event_type = Column(String(50), default="lecture") # lecture, lab, assignment, exam, study_session
    date = Column(String(50), nullable=False) # YYYY-MM-DD
    start_time = Column(String(20), nullable=False) # HH:mm
    end_time = Column(String(20), nullable=False) # HH:mm
    location = Column(String(100), default="Turing Hall")
    cognitive_load = Column(String(20), default="medium") # low, medium, high

    course = relationship("CourseModel", back_populates="events")


# ==========================================
# Pydantic Schemas (Request / Response validation)
# ==========================================

class CourseCreate(BaseModel):
    code: str
    name: str
    color: Optional[str] = "#06B6D4"
    semester: Optional[str] = "Fall 2026"
    instructor: Optional[str] = "Professor"
    target_grade: Optional[str] = "A+"
    credits: Optional[int] = 4

class CourseResponse(CourseCreate):
    id: str
    current_score: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    course_id: str
    filename: str
    file_type: str
    upload_date: datetime
    file_size: str
    extracted_text: str
    slide_count: int
    sections: List[Dict[str, Any]]
    summary: str
    key_topics: List[str]

    class Config:
        from_attributes = True


class FlashcardCreate(BaseModel):
    course_id: str
    document_id: Optional[str] = None
    front: str
    back: str
    difficulty: Optional[str] = "medium"
    tag: Optional[str] = "General"

class FlashcardResponse(FlashcardCreate):
    id: str
    mastery_level: int
    last_reviewed: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuizQuestionSchema(BaseModel):
    id: str
    question: str
    options: List[str]
    correctOptionIndex: int
    explanation: str
    conceptTested: str
    difficulty: str

class QuizCreate(BaseModel):
    course_id: str
    document_id: Optional[str] = None
    title: str
    questions: List[QuizQuestionSchema]

class QuizResponse(BaseModel):
    id: str
    course_id: str
    document_id: Optional[str] = None
    title: str
    questions: List[Dict[str, Any]]
    created_at: datetime
    best_score: float
    total_attempts: int

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    course_id: str
    title: str
    task_type: Optional[str] = "assignment"
    due_date: str
    estimated_minutes: Optional[int] = 45
    priority: Optional[str] = "medium"
    study_technique_recommendation: Optional[str] = None

class TaskUpdate(BaseModel):
    completed: Optional[bool] = None
    title: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None

class TaskResponse(TaskCreate):
    id: str
    completed: bool
    completed_at: Optional[datetime] = None
    ai_feedback: Optional[str] = None

    class Config:
        from_attributes = True
