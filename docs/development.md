# OpsPilot AI Development Guide

## Local Environment Setup

### Backend (Python & FastAPI)
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Activate virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run FastAPI dev server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
   ```

### Frontend (Next.js & React)
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run Next.js dev server:
   ```bash
   npm run dev
   ```
4. Open browser at `http://localhost:3000`.

---

## Running Automated Tests

Run backend unit and end-to-end integration tests:
```bash
python -m pytest tests/
```

---

## Running with Docker Compose

Build and launch backend, frontend, and PostgreSQL:
```bash
docker compose up --build
```
