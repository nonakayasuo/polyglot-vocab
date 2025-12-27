"""Slang Analyzer Service - Analyze slang, buzzwords, and trending expressions."""

from typing import Any
from datetime import datetime

from app.services.llm import get_llm_service


# Sample buzzwords data (in production, this would come from SNS APIs)
SAMPLE_BUZZWORDS = {
    "english": [
        {
            "word": "slay",
            "meaning": "To do something exceptionally well",
            "meaning_ja": "圧倒的に素晴らしいパフォーマンスをする",
            "source": "TIKTOK",
            "trend_score": 95,
            "category": "compliment",
        },
        {
            "word": "no cap",
            "meaning": "For real, no lie",
            "meaning_ja": "マジで、嘘じゃなく",
            "source": "TWITTER",
            "trend_score": 88,
            "category": "emphasis",
        },
        {
            "word": "understood the assignment",
            "meaning": "Perfectly met expectations",
            "meaning_ja": "期待に完璧に応えた",
            "source": "TWITTER",
            "trend_score": 82,
            "category": "compliment",
        },
        {
            "word": "ate",
            "meaning": "Did something perfectly",
            "meaning_ja": "完璧にやり遂げた",
            "source": "TIKTOK",
            "trend_score": 79,
            "category": "compliment",
        },
        {
            "word": "delulu",
            "meaning": "Delusional, often used humorously",
            "meaning_ja": "妄想的な（ユーモラスに使用）",
            "source": "TIKTOK",
            "trend_score": 75,
            "category": "humor",
        },
        {
            "word": "rizz",
            "meaning": "Charisma, ability to attract others",
            "meaning_ja": "魅力、人を惹きつける能力",
            "source": "TIKTOK",
            "trend_score": 90,
            "category": "personality",
        },
        {
            "word": "sus",
            "meaning": "Suspicious, sketchy",
            "meaning_ja": "怪しい、疑わしい",
            "source": "REDDIT",
            "trend_score": 85,
            "category": "observation",
        },
        {
            "word": "main character energy",
            "meaning": "Acting like the protagonist of a story",
            "meaning_ja": "物語の主人公のように振る舞う",
            "source": "TIKTOK",
            "trend_score": 72,
            "category": "personality",
        },
        {
            "word": "lowkey",
            "meaning": "Somewhat, secretly",
            "meaning_ja": "ちょっと、密かに",
            "source": "TWITTER",
            "trend_score": 80,
            "category": "modifier",
        },
        {
            "word": "highkey",
            "meaning": "Very much, obviously",
            "meaning_ja": "とても、明らかに",
            "source": "TWITTER",
            "trend_score": 70,
            "category": "modifier",
        },
        {
            "word": "bet",
            "meaning": "Okay, sounds good, agreement",
            "meaning_ja": "いいよ、了解",
            "source": "TWITTER",
            "trend_score": 78,
            "category": "agreement",
        },
        {
            "word": "bussin",
            "meaning": "Really good, especially food",
            "meaning_ja": "めっちゃ美味しい、最高",
            "source": "TIKTOK",
            "trend_score": 76,
            "category": "compliment",
        },
    ]
}


class SlangAnalyzer:
    """Service for analyzing slang and tracking buzzwords."""

    def __init__(self):
        self.llm = get_llm_service()

    async def get_buzzwords(
        self,
        language: str = "english",
        source: str = "all",
        count: int = 10,
    ) -> dict[str, Any]:
        """
        Get current trending buzzwords from SNS platforms.

        Args:
            language: Language for buzzwords
            source: SNS source filter (twitter, reddit, tiktok, all)
            count: Number of buzzwords to return
        """
        # Get sample data (in production, this would fetch from real APIs)
        all_buzzwords = SAMPLE_BUZZWORDS.get(language, SAMPLE_BUZZWORDS["english"])

        # Filter by source if specified
        if source != "all":
            source_upper = source.upper()
            filtered = [bw for bw in all_buzzwords if bw["source"] == source_upper]
        else:
            filtered = all_buzzwords

        # Sort by trend score and limit
        sorted_buzzwords = sorted(filtered, key=lambda x: x["trend_score"], reverse=True)[:count]

        return {
            "language": language,
            "source": source,
            "count": len(sorted_buzzwords),
            "fetched_at": datetime.now().isoformat(),
            "buzzwords": sorted_buzzwords,
        }

    async def analyze_slang(
        self,
        slang: str,
        language: str = "english",
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Analyze a slang word or expression in detail.

        Returns:
            - meaning: Definition of the slang
            - origin: Where/how the slang originated
            - usage: How to use it properly
            - tpo_advice: When/where to use (or avoid)
            - examples: Usage examples
            - related_slang: Similar expressions
            - generational_note: Which generation uses it
        """
        prompt = f"""Analyze the following {language} slang expression in detail.
Provide your response in {native_language}.

Slang: "{slang}"

Respond in this exact JSON format:
{{
    "slang": "{slang}",
    "meaning": "Primary meaning",
    "register": "SLANG or TABOO",
    "origin": {{
        "source": "Where it originated (e.g., TikTok, Twitter, gaming)",
        "year": "Approximate year it became popular",
        "background": "How it came to be"
    }},
    "usage": {{
        "how_to_use": "How to use this slang correctly",
        "common_contexts": ["List of common contexts"],
        "variations": ["Related variations or forms"]
    }},
    "tpo_advice": {{
        "appropriate": ["When/where to use"],
        "avoid": ["When/where to avoid"],
        "audience": "Who typically uses this"
    }},
    "examples": [
        {{"sentence": "Example 1", "translation": "Translation 1", "context": "Context note"}},
        {{"sentence": "Example 2", "translation": "Translation 2", "context": "Context note"}},
        {{"sentence": "Example 3", "translation": "Translation 3", "context": "Context note"}}
    ],
    "related_slang": [
        {{"word": "related word 1", "relationship": "synonym/antonym/similar"}},
        {{"word": "related word 2", "relationship": "synonym/antonym/similar"}}
    ],
    "generational_note": "Which generation uses this (Gen Z, Millennials, etc.)",
    "formal_alternatives": ["List of formal ways to express the same idea"],
    "popularity_rating": 1-10,
    "cultural_sensitivity": "Any notes on cultural sensitivity or appropriateness"
}}"""

        try:
            result = await self.llm.generate_json(prompt)
            return result
        except Exception as e:
            return {
                "slang": slang,
                "error": str(e),
            }


# Singleton instance
_slang_analyzer: SlangAnalyzer | None = None


def get_slang_analyzer() -> SlangAnalyzer:
    """Get or create the SlangAnalyzer singleton."""
    global _slang_analyzer
    if _slang_analyzer is None:
        _slang_analyzer = SlangAnalyzer()
    return _slang_analyzer
