# tournament.api

Freefire tournament - Starter scaffold (Frontend + Backend)

यह repo BattleBounty / tournament.api का starter scaffold है। इसमें एक हल्का‑फुल्का frontend (Next.js) और backend (FastAPI) skeleton है जो Manual UPI (QR) payment proof upload workflow को संभालता है (admin approval)।

Important:
- कोई भी वास्तविक payment gateway keys या निजी credentials यहाँ शामिल नहीं हैं।
- Firebase config placeholders दिए गए हैं; अपनी keys .env.local में डालें।

Quick start (backend):
1. Python 3.10+ required
2. cd backend && python -m venv venv && source venv/bin/activate
3. pip install -r requirements.txt
4. export DATABASE_URL="sqlite:///./dev.db" (or use Postgres URL)
5. uvicorn app.main:app --reload --port 8000

Quick start (frontend):
1. cd frontend
2. npm install
3. copy .env.local.example to .env.local and fill Firebase config
4. npm run dev

Admin:
- Admin endpoints are protected by a simple ADMIN_EMAILS list in .env (comma separated). Replace with your admin email(s).

License: MIT
