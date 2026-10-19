from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./civicfix.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    location = Column(String)
    category = Column(String)
    severity = Column(String)
    priority = Column(String)
    department = Column(String)
    suggested_action = Column(String)
    status = Column(String, default="New")
    reporter = Column(String)
    assigned_staff = Column(String)
    sla_deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    department = Column(String)
    location = Column(String)
    available = Column(Boolean, default=True)
    active_complaints = Column(Integer, default=0)


Base.metadata.create_all(bind=engine)