def analyze_complaint(title: str, description: str):
    text = f"{title} {description}".lower()

    # Plumbing
    if any(word in text for word in [
        "water", "leak", "leaking", "pipe", "tap", "toilet"
    ]):
        category = "Plumbing"
        department = "Maintenance - Plumbing"

    # Electrical
    elif any(word in text for word in [
        "electric", "electricity", "light", "fan", "switch",
        "power", "wire", "socket"
    ]):
        category = "Electrical"
        department = "Maintenance - Electrical"

    # Network
    elif any(word in text for word in [
        "wifi", "wi-fi", "internet", "network", "router",
        "connection", "projector"
    ]):
        category = "Network / IT"
        department = "IT Support"

    # Furniture
    elif any(word in text for word in [
        "chair", "desk", "table", "bench", "furniture"
    ]):
        category = "Furniture"
        department = "Maintenance - Furniture"

    # Cleaning
    elif any(word in text for word in [
        "dirty", "clean", "garbage", "waste", "toilet",
        "unclean", "dust"
    ]):
        category = "Cleaning"
        department = "Housekeeping"

    else:
        category = "Infrastructure"
        department = "General Maintenance"

    # Severity / priority
    critical_words = [
        "heavily",
        "heavy leak",
        "heavy leakage",
        "major leak",
        "flood",
        "flooding",
        "fire",
        "spark",
        "electric shock",
        "dangerous",
        "burst pipe",
        "critical",
        "heavy"
    ]

    high_words = [
        "broken",
        "stopped",
        "not working",
        "failed",
        "leak",
        "leaking"
    ]

    if any(word in text for word in critical_words):
        severity = "Critical"
        priority = "Critical"
        suggested_action = "Immediate inspection and isolation of affected area"

    elif any(word in text for word in high_words):
        severity = "High"
        priority = "High"
        suggested_action = "Inspect and resolve the issue as soon as possible"

    else:
        severity = "Medium"
        priority = "Medium"
        suggested_action = "Schedule maintenance inspection"

    return {
        "category": category,
        "severity": severity,
        "priority": priority,
        "department": department,
        "suggested_action": suggested_action
    }