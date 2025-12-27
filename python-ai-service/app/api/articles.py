"""Article analysis API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class AnalyzeDifficultyRequest(BaseModel):
    """記事難易度分析リクエスト"""

    content: str = Field(..., description="分析する記事の本文")
    language: str = Field(default="english", description="記事の言語")


class AnalyzeDifficultyResponse(BaseModel):
    """記事難易度分析レスポンス"""

    cefr_level: str  # A1, A2, B1, B2, C1, C2
    difficulty_score: float  # 0.0 - 1.0
    vocabulary_level: str
    grammar_complexity: str
    average_sentence_length: float
    difficult_words: list[dict]  # {"word": str, "definition": str}
    reading_time_minutes: int


class SummarizeArticleRequest(BaseModel):
    """記事要約リクエスト"""

    content: str = Field(..., description="要約する記事の本文")
    language: str = Field(default="english", description="記事の言語")
    user_level: str = Field(default="B1", description="ユーザーのCEFRレベル")
    target_language: str = Field(default="japanese", description="要約を表示する言語")


class SummarizeArticleResponse(BaseModel):
    """記事要約レスポンス"""

    summary: str
    key_points: list[str]
    main_topic: str
    vocabulary_to_learn: list[dict]  # {"word": str, "definition": str}


class ExtractVocabularyRequest(BaseModel):
    """語彙抽出リクエスト"""

    content: str = Field(..., description="語彙を抽出する記事の本文")
    language: str = Field(default="english", description="記事の言語")
    user_level: str = Field(default="B1", description="ユーザーのCEFRレベル")
    max_words: int = Field(default=10, ge=1, le=50, description="抽出する最大単語数")


class ExtractVocabularyResponse(BaseModel):
    """語彙抽出レスポンス"""

    words: list[dict]  # {"word": str, "definition": str, "cefr_level": str, "sentence": str}


@router.post("/analyze-difficulty", response_model=AnalyzeDifficultyResponse)
async def analyze_difficulty(request: AnalyzeDifficultyRequest):
    """
    記事の難易度を分析します。

    - CEFRレベルの判定
    - 語彙レベルの評価
    - 文法複雑度の評価
    - 難しい単語のリストアップ
    """
    from app.services.llm import get_llm_service

    try:
        llm = get_llm_service()
        result = await llm.analyze_article_difficulty(
            content=request.content,
            language=request.language,
        )
        return AnalyzeDifficultyResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI処理エラー: {str(e)}")


@router.post("/summarize", response_model=SummarizeArticleResponse)
async def summarize_article(request: SummarizeArticleRequest):
    """
    記事を要約します。

    ユーザーのレベルに合わせた難易度で要約を生成し、
    学習すべき語彙もピックアップします。
    """
    from app.services.llm import get_llm_service

    try:
        llm = get_llm_service()
        result = await llm.summarize_article(
            content=request.content,
            language=request.language,
            user_level=request.user_level,
            target_language=request.target_language,
        )
        return SummarizeArticleResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI処理エラー: {str(e)}")


@router.post("/extract-vocabulary", response_model=ExtractVocabularyResponse)
async def extract_vocabulary(request: ExtractVocabularyRequest):
    """
    記事から学習すべき語彙を抽出します。

    ユーザーのレベルに適した語彙を選択し、
    記事内での使用例とともに返します。
    """
    from app.services.llm import get_llm_service

    try:
        llm = get_llm_service()
        result = await llm.extract_vocabulary(
            content=request.content,
            language=request.language,
            user_level=request.user_level,
            max_words=request.max_words,
        )
        return ExtractVocabularyResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI処理エラー: {str(e)}")
