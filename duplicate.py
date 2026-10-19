from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def find_duplicate(db, title, description):

    from database import Complaint

    complaints = db.query(Complaint).all()

    if not complaints:
        return None

    new_text = f"{title} {description}"

    existing_texts = [
        f"{c.title} {c.description}"
        for c in complaints
    ]

    texts = [new_text] + existing_texts

    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform(texts)

    similarities = cosine_similarity(
        vectors[0:1],
        vectors[1:]
    )[0]

    best_index = similarities.argmax()
    best_score = similarities[best_index]

    # 70% similarity = possible duplicate
    if best_score >= 0.70:
        return {
            "is_duplicate": True,
            "similarity": round(float(best_score), 2),
            "complaint_id": complaints[best_index].id
        }

    return {
        "is_duplicate": False,
        "similarity": round(float(best_score), 2),
        "complaint_id": None
    }