from database import SessionLocal, Complaint, Staff


def ask_pragya(question: str):

    db = SessionLocal()
    q = question.lower()

    complaints = db.query(Complaint).all()
    staff = db.query(Staff).all()

    # 1. Critical complaints
    if "critical" in q:
        results = [
            c for c in complaints
            if c.priority == "Critical"
            and c.status != "Resolved"
        ]

        answer = f"There are {len(results)} open critical complaints."

        if results:
            details = [
                f"#{c.id} - {c.title} ({c.location})"
                for c in results[:5]
            ]
            answer += " " + ", ".join(details) + "."

        db.close()
        return answer

    # 2. SLA breached
    if "sla" in q or "breached" in q or "overdue" in q:

        from datetime import datetime

        breached = [
            c for c in complaints
            if c.status != "Resolved"
            and datetime.utcnow() > c.sla_deadline
        ]

        answer = f"There are {len(breached)} complaints with an SLA breach."

        if breached:
            details = [
                f"#{c.id} - {c.title} ({c.priority})"
                for c in breached[:5]
            ]
            answer += " " + ", ".join(details) + "."

        db.close()
        return answer

    # 3. Department workload
    if "department" in q or "departments" in q:

        department_counts = {}

        for c in complaints:
            if c.status != "Resolved":
                department_counts[c.department] = (
                    department_counts.get(c.department, 0) + 1
                )

        if department_counts:
            top = max(
                department_counts,
                key=department_counts.get
            )

            count = department_counts[top]

            answer = (
                f"{top} currently has the highest open workload "
                f"with {count} complaints."
            )
        else:
            answer = "There are no open complaints."

        db.close()
        return answer

    # 4. Location hotspot
    if "location" in q or "block" in q or "hotspot" in q:

        location_counts = {}

        for c in complaints:
            location_counts[c.location] = (
                location_counts.get(c.location, 0) + 1
            )

        if location_counts:

            top = max(
                location_counts,
                key=location_counts.get
            )

            count = location_counts[top]

            answer = (
                f"{top} has the highest number of complaints "
                f"with {count} reported issues."
            )

        else:
            answer = "There is not enough complaint data yet."

        db.close()
        return answer

    # 5. Arun assignment explanation
    if "arun" in q or "assigned" in q:

        arun = next(
            (
                s for s in staff
                if "arun" in s.name.lower()
            ),
            None
        )

        if arun:

            answer = (
                f"{arun.name} is assigned based on department, "
                f"availability, location and workload. "
                f"He belongs to {arun.department}, "
                f"is currently "
                f"{'available' if arun.available else 'unavailable'}, "
                f"and has {arun.active_complaints} active complaints."
            )

        else:
            answer = "No matching staff member was found."

        db.close()
        return answer

    # 6. Total complaints
    if "how many" in q or "total" in q:

        open_count = sum(
            1 for c in complaints
            if c.status != "Resolved"
        )

        answer = (
            f"CivicFix currently has {len(complaints)} total complaints, "
            f"of which {open_count} are still open."
        )

        db.close()
        return answer

    db.close()

    return (
        "I can help with complaints, SLA breaches, "
        "departments, hotspots, staff workload and assignments."
    )