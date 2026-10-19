<div align="center">

# 🏫 CivicFix

### AI-Powered Smart Campus Complaint & Maintenance Management System

*Faster fixes. Fair assignments. Full transparency.*


</div>

---

## 📖 Overview

**CivicFix** streamlines campus maintenance. Students and staff report problems, and the system uses AI to classify and prioritise each complaint, catch duplicates, assign the right staff member, monitor deadlines, and show administrators where problems keep happening.

## ✨ Features

| | Feature | Description |
|---|---|---|
| 📝 | **Complaint Management** | Register complaints and track them from submission to resolution |
| 🤖 | **AI Classification** | Automatically categorises and prioritises each complaint |
| 🔍 | **Duplicate Detection** | Spots repeated reports of the same issue |
| 👷 | **Smart Staff Assignment** | Assigns complaints to staff based on their current workload |
| ⏱️ | **SLA Monitoring** | Tracks resolution deadlines and escalates overdue complaints |
| 📊 | **Admin Dashboard** | Hotspot analytics and maintenance insights |
| 💬 | **PRAGYA Assistant** | Natural-language assistant for administrative queries |
| 📱 | **Responsive UI** | Works on desktop, tablet and mobile |

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React |
| **Backend** | Python, FastAPI |
| **Database** | SQLite with SQLAlchemy ORM |
| **AI / ML** | scikit-learn, NLP, TF-IDF, cosine similarity |
| **API Docs** | Swagger UI |

## 🧠 How the AI Works

- **Classification:** rule-based NLP reads the complaint text to decide its category and priority.
- **Duplicate detection:** TF-IDF vectors with cosine similarity compare a new complaint against existing ones.
- **Staff assignment:** workload-aware matching sends each complaint to a suitable, available staff member.
- **Analytics:** complaint data is summarised into hotspots and maintenance trends.

## ⏱️ SLA Policy

| Priority | Resolution Target |
|:---:|:---:|
| 🔴 Critical | 30 minutes |
| 🟠 High | 2 hours |
| 🟡 Medium | 8 hours |
| 🟢 Low | 24 hours |

Complaints that miss their target are escalated automatically.

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/officialmail2hari-hash/CivicFix.git
cd CivicFix
```

### 2. Set up the backend
```bash
pip install fastapi uvicorn sqlalchemy pydantic scikit-learn
cd backend
python -m uvicorn main:app --reload
```

| | URL |
|---|---|
| Backend API | http://127.0.0.1:8000 |
| Swagger docs | http://127.0.0.1:8000/docs |

### 3. Set up the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Objective

To improve campus maintenance efficiency, transparency and responsiveness through intelligent automation.

## 👩‍💻 Author

**Harishma M**, B.Sc Data Science
- GitHub: [officialmail2hari-hash](https://github.com/officialmail2hari-hash)
- Email: officialmail2hari@gmail.com
