"""LLM Service - Anthropic Claude integration."""

from typing import Any

import anthropic
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = structlog.get_logger()


class LLMService:
    """Anthropic Claude API wrapper service."""

    def __init__(self) -> None:
        """Initialize LLM service."""
        if not settings.has_anthropic:
            raise ValueError("ANTHROPIC_API_KEY is not configured")

        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.default_model = "claude-sonnet-4-20250514"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    async def generate(
        self,
        prompt: str,
        *,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate a response from Claude.

        Args:
            prompt: User prompt
            system: System prompt (optional)
            model: Model to use (defaults to claude-sonnet-4-20250514)
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature

        Returns:
            Generated text response
        """
        model = model or self.default_model

        logger.info(
            "generating_response",
            model=model,
            prompt_length=len(prompt),
            max_tokens=max_tokens,
        )

        messages: list[dict[str, Any]] = [{"role": "user", "content": prompt}]

        kwargs: dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "messages": messages,
        }

        if system:
            kwargs["system"] = system

        if temperature != 1.0:
            kwargs["temperature"] = temperature

        response = self.client.messages.create(**kwargs)

        # Extract text from response
        text_content = ""
        for block in response.content:
            if block.type == "text":
                text_content += block.text

        logger.info(
            "response_generated",
            model=model,
            response_length=len(text_content),
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
        )

        return text_content

    async def explain_word(
        self,
        word: str,
        language: str,
        user_level: str,
        context: str | None = None,
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Generate a detailed word explanation.

        Args:
            word: Word to explain
            language: Language of the word
            user_level: User's CEFR level
            context: Optional context sentence
            native_language: Language for explanations

        Returns:
            Structured word explanation
        """
        system_prompt = f"""You are an expert language teacher helping a {user_level} level learner.
Provide explanations in {native_language}.
Format your response as JSON with the following structure:
{{
  "word": "{word}",
  "pronunciation": "IPA or phonetic",
  "part_of_speech": "noun/verb/etc",
  "definition": "clear definition for {user_level} level",
  "etymology": "word origin if interesting",
  "synonyms": ["list", "of", "synonyms"],
  "antonyms": ["list", "of", "antonyms"],
  "examples": ["example sentence 1", "example sentence 2"],
  "memory_tips": "helpful mnemonic or tip",
  "usage_notes": "common mistakes or usage patterns"
}}"""

        context_text = f"\nContext: {context}" if context else ""
        prompt = f"Explain the {language} word: {word}{context_text}"

        response = await self.generate(
            prompt=prompt,
            system=system_prompt,
            temperature=0.5,
        )

        # Parse JSON response
        import json

        try:
            # Try to extract JSON from response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except json.JSONDecodeError:
            logger.warning("failed_to_parse_json", response=response[:200])

        # Return raw response if JSON parsing fails
        return {
            "word": word,
            "pronunciation": "",
            "part_of_speech": "",
            "definition": response,
            "etymology": None,
            "synonyms": [],
            "antonyms": [],
            "examples": [],
            "memory_tips": None,
            "usage_notes": None,
        }

    async def generate_examples(
        self,
        word: str,
        language: str,
        user_level: str,
        count: int = 3,
        context_type: str = "news",
    ) -> list[dict[str, str]]:
        """
        Generate example sentences for a word.

        Args:
            word: Word to create examples for
            language: Language of the word
            user_level: User's CEFR level
            count: Number of examples to generate
            context_type: Type of context (news, daily, business)

        Returns:
            List of example sentences with translations
        """
        system_prompt = f"""You are a {language} language teacher.
Generate {count} natural example sentences using the word "{word}".
Sentences should be appropriate for {user_level} level learners.
Context type: {context_type}

Format as JSON array:
[
  {{"sentence": "Example sentence", "translation": "Japanese translation"}},
  ...
]"""

        response = await self.generate(
            prompt=f"Generate {count} example sentences for: {word}",
            system=system_prompt,
            temperature=0.8,
        )

        import json

        try:
            json_start = response.find("[")
            json_end = response.rfind("]") + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except json.JSONDecodeError:
            logger.warning("failed_to_parse_examples", response=response[:200])

        return []

    async def analyze_article_difficulty(
        self,
        content: str,
        language: str = "english",
    ) -> dict[str, Any]:
        """
        Analyze the difficulty of an article.

        Args:
            content: Article content
            language: Article language

        Returns:
            Difficulty analysis with CEFR level
        """
        system_prompt = """Analyze the difficulty of this article for language learners.
Provide your analysis as JSON:
{
  "cefr_level": "A1/A2/B1/B2/C1/C2",
  "difficulty_score": 0.0-1.0,
  "vocabulary_level": "basic/intermediate/advanced",
  "grammar_complexity": "simple/moderate/complex",
  "average_sentence_length": number,
  "difficult_words": [{"word": "...", "definition": "..."}],
  "reading_time_minutes": number
}"""

        response = await self.generate(
            prompt=f"Analyze this {language} article:\n\n{content[:3000]}",
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
            logger.warning("failed_to_parse_analysis", response=response[:200])

        return {
            "cefr_level": "B1",
            "difficulty_score": 0.5,
            "vocabulary_level": "intermediate",
            "grammar_complexity": "moderate",
            "average_sentence_length": 15,
            "difficult_words": [],
            "reading_time_minutes": 5,
        }

    async def summarize_article(
        self,
        content: str,
        language: str = "english",
        user_level: str = "B1",
        target_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Summarize an article for language learners.

        Args:
            content: Article content
            language: Article language
            user_level: User's CEFR level
            target_language: Language for summary output

        Returns:
            Summary with key points and vocabulary
        """
        level_descriptions = {
            "A1": "beginner (simple vocabulary, very short sentences)",
            "A2": "elementary (basic vocabulary, simple sentences)",
            "B1": "intermediate (everyday vocabulary, moderate complexity)",
            "B2": "upper-intermediate (wider vocabulary, complex sentences OK)",
            "C1": "advanced (sophisticated vocabulary, nuanced language)",
            "C2": "proficient (native-like vocabulary and complexity)",
        }

        level_desc = level_descriptions.get(user_level, level_descriptions["B1"])

        system_prompt = f"""You are a language learning assistant helping a {user_level} level learner.
Summarize the article in {target_language}, adjusted for a {level_desc} learner.
Also identify the main topic and pick out key vocabulary that would be useful to learn.

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "Article summary in {target_language}",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "main_topic": "Brief topic description",
  "vocabulary_to_learn": [
    {{"word": "English word", "definition": "Definition in {target_language}"}},
    {{"word": "Another word", "definition": "Its definition"}}
  ]
}}"""

        response = await self.generate(
            prompt=f"Summarize this {language} article for a {user_level} learner:\n\n{content[:4000]}",
            system=system_prompt,
            temperature=0.4,
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
    ) -> dict[str, Any]:
        """
        Extract learning vocabulary from an article.

        Args:
            content: Article content
            language: Article language
            user_level: User's CEFR level
            max_words: Maximum number of words to extract

        Returns:
            List of vocabulary words with definitions and examples
        """
        level_target = {
            "A1": "A2-B1 level words (slightly above user level)",
            "A2": "B1 level words (slightly above user level)",
            "B1": "B1-B2 level words (at or slightly above user level)",
            "B2": "B2-C1 level words (at or slightly above user level)",
            "C1": "C1-C2 level words (at or slightly above user level)",
            "C2": "advanced vocabulary, idioms, and rare expressions",
        }

        target = level_target.get(user_level, level_target["B1"])

        system_prompt = f"""You are a vocabulary extraction assistant for language learners.
Extract up to {max_words} useful vocabulary words from the article that would be valuable for a {user_level} level learner.
Focus on: {target}

For each word, provide:
- The word itself
- A clear definition in Japanese
- The CEFR level of the word
- An example sentence from or inspired by the article

Respond ONLY with valid JSON in this exact format:
{{
  "words": [
    {{
      "word": "vocabulary",
      "definition": "語彙、単語",
      "cefr_level": "B1",
      "sentence": "Building your vocabulary is essential for language learning."
    }}
  ]
}}"""

        response = await self.generate(
            prompt=f"Extract {max_words} useful vocabulary words from this {language} article for a {user_level} learner:\n\n{content[:4000]}",
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
            logger.warning("failed_to_parse_vocabulary", response=response[:200])

        return {"words": []}


# Singleton instance
_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    """Get or create LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
