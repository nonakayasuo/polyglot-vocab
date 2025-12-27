# NewsLingua AI Service

AI-powered language learning assistance backend built with FastAPI and Python.

## Features

- 🔤 **Word Explanation**: Detailed word explanations with pronunciation, examples, and memory tips
- 📝 **Example Generation**: Context-aware example sentence generation
- 📊 **Article Analysis**: CEFR-based difficulty analysis for news articles
- 📋 **Article Summarization**: Level-appropriate article summaries
- 📚 **Vocabulary Extraction**: Smart vocabulary extraction from articles

## Tech Stack

- **Framework**: FastAPI
- **Package Manager**: uv
- **AI Providers**: Anthropic (Claude), OpenAI (fallback)
- **Protocol**: MCP (Model Context Protocol)

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Getting Started

### 1. Install uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# or with Homebrew
brew install uv
```

### 2. Install dependencies

```bash
cd python-ai-service
uv sync
```

### 3. Set up environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Run the development server

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## API Endpoints

### Words

- `POST /api/words/explain` - Get detailed word explanation
- `POST /api/words/examples` - Generate example sentences

### Articles

- `POST /api/articles/analyze-difficulty` - Analyze article difficulty
- `POST /api/articles/summarize` - Summarize article
- `POST /api/articles/extract-vocabulary` - Extract vocabulary from article

## Development

### Run tests

```bash
uv run pytest
```

### Format code

```bash
uv run black .
uv run ruff check --fix .
```

### Type checking

```bash
uv run mypy app
```

## Docker

### Build

```bash
docker build -t newslingua-ai-service .
```

### Run

```bash
docker run -p 8000:8000 --env-file .env newslingua-ai-service
```

## License

MIT

