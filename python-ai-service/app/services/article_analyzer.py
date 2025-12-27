"""Article Analyzer Service - 記事分析・要約MCPツール実装"""

from typing import Any

import structlog

from app.services.llm import get_llm_service

logger = structlog.get_logger()


class ArticleAnalyzerService:
    """記事分析サービス - analyze_difficulty, summarize_article, extract_vocabulary"""

    def __init__(self):
        self.llm = get_llm_service()

    async def analyze_difficulty(
        self,
        content: str,
        language: str = "english",
    ) -> dict[str, Any]:
        """
        記事の難易度を分析

        Returns:
            cefr_level, difficulty_score, vocabulary_level, grammar_complexity,
            average_sentence_length, difficult_words, reading_time_minutes
        """
        return await self.llm.analyze_article_difficulty(
            content=content,
            language=language,
        )

    async def summarize_article(
        self,
        content: str,
        language: str = "english",
        user_level: str = "B1",
        target_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        記事を要約

        Returns:
            summary, key_points, main_topic, vocabulary_to_learn
        """
        system_prompt = f"""You are a language learning assistant.
Summarize the article for a {user_level} level learner.
Provide the summary in {target_language}.

Format as JSON:
{{
  "summary": "concise summary of the article",
  "key_points": ["key point 1", "key point 2", "key point 3"],
  "main_topic": "main topic/category",
  "vocabulary_to_learn": [
    {{"word": "important word", "definition": "meaning"}}
  ]
}}"""

        response = await self.llm.generate(
            prompt=f"Summarize this {language} article:\n\n{content[:3000]}",
            system=system_prompt,
            temperature=0.3,
        )

        import json

        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except json.JSONDecodeError:
            logger.warning("failed_to_parse_summary", response=response[:200])

        return {
            "summary": response,
            "key_points": [],
            "main_topic": "",
            "vocabulary_to_learn": [],
        }

    async def extract_vocabulary(
        self,
        content: str,
        language: str = "english",
        user_level: str = "B1",
        max_words: int = 10,
    ) -> list[dict[str, Any]]:
        """
        記事から学習すべき語彙を抽出

        Returns:
            List of {word, definition, cefr_level, sentence, importance}
        """
        system_prompt = f"""You are a vocabulary extraction expert.
Extract {max_words} vocabulary words that would be valuable for a {user_level} level learner.

Criteria for selection:
- Words slightly above the learner's current level
- High-frequency words in news/academic context
- Words with clear context in the article

Format as JSON array:
[
  {{
    "word": "vocabulary word",
    "definition": "definition in Japanese",
    "cefr_level": "estimated CEFR level (A1-C2)",
    "sentence": "sentence from the article containing the word",
    "importance": "high/medium/low - based on frequency and usefulness"
  }}
]"""

        response = await self.llm.generate(
            prompt=f"Extract vocabulary from this {language} article:\n\n{content[:3000]}",
            system=system_prompt,
            temperature=0.3,
        )

        import json

        try:
            json_start = response.find("[")
            json_end = response.rfind("]") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except json.JSONDecodeError:
            logger.warning("failed_to_parse_vocabulary", response=response[:200])

        return []

    async def generate_comprehension_questions(
        self,
        content: str,
        language: str = "english",
        user_level: str = "B1",
        count: int = 3,
    ) -> list[dict[str, Any]]:
        """
        記事の理解度確認問題を生成

        Returns:
            List of {question, options, correct_index, explanation}
        """
        system_prompt = f"""Create {count} comprehension questions for a {user_level} level learner.

Format as JSON array:
[
  {{
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correct_index": 0,
    "explanation": "why this answer is correct"
  }}
]"""

        response = await self.llm.generate(
            prompt=f"Create comprehension questions for this {language} article:\n\n{content[:2000]}",
            system=system_prompt,
            temperature=0.5,
        )

        import json

        try:
            json_start = response.find("[")
            json_end = response.rfind("]") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except json.JSONDecodeError:
            logger.warning("failed_to_parse_questions", response=response[:200])

        return []


# Singleton
_article_analyzer: ArticleAnalyzerService | None = None


def get_article_analyzer() -> ArticleAnalyzerService:
    global _article_analyzer
    if _article_analyzer is None:
        _article_analyzer = ArticleAnalyzerService()
    return _article_analyzer
