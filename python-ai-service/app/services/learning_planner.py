"""Learning Planner Service - Generate personalized learning plans."""

from typing import Any

from app.services.llm import get_llm_service


class LearningPlanner:
    """Service for generating personalized learning plans."""

    def __init__(self):
        self.llm = get_llm_service()

    async def suggest_learning_plan(
        self,
        user_level: str = "B1",
        target_level: str = "B2",
        vocabulary_count: int = 0,
        articles_read: int = 0,
        weak_areas: list[str] | None = None,
        interests: list[str] | None = None,
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Generate a personalized learning plan based on user's progress and goals.
        
        Args:
            user_level: Current CEFR level
            target_level: Target CEFR level
            vocabulary_count: Number of words learned
            articles_read: Number of articles read
            weak_areas: Areas user struggles with
            interests: User's topic interests
            native_language: Language for the plan
        """
        weak_areas = weak_areas or []
        interests = interests or ["news", "technology"]

        prompt = f"""Create a personalized language learning plan based on the following user profile.
Provide your response in {native_language}.

User Profile:
- Current Level: {user_level}
- Target Level: {target_level}
- Vocabulary Learned: {vocabulary_count} words
- Articles Read: {articles_read}
- Weak Areas: {', '.join(weak_areas) if weak_areas else 'Not specified'}
- Interests: {', '.join(interests)}

Respond in this exact JSON format:
{{
    "summary": "Brief summary of the learning plan",
    "estimated_duration": "Estimated time to reach target level",
    "current_assessment": {{
        "strengths": ["User's strengths based on data"],
        "areas_to_improve": ["Areas needing improvement"],
        "readiness_score": 1-100
    }},
    "weekly_goals": {{
        "vocabulary": {{
            "target": 50,
            "focus_areas": ["Types of vocabulary to focus on"]
        }},
        "reading": {{
            "articles_per_week": 5,
            "recommended_difficulty": "CEFR level for reading",
            "topics": ["Recommended topics based on interests"]
        }},
        "practice": {{
            "flashcard_reviews": "Number of reviews per day",
            "quiz_sessions": "Number of quizzes per week"
        }}
    }},
    "daily_routine": {{
        "morning": "Morning learning activity suggestion",
        "afternoon": "Afternoon activity",
        "evening": "Evening review activity",
        "estimated_time": "Total daily time in minutes"
    }},
    "milestone_targets": [
        {{
            "week": 1,
            "goal": "First week goal",
            "metrics": "How to measure success"
        }},
        {{
            "week": 4,
            "goal": "First month goal",
            "metrics": "How to measure success"
        }},
        {{
            "week": 12,
            "goal": "Three month goal",
            "metrics": "How to measure success"
        }}
    ],
    "recommended_content": {{
        "article_categories": ["Recommended news categories"],
        "vocabulary_themes": ["Vocabulary themes to focus on"],
        "grammar_points": ["Grammar points to study"]
    }},
    "weak_area_strategies": [
        {{
            "area": "Weak area",
            "strategy": "Strategy to improve",
            "resources": ["Recommended resources"]
        }}
    ],
    "motivational_tips": [
        "Tip 1 for staying motivated",
        "Tip 2 for effective learning",
        "Tip 3 for building habits"
    ],
    "next_actions": [
        {{
            "action": "First action to take",
            "priority": "high/medium/low",
            "estimated_time": "Time in minutes"
        }},
        {{
            "action": "Second action",
            "priority": "high/medium/low",
            "estimated_time": "Time in minutes"
        }},
        {{
            "action": "Third action",
            "priority": "high/medium/low",
            "estimated_time": "Time in minutes"
        }}
    ]
}}"""

        try:
            result = await self.llm.generate_json(prompt)
            result["user_profile"] = {
                "current_level": user_level,
                "target_level": target_level,
                "vocabulary_count": vocabulary_count,
                "articles_read": articles_read,
            }
            return result
        except Exception as e:
            return {
                "error": str(e),
                "user_profile": {
                    "current_level": user_level,
                    "target_level": target_level,
                },
            }

    async def analyze_progress(
        self,
        user_level: str,
        vocabulary_count: int,
        articles_read: int,
        streak_days: int,
        weekly_xp: int,
        native_language: str = "japanese",
    ) -> dict[str, Any]:
        """
        Analyze user's learning progress and provide insights.
        """
        prompt = f"""Analyze the following user's learning progress and provide insights.
Provide your response in {native_language}.

Progress Data:
- Current Level: {user_level}
- Vocabulary Learned: {vocabulary_count} words
- Articles Read: {articles_read}
- Current Streak: {streak_days} days
- Weekly XP: {weekly_xp}

Respond in this exact JSON format:
{{
    "overall_progress": {{
        "score": 1-100,
        "trend": "improving/stable/declining",
        "summary": "Brief summary of progress"
    }},
    "vocabulary_insights": {{
        "pace": "fast/average/slow",
        "retention_estimate": "estimated retention rate",
        "recommendation": "Recommendation for vocabulary learning"
    }},
    "reading_insights": {{
        "consistency": "consistent/irregular",
        "recommendation": "Recommendation for reading practice"
    }},
    "engagement": {{
        "streak_assessment": "Assessment of streak",
        "xp_pace": "Assessment of XP earning",
        "motivation_level": "high/medium/low"
    }},
    "achievements_near": [
        "Achievement 1 that's close to being earned",
        "Achievement 2 that's close"
    ],
    "personalized_encouragement": "Personalized message to encourage the user"
}}"""

        try:
            result = await self.llm.generate_json(prompt)
            return result
        except Exception as e:
            return {
                "error": str(e),
            }


# Singleton instance
_learning_planner: LearningPlanner | None = None


def get_learning_planner() -> LearningPlanner:
    """Get or create the LearningPlanner singleton."""
    global _learning_planner
    if _learning_planner is None:
        _learning_planner = LearningPlanner()
    return _learning_planner

