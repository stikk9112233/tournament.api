from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import tournaments, auth, users
from app.database import init_db
import os

# Agar aapne naya file backend/app/routes/forgot_password.py banaya hai,
# tab neeche wali import line ko rakhna; agar nahi banayi to is line ko hata do.
from app.routes.forgot_password import router as forgot_password_router

app = FastAPI(title="Tournament API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "tournament-api"}

# Initialize database
@app.on_event("startup")
async def startup():
    init_db()

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tournaments.router, prefix="/api/tournaments", tags=["tournaments"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

# Agar aapne backend/app/routes/forgot_password.py banaya hai to include karo.
# Agar auth.py mein already forgot/reset endpoints maujood hain to is line ki zarurat nahi.
app.include_router(forgot_password_router, prefix="/api/auth", tags=["auth"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
