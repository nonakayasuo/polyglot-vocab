/**
 * AI Service Client - Next.js から Python FastAPI への連携
 */

const AI_SERVICE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

interface ExplainWordRequest {
  word: string;
  language?: string;
  user_level?: string;
  context?: string | null;
  native_language?: string;
}

interface ExplainWordResponse {
  word: string;
  pronunciation: string;
  part_of_speech: string;
  definition: string;
  etymology: string | null;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  memory_tips: string | null;
  usage_notes: string | null;
}

interface GenerateExamplesRequest {
  word: string;
  language?: string;
  user_level?: string;
  count?: number;
  context_type?: string;
}

interface GenerateExamplesResponse {
  word: string;
  examples: Array<{ sentence: string; translation: string }>;
}

interface AnalyzeDifficultyRequest {
  content: string;
  language?: string;
}

interface AnalyzeDifficultyResponse {
  cefr_level: string;
  difficulty_score: number;
  vocabulary_level: string;
  grammar_complexity: string;
  average_sentence_length: number;
  difficult_words: Array<{ word: string; definition: string }>;
  reading_time_minutes: number;
}

class AIServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = AI_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
  }> {
    return this.request("/health");
  }

  /**
   * 単語の詳細説明を取得
   */
  async explainWord(params: ExplainWordRequest): Promise<ExplainWordResponse> {
    return this.request("/api/words/explain", {
      method: "POST",
      body: JSON.stringify({
        word: params.word,
        language: params.language || "english",
        user_level: params.user_level || "B1",
        context: params.context || null,
        native_language: params.native_language || "japanese",
      }),
    });
  }

  /**
   * 例文を生成
   */
  async generateExamples(
    params: GenerateExamplesRequest
  ): Promise<GenerateExamplesResponse> {
    return this.request("/api/words/examples", {
      method: "POST",
      body: JSON.stringify({
        word: params.word,
        language: params.language || "english",
        user_level: params.user_level || "B1",
        count: params.count || 3,
        context_type: params.context_type || "news",
      }),
    });
  }

  /**
   * 記事の難易度を分析
   */
  async analyzeDifficulty(
    params: AnalyzeDifficultyRequest
  ): Promise<AnalyzeDifficultyResponse> {
    return this.request("/api/articles/analyze-difficulty", {
      method: "POST",
      body: JSON.stringify({
        content: params.content,
        language: params.language || "english",
      }),
    });
  }
}

// シングルトンインスタンス
export const aiClient = new AIServiceClient();

// 型のエクスポート
export type {
  ExplainWordRequest,
  ExplainWordResponse,
  GenerateExamplesRequest,
  GenerateExamplesResponse,
  AnalyzeDifficultyRequest,
  AnalyzeDifficultyResponse,
};
