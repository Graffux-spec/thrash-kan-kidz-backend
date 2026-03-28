"""
Routes package initialization
"""
from fastapi import APIRouter

# Create the main API router
api_router = APIRouter(prefix="/api")

# Import and include all route modules
from .cards import router as cards_router
from .users import router as users_router
from .spin import router as spin_router
from .goals import router as goals_router
from .trades import router as trades_router
from .payments import router as payments_router

# Include all routers
api_router.include_router(cards_router, tags=["cards"])
api_router.include_router(users_router, tags=["users"])
api_router.include_router(spin_router, tags=["spin"])
api_router.include_router(goals_router, tags=["goals"])
api_router.include_router(trades_router, tags=["trades"])
api_router.include_router(payments_router, tags=["payments"])
