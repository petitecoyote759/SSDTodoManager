# PMA-2026 — React frontend + Flask (SQLite) backend

This repository now contains a minimal React frontend (Vite) in `/frontend` and a Flask backend in `/backend` using SQLite.

Quick start (development):

Backend (Flask + SQLite):

1. Create and activate a virtualenv:

   python3 -m venv backend/.venv
   source backend/.venv/bin/activate

2. Install dependencies:

   pip install -r backend/requirements.txt

3. Run the backend (development server):

   python backend/app.py

The SQLite DB file is created at `backend/instance/app.db` and the API is available at http://localhost:5000/api/items

Frontend (React + Vite):

1. From the repo root, install deps and start dev server:

   cd frontend
   npm install
   npm run dev

Vite will serve the frontend at http://localhost:5173 by default. The React app calls the Flask API at http://localhost:5000/api/items.

API endpoints (Flask):
- GET /api/items => list items
- POST /api/items => create item (JSON: {"name": "...", "description": "..."})
- GET /api/items/<id> => get item
- PUT /api/items/<id> => update item
- DELETE /api/items/<id> => delete item

Notes:
- This is a development scaffold intended to be adapted to your needs.
- Keep the backend virtualenv isolated; do not commit virtualenv files.
- To run production servers, use a WSGI server (gunicorn/uvicorn) and configure appropriate production settings.
