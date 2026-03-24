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

The easiest way to get started is using the **Universal Setup Wizard**. 
It handles your `.env` configuration, installs dependencies, and offers to run the project via Docker or locally.

### 1. One-Click Setup (Recommended)

Run the following command in the root directory:

```bash
python3 setup.py
```

Follow the prompts to enter your API keys. Once finished, choose **Option 1 (Docker)** to start the entire app instantly, or **Option 2** for a standard local installation.

### 2. Running with Docker Compose

If you've already configured your `.env` file, you can start the project with a single command:

```bash
docker-compose up --build
```

The frontend will be available at [http://localhost:5173](http://localhost:5173).

### 3. Manual Local Setup

If you prefer to run without Docker, follow the standard local installation:

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
PYTHONPATH=. python3 -m uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

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
