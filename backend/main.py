import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.router import api_router
from backend.utils.cleanup import purge_expired_sessions

# Background task to clean up old sessions every 10 minutes
async def periodic_cleanup():
    while True:
        try:
            purge_expired_sessions()
        except Exception:
            pass
        await asyncio.sleep(600)  # every 10 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: run immediate cleanup and start loop
    purge_expired_sessions()
    cleanup_task = asyncio.create_task(periodic_cleanup())
    yield
    # Shutdown: cancel task
    cleanup_task.cancel()

app = FastAPI(
    title="PDFly API",
    description="High-performance ephemeral PDF processing backend for PDFly",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "PDFly API is online.",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
