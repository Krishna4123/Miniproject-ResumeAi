from flask import Flask, request, jsonify
from flask_cors import CORS
import os, tempfile
from pdfminer.high_level import extract_text as pdf_extract_text
import docx
import re
import spacy
from rapidfuzz import fuzz, process

nlp = spacy.load("en_core_web_sm")

app = Flask(__name__)
CORS(app)

# -------- Skill catalog (expand as you like) --------
SKILL_DB = {
    "programming": [
        "python","java","javascript","typescript","c++","c","golang","rust","php","ruby","matlab",
    ],
    "frontend": [
        "react","vite","next.js","redux","html","css","sass","tailwind","bootstrap","webpack",
    ],
    "backend": [
        "node.js","express","django","flask","spring","fastapi","graphql","rest","microservices",
    ],
    "data": [
        "sql","mysql","postgresql","mongodb","pandas","numpy","scikit-learn","tensorflow","pytorch","nlp","opencv",
    ],
    "devops": [
        "docker","kubernetes","aws","azure","gcp","ci/cd","jenkins","terraform","linux","nginx",
    ],
    "soft": [
        "communication","leadership","teamwork","problem solving","time management","agile","scrum",
    ],
}

# Flatten a normalized skill set
CANON_SKILLS = sorted({s.lower() for cat in SKILL_DB.values() for s in cat})

# -------- Helpers --------
def extract_text_from_file(path, filename):
    name = filename.lower()
    if name.endswith(".pdf"):
        return pdf_extract_text(path) or ""
    if name.endswith(".docx"):
        doc = docx.Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    # naive fallback (txt/doc)
    with open(path, "rb") as f:
        data = f.read()
    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""

SECTION_HEADS = [
    "education","experience","work experience","skills","projects",
    "personal information","contact","achievements","certifications","summary","objective"
]

def split_sections(text):
    lines = [l.strip() for l in text.splitlines()]
    buckets = {}
    current = "summary"
    buckets[current] = []

    def looks_like_heading(line):
        low = line.lower()
        if low in SECTION_HEADS: return True
        if re.match(r"^[A-Z][A-Z \-/&]{2,}$", line): return True  # ALLCAPS
        return False

    for ln in lines:
        if not ln: continue
        if looks_like_heading(ln):
            key = ln.lower()
            # map common variants
            if "work" in key and "experience" in key: key = "experience"
            if "personal" in key or "contact" in key: key = "personal information"
            if key not in buckets: buckets[key] = []
            current = key
        else:
            buckets.setdefault(current, []).append(ln)

    # join
    for k in list(buckets.keys()):
        buckets[k] = "\n".join(buckets[k]).strip()

    # normalize standard keys
    sections = {
        "summary": buckets.get("summary",""),
        "education": buckets.get("education",""),
        "experience": buckets.get("experience",""),
        "skills": buckets.get("skills",""),
        "projects": buckets.get("projects",""),
        "personal_info": buckets.get("personal information",""),
        "certifications": buckets.get("certifications",""),
    }
    return sections

def extract_personal_info(text):
    email = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    phone = re.search(r"(\+?\d[\d \-()]{7,}\d)", text)
    doc = nlp(text)
    name = None
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break
    return {
        "name": name,
        "email": email.group(0) if email else None,
        "phone": phone.group(0) if phone else None,
    }

def normalize_token(token):
    return token.lower().strip()

def extract_skills(text):
    text_low = text.lower()
    # seed from explicit Skills section
    skills_block = split_sections(text).get("skills","").lower()
    candidates = set()

    # dictionary match
    for skill in CANON_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", text_low):
            candidates.add(skill)

    # add tokens from skills section (loose)
    for tok in re.findall(r"[a-zA-Z\+\.#]{2,}[\w\+\.#-]*", skills_block):
        tok = normalize_token(tok)
        if len(tok) < 2: continue
        # fuzzy match to known skills
        match, score, _ = process.extractOne(tok, CANON_SKILLS, scorer=fuzz.token_set_ratio)
        if score >= 90:
            candidates.add(match)

    # pack by categories
    categories = {cat: [] for cat in SKILL_DB.keys()}
    for cat, words in SKILL_DB.items():
        for w in words:
            if w.lower() in candidates:
                categories[cat].append(w.lower())

    flat = sorted(candidates)
    return {"by_category": categories, "all": flat}

# Simple rules: map skill clusters to job roles with required/core skills
ROLE_TEMPLATES = [
    {
        "title": "Frontend Developer",
        "must_have": ["javascript","react","html","css"],
        "nice_to_have": ["typescript","redux","vite","tailwind","webpack"]
    },
    {
        "title": "Backend Developer (Node.js)",
        "must_have": ["node.js","express","javascript"],
        "nice_to_have": ["mongodb","sql","rest","docker","aws"]
    },
    {
        "title": "Data Analyst",
        "must_have": ["python","pandas","numpy","sql"],
        "nice_to_have": ["scikit-learn","excel","tableau"]
    },
    {
        "title": "Machine Learning Engineer",
        "must_have": ["python","numpy","pandas","scikit-learn"],
        "nice_to_have": ["tensorflow","pytorch","nlp","docker","aws"]
    },
    {
        "title": "DevOps Engineer",
        "must_have": ["linux","docker","ci/cd"],
        "nice_to_have": ["kubernetes","aws","terraform","nginx"]
    },
]

def score_role(skills_all, must_have, nice_to_have):
    s = set(skills_all)
    if not set(must_have).issubset(s):
        return 0.0
    core = len(set(must_have))
    core_hit = len(set(must_have) & s)
    nice_hit = len(set(nice_to_have) & s)
    return min(1.0, 0.6 * (core_hit/core) + 0.4 * (nice_hit / max(1, len(nice_to_have))))

def suggest_roles(skills_all):
    scored = []
    for role in ROLE_TEMPLATES:
        score = score_role(skills_all, role["must_have"], role["nice_to_have"])
        if score > 0:
            scored.append({
                "title": role["title"],
                "score": round(score, 3),
                "description": f"Match based on skills: must {role['must_have']}, plus {role['nice_to_have']}"
            })
    # sort by score desc
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:8]

@app.route("/predict", methods=["POST"])
def predict():
    if "resume" not in request.files:
        return jsonify({"error": "No file part 'resume'"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # save temp, extract, cleanup
    fd, path = tempfile.mkstemp()
    os.close(fd)
    try:
        file.save(path)
        text = extract_text_from_file(path, file.filename)
        sections = split_sections(text)

        # personal info (from entire text for higher recall)
        pinfo = extract_personal_info(text)

        # skills
        skills = extract_skills(text)
        roles = suggest_roles(skills["all"])

        # TODO (optional): integrate a legit job API provider here
        jobs = [
            {
                "title": r["title"],
                "score": r["score"],
                "description": r["description"],
                "source": "local-matcher",
            } for r in roles
        ]

        return jsonify({
            "extracted_text_preview": text[:1200],     # just a preview
            "sections": sections,                      # education/skills/experience/personal_info/...
            "personal_info": pinfo,
            "skills": skills,
            "matches": jobs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try: os.remove(path)
        except Exception: pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
