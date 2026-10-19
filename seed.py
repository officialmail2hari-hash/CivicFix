from database import SessionLocal, Staff

db = SessionLocal()

staff_members = [
    Staff(
        name="Arun Kumar",
        department="Maintenance - Plumbing",
        location="Block B",
        available=True,
        active_complaints=1
    ),
    Staff(
        name="Priya S",
        department="Maintenance - Electrical",
        location="Block A",
        available=True,
        active_complaints=2
    ),
    Staff(
        name="Karthik R",
        department="IT Support",
        location="Block B",
        available=True,
        active_complaints=0
    ),
    Staff(
        name="Meena P",
        department="Housekeeping",
        location="Block C",
        available=True,
        active_complaints=3
    )
]

db.add_all(staff_members)
db.commit()
db.close()

print("Staff seeded successfully!")