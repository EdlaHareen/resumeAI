# ResumeAI

Tailor your resume for any job description. Upload a PDF or DOCX, paste a job description, and get a diff of AI-suggested bullet improvements. Accept, reject, or edit each change -- then download your tailored resume as PDF or DOCX.

## Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Vite
- **Backend:** Python FastAPI + Uvicorn
- **AI:** Claude Haiku (parse/analyze) + Sonnet (rewrite/validate) with OpenAI GPT fallback
- **Parsing:** pdfplumber (PDF), python-docx (DOCX)
- **Output:** reportlab (PDF), python-docx (DOCX)

## Setup

### 1. API Keys

Copy the `.env` file and add your keys:

```
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here  # optional fallback
```

Get a Claude key at https://console.anthropic.com

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at http://localhost:8000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## How it works

1. Upload your resume (PDF or DOCX)
2. Paste the job description
3. AI runs 4 stages: parse resume, analyze JD, rewrite bullets, validate (no hallucinations)
4. Review a side-by-side diff -- accept, reject, or edit each changed bullet
5. Download tailored resume as PDF or DOCX

## Privacy

Resumes are processed in memory with a 10-minute session TTL. Sessions are deleted immediately after download. Nothing is stored to disk or a database.

## API

- `GET /health` -- service status
- `POST /tailor` -- multipart: `resume_file` + `job_description`
- `POST /download/pdf` -- JSON: `{ session_id, accepted_bullets }`
- `POST /download/docx` -- JSON: `{ session_id, accepted_bullets }`
