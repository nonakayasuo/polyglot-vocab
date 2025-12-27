"""Health check endpoints."""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "ai_providers": {
            "anthropic": settings.has_anthropic,
            "openai": settings.has_openai,
        },
    }
