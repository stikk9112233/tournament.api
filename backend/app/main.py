from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.database import init_db

app = FastAPI(title="Tournament API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Import and include route blueprints
try:
    from app.routes.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
except Exception as e:
    print(f"Auth router error: {e}")

try:
    from app.routes.users import router as users_router
    app.include_router(users_router, prefix="/api/users", tags=["users"])
except Exception as e:
    print(f"Users router error: {e}")

try:
    from app.routes.tournaments import router as tournaments_router
    app.include_router(tournaments_router, tags=["tournaments"])
except Exception as e:
    print(f"Tournaments router error: {e}")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "tournament-api"}

@app.get("/api/test")
def test():
    return {"message": "API is working!", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
