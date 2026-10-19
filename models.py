from pydantic import BaseModel
from typing import Optional


class ComplaintRequest(BaseModel):
    title: str
    description: str
    location: str
    category: Optional[str] = None
    reporter: Optional[str] = None


class ComplaintAnalysis(BaseModel):
    category: str
    severity: str
    priority: str
    department: str
    suggested_action: str