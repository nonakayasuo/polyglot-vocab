"""Word explanation and analysis API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class ExplainWordRequest(BaseModel):
    """単語説明リクエスト"""

    word: str = Field(..., description="説明する単語")
    language: str = Field(default="english", description="単語の言語")
    user_level: str = Field(default="B1", description="ユーザーのCEFRレベル")
    context: str | None = Field(default=None, description="単語が使われた文脈（文章）")
    native_language: str = Field(default="japanese", description="説明を表示する言語")


class ExplainWordResponse(BaseModel):
    """単語説明レスポンス"""

    word: str
    pronunciation: str
    part_of_speech: str
    definition: str
    etymology: str | None = None
    synonyms: list[str] = []
    antonyms: list[str] = []
    examples: list[str] = []
    memory_tips: str | None = None
    usage_notes: str | None = None


class GenerateExamplesRequest(BaseModel):
    """例文生成リクエスト"""

    word: str = Field(..., description="例文を生成する単語")
    language: str = Field(default="english", description="単語の言語")
    user_level: str = Field(default="B1", description="ユーザーのCEFRレベル")
    count: int = Field(default=3, ge=1, le=10, description="生成する例文の数")
    context_type: str = Field(
        default="news", description="例文のコンテキスト（news, daily, business）"
    )


class GenerateExamplesResponse(BaseModel):
    """例文生成レスポンス"""

    word: str
    examples: list[dict]  # {"sentence": str, "translation": str}


@router.post("/explain", response_model=ExplainWordResponse)
async def explain_word(request: ExplainWordRequest):
    """
    単語の詳細な説明を生成します。

    - 発音、品詞、定義
    - 語源（可能な場合）
    - 類義語・反義語
    - 例文
    - 覚え方のコツ
    """
    from app.services.llm import get_llm_service

    try:
        llm = get_llm_service()
        result = await llm.explain_word(
            word=request.word,
            language=request.language,
            user_level=request.user_level,
            context=request.context,
            native_language=request.native_language,
        )
        return ExplainWordResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI処理エラー: {str(e)}")


@router.post("/examples", response_model=GenerateExamplesResponse)
async def generate_examples(request: GenerateExamplesRequest):
    """
    単語を使った例文を生成します。

    ユーザーのレベルに合わせた難易度で、
    ニュースコンテキストに基づいた自然な例文を生成します。
    """
    from app.services.llm import get_llm_service

    try:
        llm = get_llm_service()
        examples = await llm.generate_examples(
            word=request.word,
            language=request.language,
            user_level=request.user_level,
            count=request.count,
            context_type=request.context_type,
        )
        return GenerateExamplesResponse(word=request.word, examples=examples)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI処理エラー: {str(e)}")
