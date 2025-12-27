"""Word Explainer Service - 単語説明MCPツール実装"""

from typing import Any

import structlog

from app.services.llm import get_llm_service

logger = structlog.get_logger()


class WordExplainerService:
    """単語説明サービス - explain_word, generate_examples, explain_grammar"""

    def __init__(self):
        self.llm = get_llm_service()

    async def explain_word(
        self,
        word: str,
        language: str = "english",
        user_level: str = "B1",
        context: str | None = None,
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        単語の詳細な説明を生成

        Returns:
            word, pronunciation, part_of_speech, definition, etymology,
            synonyms, antonyms, examples, memory_tips, usage_notes
        """
        return await self.llm.explain_word(
            word=word,
            language=language,
            user_level=user_level,
            context=context,
            native_language=native_language,
        )

    async def generate_examples(
        self,
        word: str,
        language: str = "english",
        user_level: str = "B1",
        count: int = 3,
        context_type: str = "news",
    ) -> list[dict[str, str]]:
        """
        単語を使った例文を生成

        Returns:
            List of {sentence, translation}
        """
        return await self.llm.generate_examples(
            word=word,
            language=language,
            user_level=user_level,
            count=count,
            context_type=context_type,
        )

    async def explain_grammar(
        self,
        text: str,
        language: str = "english",
        user_level: str = "B1",
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        テキストの文法を解説

        Returns:
            grammar_points, sentence_structure, common_mistakes, tips
        """
        system_prompt = f"""You are an expert language teacher helping a {user_level} level learner.
Analyze the grammar of the given text and explain in {native_language}.

Format your response as JSON:
{{
  "grammar_points": [
    {{
      "pattern": "grammar pattern name",
      "explanation": "explanation of the grammar",
      "example_in_text": "where it appears in the text"
    }}
  ],
  "sentence_structure": "analysis of sentence structure",
  "common_mistakes": ["list of common mistakes learners make"],
  "tips": ["learning tips for mastering this grammar"]
}}"""

        response = await self.llm.generate(
            prompt=f"Analyze the grammar of this {language} text:\n\n{text}",
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
            logger.warning("failed_to_parse_grammar", response=response[:200])

        return {
            "grammar_points": [],
            "sentence_structure": response,
            "common_mistakes": [],
            "tips": [],
        }

    async def get_collocations(
        self,
        word: str,
        language: str = "english",
        count: int = 5,
    ) -> list[dict[str, str]]:
        """
        単語のコロケーション（よく一緒に使われる語）を取得

        Returns:
            List of {collocation, meaning, example}
        """
        system_prompt = f"""List common collocations for the word "{word}" in {language}.

Format as JSON array:
[
  {{
    "collocation": "word + common partner",
    "meaning": "meaning in Japanese",
    "example": "example sentence"
  }}
]

Provide {count} collocations."""

        response = await self.llm.generate(
            prompt=f"Get collocations for: {word}",
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
            logger.warning("failed_to_parse_collocations", response=response[:200])

        return []


# Singleton
_word_explainer: WordExplainerService | None = None


def get_word_explainer() -> WordExplainerService:
    global _word_explainer
    if _word_explainer is None:
        _word_explainer = WordExplainerService()
    return _word_explainer
