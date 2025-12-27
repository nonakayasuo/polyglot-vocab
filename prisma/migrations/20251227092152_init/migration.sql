-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Noun',
    "meaning" TEXT NOT NULL DEFAULT '',
    "example" TEXT NOT NULL DEFAULT '',
    "exampleTranslation" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'english',
    "check1" BOOLEAN NOT NULL DEFAULT false,
    "check2" BOOLEAN NOT NULL DEFAULT false,
    "check3" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL,
    "author" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingHistory" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER,

    CONSTRAINT "ReadingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordContext" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sentenceIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyWordRecommendation" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL DEFAULT '',
    "pronunciation" TEXT NOT NULL DEFAULT '',
    "partOfSpeech" TEXT NOT NULL DEFAULT '',
    "cefrLevel" TEXT NOT NULL DEFAULT '',
    "frequencyRank" INTEGER,
    "articleId" TEXT,
    "sentence" TEXT NOT NULL DEFAULT '',
    "isAdded" BOOLEAN NOT NULL DEFAULT false,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyWordRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_embedding" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_embedding" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cefrLevel" TEXT,
    "learningLanguage" TEXT DEFAULT 'english',
    "nativeLanguage" TEXT DEFAULT 'japanese',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "cefrLevel" TEXT NOT NULL,
    "vocabularyScore" DOUBLE PRECISION NOT NULL,
    "readingScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT NOT NULL DEFAULT '',
    "weaknesses" TEXT NOT NULL DEFAULT '',
    "recommendations" TEXT NOT NULL DEFAULT '',
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "level_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_question" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "cefrLevel" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL DEFAULT '',
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_test_response" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedIdx" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_test_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_question" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "cefrLevel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "questions" TEXT NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "source" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_test_response" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "readingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_test_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VocabularyWord_language_idx" ON "VocabularyWord"("language");

-- CreateIndex
CREATE INDEX "VocabularyWord_createdAt_idx" ON "VocabularyWord"("createdAt");

-- CreateIndex
CREATE INDEX "VocabularyWord_displayOrder_idx" ON "VocabularyWord"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Article_externalId_key" ON "Article"("externalId");

-- CreateIndex
CREATE INDEX "Article_language_idx" ON "Article"("language");

-- CreateIndex
CREATE INDEX "Article_source_idx" ON "Article"("source");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_cachedAt_idx" ON "Article"("cachedAt");

-- CreateIndex
CREATE INDEX "ReadingHistory_articleId_idx" ON "ReadingHistory"("articleId");

-- CreateIndex
CREATE INDEX "ReadingHistory_readAt_idx" ON "ReadingHistory"("readAt");

-- CreateIndex
CREATE INDEX "WordContext_wordId_idx" ON "WordContext"("wordId");

-- CreateIndex
CREATE INDEX "WordContext_articleId_idx" ON "WordContext"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "WordContext_wordId_articleId_key" ON "WordContext"("wordId", "articleId");

-- CreateIndex
CREATE INDEX "DailyWordRecommendation_date_idx" ON "DailyWordRecommendation"("date");

-- CreateIndex
CREATE INDEX "DailyWordRecommendation_word_idx" ON "DailyWordRecommendation"("word");

-- CreateIndex
CREATE UNIQUE INDEX "word_embedding_word_key" ON "word_embedding"("word");

-- CreateIndex
CREATE INDEX "word_embedding_language_idx" ON "word_embedding"("language");

-- CreateIndex
CREATE UNIQUE INDEX "article_embedding_articleId_key" ON "article_embedding"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "level_assessment_userId_idx" ON "level_assessment"("userId");

-- CreateIndex
CREATE INDEX "level_assessment_language_idx" ON "level_assessment"("language");

-- CreateIndex
CREATE INDEX "level_assessment_completedAt_idx" ON "level_assessment"("completedAt");

-- CreateIndex
CREATE INDEX "vocabulary_question_language_cefrLevel_idx" ON "vocabulary_question"("language", "cefrLevel");

-- CreateIndex
CREATE INDEX "vocabulary_question_isActive_idx" ON "vocabulary_question"("isActive");

-- CreateIndex
CREATE INDEX "vocabulary_test_response_assessmentId_idx" ON "vocabulary_test_response"("assessmentId");

-- CreateIndex
CREATE INDEX "vocabulary_test_response_questionId_idx" ON "vocabulary_test_response"("questionId");

-- CreateIndex
CREATE INDEX "reading_question_language_cefrLevel_idx" ON "reading_question"("language", "cefrLevel");

-- CreateIndex
CREATE INDEX "reading_question_isActive_idx" ON "reading_question"("isActive");

-- CreateIndex
CREATE INDEX "reading_test_response_assessmentId_idx" ON "reading_test_response"("assessmentId");

-- CreateIndex
CREATE INDEX "reading_test_response_questionId_idx" ON "reading_test_response"("questionId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "ReadingHistory" ADD CONSTRAINT "ReadingHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordContext" ADD CONSTRAINT "WordContext_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordContext" ADD CONSTRAINT "WordContext_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_assessment" ADD CONSTRAINT "level_assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_test_response" ADD CONSTRAINT "vocabulary_test_response_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "level_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_test_response" ADD CONSTRAINT "vocabulary_test_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "vocabulary_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_test_response" ADD CONSTRAINT "reading_test_response_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "level_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_test_response" ADD CONSTRAINT "reading_test_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "reading_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
