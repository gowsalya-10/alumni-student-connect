from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, student

app = FastAPI(title="Alumni Impact Hub API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(student.router)
from routers import roadmap, resume, alumni, mentorship, notifications
app.include_router(roadmap.router)
app.include_router(resume.router)
app.include_router(alumni.router)
app.include_router(mentorship.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": "Alumni Impact Hub API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
