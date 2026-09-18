import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.models import (
    CourseModel,
    TaskModel,
    ScheduleEventModel,
    CourseCreate,
    CourseResponse,
    TaskCreate,
    TaskResponse,
    TaskUpdate
)

router = APIRouter(prefix="/api", tags=["Schedule, Calendar & Adaptive Tasklist"])

# ==================== Courses ====================
@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(CourseModel).all()


@router.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = CourseModel(
        id=f"course-{uuid.uuid4().hex[:8]}",
        code=course.code,
        name=course.name,
        color=course.color,
        semester=course.semester,
        instructor=course.instructor,
        target_grade=course.target_grade,
        credits=course.credits
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


# ==================== Tasks ====================
@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(TaskModel).all()


@router.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = TaskModel(
        id=f"task-{uuid.uuid4().hex[:8]}",
        course_id=task.course_id,
        title=task.title,
        task_type=task.task_type,
        due_date=task.due_date,
        estimated_minutes=task.estimated_minutes,
        priority=task.priority,
        study_technique_recommendation=task.study_technique_recommendation
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, updates: TaskUpdate, db: Session = Depends(get_db)):
    t = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    if updates.completed is not None:
        t.completed = updates.completed
    if updates.title:
        t.title = updates.title
    if updates.due_date:
        t.due_date = updates.due_date
    if updates.priority:
        t.priority = updates.priority
    db.commit()
    db.refresh(t)
    return t


@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    t = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(t)
    db.commit()
    return {"message": "Task deleted"}


# ==================== Schedule Events ====================
@router.get("/schedule/events")
def get_schedule_events(db: Session = Depends(get_db)):
    events = db.query(ScheduleEventModel).all()
    return [
        {
            "id": e.id,
            "courseId": e.course_id,
            "title": e.title,
            "type": e.event_type,
            "date": e.date,
            "startTime": e.start_time,
            "endTime": e.end_time,
            "location": e.location,
            "cognitiveLoad": e.cognitive_load
        }
        for e in events
    ]
