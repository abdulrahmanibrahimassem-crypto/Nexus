import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base, SessionLocal
from backend.models import CourseModel, DocumentModel, FlashcardModel, TaskModel, ScheduleEventModel
from backend.routers import files, agents, schedule, spotify

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Study Nexus Backend API",
    description="AI-Powered Academic Command Center - FastAPI Core Service",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routers
app.include_router(files.router)
app.include_router(agents.router)
app.include_router(schedule.router)
app.include_router(spotify.router)

@app.on_event("startup")
def seed_initial_courses():
    """Seeds baseline academic courses if database is freshly created"""
    db = SessionLocal()
    try:
        count = db.query(CourseModel).count()
        if count == 0:
            sample_courses = [
                CourseModel(
                    id="course-cs301",
                    code="CS 301",
                    name="Advanced Algorithms & Complexity",
                    color="#06B6D4",
                    semester="Fall 2026",
                    instructor="Dr. Evelyn Vance",
                    target_grade="A+",
                    current_score=94.8,
                    credits=4
                ),
                CourseModel(
                    id="course-bio210",
                    code="BIO 210",
                    name="Molecular Genetics & CRISPR",
                    color="#10B981",
                    semester="Fall 2026",
                    instructor="Prof. Marcus Chen",
                    target_grade="A+",
                    current_score=92.4,
                    credits=4
                ),
                CourseModel(
                    id="course-phy140",
                    code="PHY 140",
                    name="Quantum Mechanics & Wave Functions",
                    color="#8B5CF6",
                    semester="Fall 2026",
                    instructor="Dr. Sarah Al-Mansoor",
                    target_grade="A+",
                    current_score=91.0,
                    credits=4
                ),
                CourseModel(
                    id="course-econ101",
                    code="ECON 101",
                    name="Macroeconomic Systems & Monetary Policy",
                    color="#F59E0B",
                    semester="Fall 2026",
                    instructor="Prof. Julian Thorne",
                    target_grade="A+",
                    current_score=96.2,
                    credits=3
                )
            ]
            db.add_all(sample_courses)
            db.commit()
            print("[Study Nexus] Initialized 4 core academic courses in database.")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "service": "Study Nexus Backend API",
        "status": "operational",
        "architecture": "FastAPI + SQLAlchemy + AI Agents + Document Parsers",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "study-nexus-core"}
