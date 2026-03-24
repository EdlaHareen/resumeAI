# ResumeAI

Tailor your resume for any job description. Upload a PDF or DOCX, paste a job description, and get a diff of AI-suggested bullet improvements. Accept, reject, or edit each change -- then download your tailored resume as PDF or DOCX.

## Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Vite
- **Backend:** Python FastAPI + Uvicorn
- **AI:** Claude Haiku (parse/analyze) + Sonnet (rewrite/validate)
- **Parsing:** pdfplumber (PDF), python-docx (DOCX)
- **Output:** Tectonic/LaTeX (Primary PDF), ReportLab (Fallback PDF), python-docx (DOCX)
- **Persistence:** Supabase (Auth, Storage, Database)

## Setup

### 1. API Keys

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Add your keys to `.env`:
- `ANTHROPIC_API_KEY`: Get one at [console.anthropic.com](https://console.anthropic.com)
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: From your Supabase project settings.

### 2. Backend

The backend requires Python 3.9 or higher.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. python3 -m uvicorn main:app --reload --port 8000
```

> [!IMPORTANT]
> Always run with `PYTHONPATH=.` to ensure internal modules are correctly imported.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at [http://localhost:5173](http://localhost:5173) and proxy API requests to the backend on port 8000.

## Troubleshooting

### Python Compatibility Errors
If you see `TypeError: unsupported operand type(s) for |: 'type' and 'NoneType'`, it means you are running a Python version older than 3.10 and a file is missing `from __future__ import annotations`. 
**Fix:** Ensure `from __future__ import annotations` is at the very top of the failing file.

### Backend Port Mismatch
If the frontend shows 500 errors or fails to connect, check `frontend/vite.config.ts`. The proxy target must match the backend port (default 8000).

### Missing Supabase Functions
If tailored resumes are not visible or downloads fail, ensure your `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `.env`. This key is required for storage and database access.

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for guidelines on maintaining compatibility and adding new features.
