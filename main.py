from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ComplaintRequest
from ai import analyze_complaint
from database import SessionLocal, Staff, Complaint
from assignment import assign_staff
from duplicate import find_duplicate
from datetime import datetime, timedelta
from pragya import ask_pragya

app = FastAPI(
    title="CivicFix API",
    description="AI-Powered Smart Campus Complaint & Maintenance System"
)

# Allow Mahima's React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "CivicFix API is running"}


# =========================================================
# CREATE COMPLAINT
# =========================================================

@app.post("/complaints")
def create_complaint(request: ComplaintRequest):

    analysis = analyze_complaint(
        request.title,
        request.description
    )

    sla_minutes = {
        "Critical": 30,
        "High": 120,
        "Medium": 480,
        "Low": 1440
    }

    now = datetime.utcnow()

    deadline = now + timedelta(
        minutes=sla_minutes.get(
            analysis["priority"],
            480
        )
    )

    db = SessionLocal()

    # Duplicate detection
    duplicate = find_duplicate(
        db,
        request.title,
        request.description
    )

    # Smart staff assignment
    staff = assign_staff(
        db,
        analysis["department"],
        request.location
    )

    assigned_staff = staff.name if staff else "Unassigned"

    if staff:
        staff.active_complaints += 1

    complaint = Complaint(
        title=request.title,
        description=request.description,
        location=request.location,
        category=analysis["category"],
        severity=analysis["severity"],
        priority=analysis["priority"],
        department=analysis["department"],
        suggested_action=analysis["suggested_action"],
        status="New",
        reporter=request.reporter,
        assigned_staff=assigned_staff,
        sla_deadline=deadline,
        created_at=now
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    db.close()

    return {
        "success": True,

        "complaint_id": complaint.id,

        "complaint": {
            "title": complaint.title,
            "description": complaint.description,
            "location": complaint.location,
            "reporter": complaint.reporter
        },

        "ai_analysis": {
            "category": complaint.category,
            "severity": complaint.severity,
            "priority": complaint.priority,
            "department": complaint.department,
            "suggested_action": complaint.suggested_action
        },

        "sla": {
            "deadline": complaint.sla_deadline,
            "status": "Within SLA",
            "escalation": False
        },

        "assignment": {
            "staff": assigned_staff,
            "department": analysis["department"],
            "reason": (
                "Selected based on department, availability, "
                "workload and location"
            )
        },

        "duplicate_detection": duplicate
    }


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.get("/complaints")
def get_complaints():

    db = SessionLocal()

    complaints = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    result = []

    for c in complaints:

        now = datetime.utcnow()

        if c.status != "Resolved" and now > c.sla_deadline:

            sla_status = "Breached"
            escalation = True

            escalation_reason = (
                f"{c.priority} complaint exceeded its SLA deadline"
            )

        else:

            sla_status = "Within SLA"
            escalation = False

            escalation_reason = None

        result.append({

            "id": c.id,

            "title": c.title,

            "location": c.location,

            "category": c.category,

            "severity": c.severity,

            "priority": c.priority,

            "department": c.department,

            "status": c.status,

            "assigned_staff": c.assigned_staff,

            "sla_deadline": c.sla_deadline,

            "sla_status": sla_status,

            "escalation": escalation,

            "escalation_reason": escalation_reason,

            "created_at": c.created_at
        })

    db.close()

    return {
        "success": True,
        "total": len(result),
        "complaints": result
    }


# =========================================================
# UPDATE STATUS
# =========================================================

@app.put("/complaints/{complaint_id}/status")
def update_status(
    complaint_id: int,
    status: str
):

    allowed_statuses = [
        "New",
        "Assigned",
        "In Progress",
        "Resolved"
    ]

    if status not in allowed_statuses:

        return {
            "success": False,
            "message": "Invalid status",
            "allowed": allowed_statuses
        }

    db = SessionLocal()

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if not complaint:

        db.close()

        return {
            "success": False,
            "message": "Complaint not found"
        }

    complaint.status = status

    db.commit()

    db.close()

    return {
        "success": True,
        "complaint_id": complaint_id,
        "status": status
    }


# =========================================================
# DASHBOARD
# =========================================================

@app.get("/dashboard")
def dashboard():

    db = SessionLocal()

    complaints = db.query(Complaint).all()

    total = len(complaints)

    critical = sum(
        1 for c in complaints
        if c.priority == "Critical"
    )

    high = sum(
        1 for c in complaints
        if c.priority == "High"
    )

    new = sum(
        1 for c in complaints
        if c.status == "New"
    )

    assigned = sum(
        1 for c in complaints
        if c.status == "Assigned"
    )

    in_progress = sum(
        1 for c in complaints
        if c.status == "In Progress"
    )

    resolved = sum(
        1 for c in complaints
        if c.status == "Resolved"
    )

    now = datetime.utcnow()

    breached = sum(
        1 for c in complaints
        if c.status != "Resolved"
        and now > c.sla_deadline
    )

    staff = db.query(Staff).all()

    staff_workload = [

        {
            "name": s.name,
            "department": s.department,
            "active_complaints": s.active_complaints,
            "available": s.available
        }

        for s in staff
    ]

    db.close()

    return {

        "success": True,

        "summary": {

            "total": total,

            "critical": critical,

            "high": high,

            "new": new,

            "assigned": assigned,

            "in_progress": in_progress,

            "resolved": resolved,

            "sla_breached": breached
        },

        "staff_workload": staff_workload
    }


# =========================================================
# HOTSPOT / RECURRING ISSUE ANALYTICS
# =========================================================

@app.get("/analytics/hotspots")
def hotspots():

    db = SessionLocal()

    complaints = db.query(Complaint).all()

    location_counts = {}
    category_counts = {}

    for c in complaints:

        location_counts[c.location] = (
            location_counts.get(c.location, 0) + 1
        )

        category_counts[c.category] = (
            category_counts.get(c.category, 0) + 1
        )

    top_locations = sorted(
        location_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )

    top_categories = sorted(
        category_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )

    db.close()

    return {

        "success": True,

        "hotspots": [
            {
                "location": location,
                "complaint_count": count
            }
            for location, count in top_locations
        ],

        "recurring_categories": [
            {
                "category": category,
                "complaint_count": count
            }
            for category, count in top_categories
        ]
    }


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/test-db")
def test_db():

    db = SessionLocal()

    staff = db.query(Staff).all()

    result = [

        {
            "name": s.name,
            "department": s.department,
            "location": s.location,
            "available": s.available,
            "active_complaints": s.active_complaints
        }

        for s in staff
    ]

    db.close()

    return {
        "success": True,
        "staff": result
    }

@app.get("/pragya")
def pragya(question: str):
    return {
        "success": True,
        "question": question,
        "answer": ask_pragya(question)
    }