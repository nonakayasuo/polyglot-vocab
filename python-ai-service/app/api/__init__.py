"""API Router configuration."""

from fastapi import APIRouter

from app.api.words import router as words_router
from app.api.articles import router as articles_router
from app.api.health import router as health_router

router = APIRouter()

# ルーター登録
router.include_router(health_router, tags=["Health"])
router.include_router(words_router, prefix="/words", tags=["Words"])
router.include_router(articles_router, prefix="/articles", tags=["Articles"])

__all__ = ["router"]
