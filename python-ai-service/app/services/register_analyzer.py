"""Register Analyzer Service - Analyze formality levels and TPO advice."""

from typing import Any

from app.services.llm import get_llm_service


class RegisterAnalyzer:
    """Service for analyzing language register and formality levels."""

    def __init__(self):
        self.llm = get_llm_service()

    async def analyze_register(
        self,
        expression: str,
        language: str = "english",
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Analyze the register (formality level) of a word or expression.

        Returns:
            - register: FORMAL, NEUTRAL, CASUAL, SLANG, TABOO
            - formality_score: 1-5 (1=most casual, 5=most formal)
            - tpo_advice: When/where to use this expression
            - synonyms: Alternative expressions with different registers
            - usage_examples: Examples in different contexts
        """
        prompt = f"""Analyze the register (formality level) of the following {language} expression.
Provide your response in {native_language}.

Expression: "{expression}"

Respond in this exact JSON format:
{{
    "expression": "{expression}",
    "register": "FORMAL|NEUTRAL|CASUAL|SLANG|TABOO",
    "formality_score": 1-5,
    "definition": "Meaning of the expression",
    "tpo_advice": {{
        "appropriate_situations": ["List of appropriate situations"],
        "inappropriate_situations": ["List of situations to avoid"],
        "audience": "Who to use this with"
    }},
    "synonyms": [
        {{"word": "formal alternative", "register": "FORMAL"}},
        {{"word": "neutral alternative", "register": "NEUTRAL"}},
        {{"word": "casual alternative", "register": "CASUAL"}}
    ],
    "usage_examples": {{
        "formal_context": "Example in formal setting",
        "casual_context": "Example in casual setting",
        "written_context": "Example in written form"
    }},
    "cultural_notes": "Any cultural context or nuances"
}}"""

        try:
            result = await self.llm.generate_json(prompt)
            return result
        except Exception as e:
            return {
                "expression": expression,
                "error": str(e),
                "register": "UNKNOWN",
            }

    async def generate_situational_examples(
        self,
        word: str,
        language: str = "english",
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Generate example sentences in different registers for a given word.

        Returns examples for:
        - Business email
        - Casual conversation
        - SNS post
        - Academic writing
        """
        prompt = f"""Generate example sentences using the {language} word "{word}" in different situations.
Provide translations in {native_language}.

Respond in this exact JSON format:
{{
    "word": "{word}",
    "examples": {{
        "business_email": {{
            "sentence": "Formal business email example",
            "translation": "Translation",
            "register": "FORMAL",
            "context_note": "Usage note"
        }},
        "casual_conversation": {{
            "sentence": "Casual conversation example",
            "translation": "Translation",
            "register": "CASUAL",
            "context_note": "Usage note"
        }},
        "sns_post": {{
            "sentence": "Social media post example",
            "translation": "Translation",
            "register": "SLANG",
            "context_note": "Usage note"
        }},
        "academic_writing": {{
            "sentence": "Academic writing example",
            "translation": "Translation",
            "register": "FORMAL",
            "context_note": "Usage note"
        }},
        "news_article": {{
            "sentence": "News article example",
            "translation": "Translation",
            "register": "NEUTRAL",
            "context_note": "Usage note"
        }}
    }},
    "tips": "General tips for using this word appropriately"
}}"""

        try:
            result = await self.llm.generate_json(prompt)
            return result
        except Exception as e:
            return {
                "word": word,
                "error": str(e),
            }


# Singleton instance
_register_analyzer: RegisterAnalyzer | None = None


def get_register_analyzer() -> RegisterAnalyzer:
    """Get or create the RegisterAnalyzer singleton."""
    global _register_analyzer
    if _register_analyzer is None:
        _register_analyzer = RegisterAnalyzer()
    return _register_analyzer
