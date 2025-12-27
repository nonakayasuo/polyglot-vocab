---
sidebar_position: 6
title: MCP統合
---


## 概要

Model Context Protocol (MCP) を**Python**で実装し、AIアシスタント機能を実現します。
ニュースコンテンツと連携した、パーソナライズド語学学習体験を提供します。

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NewsLingua MCP エコシステム                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │   ユーザー   │────▶│  AIチューター │────▶│   学習効果   │           │
│  │             │     │             │     │   最大化     │           │
│  └─────────────┘     └──────┬──────┘     └─────────────┘           │
│                              │                                       │
│                              ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Python MCP Server (FastAPI)                       │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │ Vocab   │ │ Grammar │ │ Reading │ │ Progress│            │  │
│  │  │ Tools   │ │ Tools   │ │ Tools   │ │ Tools   │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │ News    │ │ Level   │ │ Recommend│ │ Adaptive│            │  │
│  │  │ Tools   │ │ Tools   │ │ Tools   │ │ Tools   │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Resources                                  │  │
│  │  • User Profile  • Learning History  • Word Database         │  │
│  │  • News Articles • Grammar Rules    • CEFR Levels            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## プロジェクト構成

```
python-ai-service/
├── app/
│   ├── main.py                     # FastAPIエントリーポイント
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── explain.py          # 単語・文法説明API
│   │       ├── examples.py         # 例文生成API
│   │       ├── analyze.py          # 記事分析API
│   │       ├── assess.py           # レベル判定API
│   │       └── recommend.py        # レコメンドAPI
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py               # MCPサーバー
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── vocabulary.py       # 語彙ツール
│   │   │   ├── grammar.py          # 文法ツール
│   │   │   ├── reading.py          # リーディングツール
│   │   │   ├── news.py             # ニュースツール
│   │   │   └── progress.py         # 進捗ツール
│   │   └── resources.py            # MCPリソース定義
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm.py                  # LLM統合（Claude/GPT）
│   │   ├── news_processor.py       # ニュース処理
│   │   ├── difficulty.py           # 難易度判定
│   │   ├── assessment.py           # レベル判定
│   │   └── vector_search.py        # ベクトル検索
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py              # Pydanticスキーマ
│   └── core/
│       ├── __init__.py
│       ├── config.py               # 設定
│       └── security.py             # JWT検証
├── tests/
│   ├── __init__.py
│   ├── test_tools.py
│   └── test_api.py
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

## MCP Server 実装

### メインサーバー

```python
# app/mcp/server.py
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.types import Tool, TextContent, Resource
import mcp.server.stdio

from .tools.vocabulary import VocabularyTools
from .tools.grammar import GrammarTools
from .tools.reading import ReadingTools
from .tools.news import NewsTools
from .tools.progress import ProgressTools

# MCPサーバー初期化
server = Server("newslingua-ai")

# ツールクラスのインスタンス化
vocab_tools = VocabularyTools()
grammar_tools = GrammarTools()
reading_tools = ReadingTools()
news_tools = NewsTools()
progress_tools = ProgressTools()


@server.list_tools()
async def list_tools() -> list[Tool]:
    """利用可能なMCPツール一覧"""
    return [
        # 語彙ツール
        vocab_tools.explain_word_tool(),
        vocab_tools.generate_examples_tool(),
        vocab_tools.analyze_related_words_tool(),
        
        # 文法ツール
        grammar_tools.explain_grammar_tool(),
        grammar_tools.correct_grammar_tool(),
        
        # リーディングツール
        reading_tools.analyze_difficulty_tool(),
        reading_tools.summarize_article_tool(),
        reading_tools.extract_vocabulary_tool(),
        
        # ニュースツール
        news_tools.recommend_articles_tool(),
        news_tools.find_similar_articles_tool(),
        
        # 進捗ツール
        progress_tools.analyze_progress_tool(),
        progress_tools.suggest_next_lesson_tool(),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """ツール実行"""
    
    # 語彙ツール
    if name == "explain_word":
        result = await vocab_tools.explain_word(**arguments)
    elif name == "generate_examples":
        result = await vocab_tools.generate_examples(**arguments)
    elif name == "analyze_related_words":
        result = await vocab_tools.analyze_related_words(**arguments)
    
    # 文法ツール
    elif name == "explain_grammar":
        result = await grammar_tools.explain_grammar(**arguments)
    elif name == "correct_grammar":
        result = await grammar_tools.correct_grammar(**arguments)
    
    # リーディングツール
    elif name == "analyze_difficulty":
        result = await reading_tools.analyze_difficulty(**arguments)
    elif name == "summarize_article":
        result = await reading_tools.summarize_article(**arguments)
    elif name == "extract_vocabulary":
        result = await reading_tools.extract_vocabulary(**arguments)
    
    # ニュースツール
    elif name == "recommend_articles":
        result = await news_tools.recommend_articles(**arguments)
    elif name == "find_similar_articles":
        result = await news_tools.find_similar_articles(**arguments)
    
    # 進捗ツール
    elif name == "analyze_progress":
        result = await progress_tools.analyze_progress(**arguments)
    elif name == "suggest_next_lesson":
        result = await progress_tools.suggest_next_lesson(**arguments)
    
    else:
        raise ValueError(f"Unknown tool: {name}")
    
    return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False))]


@server.list_resources()
async def list_resources() -> list[Resource]:
    """利用可能なMCPリソース一覧"""
    return [
        Resource(
            uri="newslingua://user/{user_id}/profile",
            name="User Profile",
            description="ユーザープロファイル情報",
            mimeType="application/json",
        ),
        Resource(
            uri="newslingua://user/{user_id}/vocabulary",
            name="User Vocabulary",
            description="ユーザーの単語帳データ",
            mimeType="application/json",
        ),
        Resource(
            uri="newslingua://user/{user_id}/progress",
            name="Learning Progress",
            description="学習進捗データ",
            mimeType="application/json",
        ),
        Resource(
            uri="newslingua://articles/{language}/recent",
            name="Recent Articles",
            description="最新のニュース記事",
            mimeType="application/json",
        ),
        Resource(
            uri="newslingua://articles/{language}/recommended",
            name="Recommended Articles",
            description="レベルに合った推奨記事",
            mimeType="application/json",
        ),
    ]


async def main():
    """MCPサーバー起動"""
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="newslingua-ai",
                server_version="1.0.0",
            ),
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

## MCP Tools 実装

### 1. 語彙ツール

```python
# app/mcp/tools/vocabulary.py
from mcp.types import Tool
from pydantic import BaseModel
from typing import Optional

from ..services.llm import LLMService
from ..services.vector_search import VectorSearchService


class VocabularyTools:
    """語彙学習ツール"""
    
    def __init__(self):
        self.llm = LLMService()
        self.vector_search = VectorSearchService()
    
    def explain_word_tool(self) -> Tool:
        return Tool(
            name="explain_word",
            description="単語の詳細な説明を生成（語源、使い方、類義語、コロケーション含む）",
            inputSchema={
                "type": "object",
                "properties": {
                    "word": {
                        "type": "string",
                        "description": "説明する単語",
                    },
                    "language": {
                        "type": "string",
                        "enum": ["en", "es", "ko", "zh", "fr", "de"],
                        "description": "対象言語",
                    },
                    "user_level": {
                        "type": "string",
                        "enum": ["A1", "A2", "B1", "B2", "C1", "C2"],
                        "description": "ユーザーのCEFRレベル",
                    },
                    "context": {
                        "type": "string",
                        "description": "単語が使われた文脈（ニュース記事の文など）",
                    },
                },
                "required": ["word", "language"],
            },
        )
    
    async def explain_word(
        self,
        word: str,
        language: str,
        user_level: str = "B2",
        context: Optional[str] = None,
    ) -> dict:
        """単語説明を生成"""
        
        prompt = f"""
        以下の単語について、{user_level}レベルの学習者向けに詳しく説明してください。
        
        単語: {word}
        言語: {language}
        {"文脈: " + context if context else ""}
        
        以下の形式でJSON出力してください:
        - pronunciation: 発音記号
        - meanings: 意味のリスト（各意味に definition と usage を含む）
        - etymology: 語源情報
        - synonyms: 類義語（ニュアンスの違いも）
        - antonyms: 対義語
        - collocations: よく使われる組み合わせ
        - examples: 例文（{user_level}レベルに適した難易度）
        - memory_tip: 覚え方のコツ
        """
        
        result = await self.llm.generate_json(prompt)
        return result
    
    def generate_examples_tool(self) -> Tool:
        return Tool(
            name="generate_examples",
            description="単語を使った自然な例文を生成（ニュースコンテキストで）",
            inputSchema={
                "type": "object",
                "properties": {
                    "word": {"type": "string"},
                    "count": {"type": "integer", "default": 3},
                    "difficulty": {
                        "type": "string",
                        "enum": ["A1", "A2", "B1", "B2", "C1", "C2"],
                    },
                    "topic": {
                        "type": "string",
                        "description": "ニューストピック（政治、経済、科学など）",
                    },
                    "include_translation": {"type": "boolean", "default": True},
                },
                "required": ["word"],
            },
        )
    
    async def generate_examples(
        self,
        word: str,
        count: int = 3,
        difficulty: str = "B2",
        topic: Optional[str] = None,
        include_translation: bool = True,
    ) -> dict:
        """例文生成"""
        
        # 類似の実際のニュース記事から例文を探す
        similar_contexts = await self.vector_search.find_word_contexts(word, limit=3)
        
        prompt = f"""
        単語「{word}」を使った自然な例文を{count}個生成してください。
        
        条件:
        - 難易度: {difficulty}レベル
        - トピック: {topic or "一般ニュース"}
        - 実際のニュース記事で使われそうな文体
        
        参考（実際のニュースでの使用例）:
        {similar_contexts}
        
        各例文には以下を含めてください:
        - sentence: 例文
        - translation: 日本語訳（{"含む" if include_translation else "不要"}）
        - topic: ニュースカテゴリ
        - notes: 文法・用法のポイント
        """
        
        result = await self.llm.generate_json(prompt)
        return {"word": word, "examples": result}
    
    def analyze_related_words_tool(self) -> Tool:
        return Tool(
            name="analyze_related_words",
            description="類義語と対義語を分析し、ニュアンスの違いを説明",
            inputSchema={
                "type": "object",
                "properties": {
                    "word": {"type": "string"},
                    "language": {"type": "string"},
                    "focus_on": {
                        "type": "string",
                        "enum": ["synonyms", "antonyms", "both"],
                        "default": "both",
                    },
                },
                "required": ["word", "language"],
            },
        )
    
    async def analyze_related_words(
        self,
        word: str,
        language: str,
        focus_on: str = "both",
    ) -> dict:
        """関連語分析"""
        # 実装省略
        pass
```

### 2. ニュースツール

```python
# app/mcp/tools/news.py
from mcp.types import Tool
from typing import Optional

from ..services.vector_search import VectorSearchService
from ..services.difficulty import DifficultyAnalyzer


class NewsTools:
    """ニュース関連ツール"""
    
    def __init__(self):
        self.vector_search = VectorSearchService()
        self.difficulty = DifficultyAnalyzer()
    
    def recommend_articles_tool(self) -> Tool:
        return Tool(
            name="recommend_articles",
            description="ユーザーのレベルと興味に基づいてニュース記事を推薦",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "language": {"type": "string"},
                    "user_level": {
                        "type": "string",
                        "enum": ["A1", "A2", "B1", "B2", "C1", "C2"],
                    },
                    "categories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "興味のあるカテゴリ（政治、経済、科学、スポーツなど）",
                    },
                    "count": {"type": "integer", "default": 5},
                },
                "required": ["user_id", "language", "user_level"],
            },
        )
    
    async def recommend_articles(
        self,
        user_id: str,
        language: str,
        user_level: str,
        categories: Optional[list[str]] = None,
        count: int = 5,
    ) -> dict:
        """ユーザーに最適な記事を推薦"""
        
        # ユーザーの既読記事、単語帳を考慮
        user_context = await self._get_user_context(user_id)
        
        # レベルに適した記事をベクトル検索
        articles = await self.vector_search.find_articles(
            language=language,
            cefr_level=user_level,
            categories=categories,
            exclude_ids=user_context["read_article_ids"],
            limit=count,
        )
        
        # 各記事に学習ポイントを付加
        enriched_articles = []
        for article in articles:
            vocabulary = await self._extract_learning_vocabulary(
                article, user_context["known_words"]
            )
            enriched_articles.append({
                **article,
                "learning_words": vocabulary[:5],
                "estimated_reading_time": self._estimate_reading_time(article),
                "difficulty_match": self._calculate_difficulty_match(
                    article["cefr_level"], user_level
                ),
            })
        
        return {
            "user_level": user_level,
            "recommendations": enriched_articles,
        }
    
    def find_similar_articles_tool(self) -> Tool:
        return Tool(
            name="find_similar_articles",
            description="読んだ記事に類似したニュース記事を検索",
            inputSchema={
                "type": "object",
                "properties": {
                    "article_id": {"type": "string"},
                    "user_level": {"type": "string"},
                    "count": {"type": "integer", "default": 3},
                },
                "required": ["article_id"],
            },
        )
    
    async def find_similar_articles(
        self,
        article_id: str,
        user_level: Optional[str] = None,
        count: int = 3,
    ) -> dict:
        """類似記事検索"""
        similar = await self.vector_search.find_similar_articles(
            article_id=article_id,
            user_level=user_level,
            limit=count,
        )
        return {"source_article_id": article_id, "similar_articles": similar}
```

### 3. リーディングツール

```python
# app/mcp/tools/reading.py
from mcp.types import Tool

from ..services.difficulty import DifficultyAnalyzer
from ..services.llm import LLMService


class ReadingTools:
    """リーディング学習ツール"""
    
    def __init__(self):
        self.difficulty = DifficultyAnalyzer()
        self.llm = LLMService()
    
    def analyze_difficulty_tool(self) -> Tool:
        return Tool(
            name="analyze_difficulty",
            description="記事の難易度を分析してCEFRレベルを判定",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {"type": "string", "description": "記事本文"},
                    "language": {"type": "string"},
                },
                "required": ["content", "language"],
            },
        )
    
    async def analyze_difficulty(self, content: str, language: str) -> dict:
        """記事難易度分析"""
        analysis = await self.difficulty.analyze(content, language)
        
        return {
            "cefr_level": analysis.cefr_level,
            "readability_score": analysis.readability_score,
            "vocabulary": {
                "total_words": analysis.total_words,
                "unique_words": analysis.unique_words,
                "advanced_words": analysis.advanced_words,
                "difficult_words": [
                    {"word": w.word, "meaning": w.meaning, "frequency": w.frequency}
                    for w in analysis.difficult_words[:10]
                ],
            },
            "grammar": {
                "complexity": analysis.grammar_complexity,
                "advanced_structures": analysis.advanced_structures,
            },
            "estimated_reading_time": analysis.estimated_time,
        }
    
    def extract_vocabulary_tool(self) -> Tool:
        return Tool(
            name="extract_vocabulary",
            description="記事から学習すべき語彙を抽出",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {"type": "string"},
                    "language": {"type": "string"},
                    "user_level": {"type": "string"},
                    "count": {"type": "integer", "default": 10},
                },
                "required": ["content", "language", "user_level"],
            },
        )
    
    async def extract_vocabulary(
        self,
        content: str,
        language: str,
        user_level: str,
        count: int = 10,
    ) -> dict:
        """学習語彙抽出"""
        
        # 記事から語彙を抽出
        words = await self.difficulty.extract_vocabulary(content, language)
        
        # ユーザーレベルに適したものをフィルタ
        target_words = [
            w for w in words
            if self._is_appropriate_level(w.cefr_level, user_level)
        ][:count]
        
        # 各単語に詳細情報を付加
        enriched = []
        for word in target_words:
            explanation = await self.llm.quick_explain(word.word, language)
            enriched.append({
                "word": word.word,
                "context": word.context,
                "meaning": explanation.meaning,
                "pronunciation": explanation.pronunciation,
                "importance": word.importance_score,
            })
        
        return {
            "article_vocabulary": enriched,
            "total_extracted": len(words),
        }
    
    def summarize_article_tool(self) -> Tool:
        return Tool(
            name="summarize_article",
            description="記事を要約し、キーポイントを抽出",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {"type": "string"},
                    "language": {"type": "string"},
                    "target_length": {
                        "type": "string",
                        "enum": ["short", "medium", "long"],
                        "default": "medium",
                    },
                    "user_level": {"type": "string"},
                },
                "required": ["content", "language"],
            },
        )
    
    async def summarize_article(
        self,
        content: str,
        language: str,
        target_length: str = "medium",
        user_level: Optional[str] = None,
    ) -> dict:
        """記事要約"""
        
        length_words = {"short": 50, "medium": 100, "long": 200}
        
        prompt = f"""
        以下のニュース記事を{length_words[target_length]}語程度で要約してください。
        {"難易度は" + user_level + "レベルに合わせてください。" if user_level else ""}
        
        記事:
        {content}
        
        出力形式（JSON）:
        - summary: 要約文
        - key_points: 重要ポイントのリスト（3-5個）
        - main_topics: 主要トピック
        - comprehension_questions: 理解度確認の質問（3個）
        """
        
        result = await self.llm.generate_json(prompt)
        return result
```

---

## FastAPI統合

```python
# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import explain, examples, analyze, assess, recommend
from .core.config import settings
from .core.security import verify_token

app = FastAPI(
    title="NewsLingua AI Service",
    description="ニュースベース語学学習のAIバックエンド",
    version="1.0.0",
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(explain.router, prefix="/api/v1", tags=["Explain"])
app.include_router(examples.router, prefix="/api/v1", tags=["Examples"])
app.include_router(analyze.router, prefix="/api/v1", tags=["Analyze"])
app.include_router(assess.router, prefix="/api/v1", tags=["Assessment"])
app.include_router(recommend.router, prefix="/api/v1", tags=["Recommend"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "newslingua-ai"}


# MCPサーバーは別プロセスで起動するか、
# FastAPIと統合して動作させることも可能
```

```python
# app/api/v1/explain.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from ...mcp.tools.vocabulary import VocabularyTools
from ...core.security import verify_token

router = APIRouter()
vocab_tools = VocabularyTools()


class ExplainRequest(BaseModel):
    word: str
    language: str
    user_level: str = "B2"
    context: Optional[str] = None


@router.post("/explain")
async def explain_word(
    request: ExplainRequest,
    user: dict = Depends(verify_token),
):
    """単語説明API（Next.jsから呼び出し）"""
    result = await vocab_tools.explain_word(
        word=request.word,
        language=request.language,
        user_level=request.user_level,
        context=request.context,
    )
    return result
```

---

## 依存関係

```txt
# requirements.txt

# Web Framework
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
pydantic>=2.5.0

# MCP
mcp>=1.0.0

# AI/LLM
anthropic>=0.18.0
openai>=1.10.0
langchain>=0.1.0
langchain-anthropic>=0.1.0

# NLP
spacy>=3.7.0
nltk>=3.8.0

# Vector Search
pinecone-client>=3.0.0

# Database
sqlalchemy>=2.0.0
asyncpg>=0.29.0

# Security
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.0

# HTTP
httpx>=0.26.0
aiohttp>=3.9.0

# Utils
python-dotenv>=1.0.0
tenacity>=8.2.0
```

---

## 実装スケジュール

### Phase 3（2026年3月）

| 週 | タスク |
|----|--------|
| 1 | FastAPIプロジェクト構築、基本API |
| 2 | MCPサーバー基盤、語彙ツール |
| 3 | 文法・リーディングツール |
| 4 | ニュースツール、進捗ツール |

---

## コスト管理

### API利用量見積もり

| ツール | 1回あたりトークン | 1ユーザー/日 | 月間コスト/ユーザー |
|--------|-----------------|-------------|-------------------|
| explain_word | ~500 | 5回 | $0.15 |
| generate_examples | ~300 | 3回 | $0.05 |
| analyze_difficulty | ~800 | 2回 | $0.08 |
| summarize_article | ~600 | 2回 | $0.06 |
| 他ツール合計 | - | - | $0.16 |
| **合計** | - | - | **~$0.50** |

### 最適化戦略

1. **キャッシュ**: Redis で同一クエリ結果をキャッシュ
2. **バッチ処理**: 記事分析は非同期バッチで
3. **ローカルモデル**: 難易度判定はspaCyでローカル処理

---

*最終更新: 2025年12月27日*
