from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Tournament API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Import and include route blueprints
from app.routes import auth, forgot_password, users, tournaments, payments, wallet, leaderboard

app.include_router(auth.router)
app.include_router(forgot_password.router)
app.include_router(users.router)
app.include_router(tournaments.router)
app.include_router(payments.router)
app.include_router(wallet.router)
app.include_router(leaderboard.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "tournament-api"}

@app.get("/api/test")
def test():
    return {"message": "API is working!", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
