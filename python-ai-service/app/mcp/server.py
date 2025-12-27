"""NewsLingua MCP Server - Model Context Protocol implementation."""

import json
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, TextContent, Tool

from app.core.config import settings

# Create MCP server instance
server = Server("newslingua-ai")


# ========================================
# Resources
# ========================================


@server.list_resources()
async def list_resources() -> list[Resource]:
    """List available resources."""
    return [
        Resource(
            uri="newslingua://config",
            name="NewsLingua Configuration",
            description="Current AI service configuration and status",
            mimeType="application/json",
        ),
    ]


@server.read_resource()
async def read_resource(uri: str) -> str:
    """Read a resource by URI."""
    if uri == "newslingua://config":
        return json.dumps(
            {
                "service": settings.app_name,
                "version": settings.version,
                "ai_providers": {
                    "anthropic": settings.has_anthropic,
                    "openai": settings.has_openai,
                },
            },
            indent=2,
        )
    raise ValueError(f"Unknown resource: {uri}")


# ========================================
# Tools
# ========================================


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools."""
    return [
        Tool(
            name="explain_word",
            description="Get a detailed explanation of a word including pronunciation, definition, etymology, synonyms, examples, and memory tips.",
            inputSchema={
                "type": "object",
                "properties": {
                    "word": {
                        "type": "string",
                        "description": "The word to explain",
                    },
                    "language": {
                        "type": "string",
                        "description": "Language of the word (e.g., english, spanish)",
                        "default": "english",
                    },
                    "user_level": {
                        "type": "string",
                        "description": "User's CEFR level (A1, A2, B1, B2, C1, C2)",
                        "default": "B1",
                    },
                    "context": {
                        "type": "string",
                        "description": "Optional context sentence where the word appears",
                    },
                    "native_language": {
                        "type": "string",
                        "description": "Language for explanations",
                        "default": "japanese",
                    },
                },
                "required": ["word"],
            },
        ),
        Tool(
            name="generate_examples",
            description="Generate example sentences using a specific word.",
            inputSchema={
                "type": "object",
                "properties": {
                    "word": {
                        "type": "string",
                        "description": "The word to create examples for",
                    },
                    "language": {
                        "type": "string",
                        "description": "Language of the word",
                        "default": "english",
                    },
                    "user_level": {
                        "type": "string",
                        "description": "User's CEFR level",
                        "default": "B1",
                    },
                    "count": {
                        "type": "integer",
                        "description": "Number of examples to generate",
                        "default": 3,
                    },
                    "context_type": {
                        "type": "string",
                        "description": "Type of context (news, daily, business)",
                        "default": "news",
                    },
                },
                "required": ["word"],
            },
        ),
        Tool(
            name="analyze_difficulty",
            description="Analyze the difficulty level of an article and provide CEFR rating.",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The article content to analyze",
                    },
                    "language": {
                        "type": "string",
                        "description": "Language of the article",
                        "default": "english",
                    },
                },
                "required": ["content"],
            },
        ),
        Tool(
            name="extract_vocabulary",
            description="Extract vocabulary words worth learning from an article.",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The article content",
                    },
                    "language": {
                        "type": "string",
                        "description": "Language of the article",
                        "default": "english",
                    },
                    "user_level": {
                        "type": "string",
                        "description": "User's CEFR level",
                        "default": "B1",
                    },
                    "max_words": {
                        "type": "integer",
                        "description": "Maximum number of words to extract",
                        "default": 10,
                    },
                },
                "required": ["content"],
            },
        ),
        Tool(
            name="explain_grammar",
            description="Analyze and explain the grammar of a given text.",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The text to analyze",
                    },
                    "language": {
                        "type": "string",
                        "description": "Language of the text",
                        "default": "english",
                    },
                    "user_level": {
                        "type": "string",
                        "description": "User's CEFR level",
                        "default": "B1",
                    },
                    "native_language": {
                        "type": "string",
                        "description": "Language for explanations",
                        "default": "japanese",
                    },
                },
                "required": ["text"],
            },
        ),
        Tool(
            name="summarize_article",
            description="Summarize an article with key points and vocabulary to learn.",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The article content to summarize",
                    },
                    "language": {
                        "type": "string",
                        "description": "Language of the article",
                        "default": "english",
                    },
                    "user_level": {
                        "type": "string",
                        "description": "User's CEFR level",
                        "default": "B1",
                    },
                    "target_language": {
                        "type": "string",
                        "description": "Language for the summary",
                        "default": "japanese",
                    },
                },
                "required": ["content"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool calls."""
    try:
        from app.services.word_explainer import get_word_explainer
        from app.services.article_analyzer import get_article_analyzer

        word_explainer = get_word_explainer()
        article_analyzer = get_article_analyzer()

        if name == "explain_word":
            result = await word_explainer.explain_word(
                word=arguments["word"],
                language=arguments.get("language", "english"),
                user_level=arguments.get("user_level", "B1"),
                context=arguments.get("context"),
                native_language=arguments.get("native_language", "japanese"),
            )
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

        elif name == "generate_examples":
            result = await word_explainer.generate_examples(
                word=arguments["word"],
                language=arguments.get("language", "english"),
                user_level=arguments.get("user_level", "B1"),
                count=arguments.get("count", 3),
                context_type=arguments.get("context_type", "news"),
            )
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

        elif name == "explain_grammar":
            result = await word_explainer.explain_grammar(
                text=arguments["text"],
                language=arguments.get("language", "english"),
                user_level=arguments.get("user_level", "B1"),
                native_language=arguments.get("native_language", "japanese"),
            )
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

        elif name == "analyze_difficulty":
            result = await article_analyzer.analyze_difficulty(
                content=arguments["content"],
                language=arguments.get("language", "english"),
            )
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

        elif name == "summarize_article":
            result = await article_analyzer.summarize_article(
                content=arguments["content"],
                language=arguments.get("language", "english"),
                user_level=arguments.get("user_level", "B1"),
                target_language=arguments.get("target_language", "japanese"),
            )
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

        elif name == "extract_vocabulary":
            result = await article_analyzer.extract_vocabulary(
                content=arguments["content"],
                language=arguments.get("language", "english"),
                user_level=arguments.get("user_level", "B1"),
                max_words=arguments.get("max_words", 10),
            )
            return [TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

        else:
            raise ValueError(f"Unknown tool: {name}")

    except Exception as e:
        return [TextContent(type="text", text=json.dumps({"error": str(e)}))]


async def run_mcp_server():
    """Run the MCP server using stdio transport."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio

    asyncio.run(run_mcp_server())
