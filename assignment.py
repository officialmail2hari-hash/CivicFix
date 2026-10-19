def assign_staff(db, department, location):

    from database import Staff

    # Prefer staff from the same department and location
    staff = (
        db.query(Staff)
        .filter(
            Staff.department == department,
            Staff.available == True
        )
        .order_by(Staff.active_complaints.asc())
        .all()
    )

    if not staff:
        return None

    # Prefer matching location
    location_matches = [
        s for s in staff
        if s.location.lower() in location.lower()
        or location.lower() in s.location.lower()
    ]

    if location_matches:
        return location_matches[0]

    return staff[0]