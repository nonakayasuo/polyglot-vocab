-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "publishedAt" DATETIME NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReadingHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER,
    CONSTRAINT "ReadingHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wordId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sentenceIndex" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WordContext_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WordContext_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyWordRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL DEFAULT '',
    "pronunciation" TEXT NOT NULL DEFAULT '',
    "partOfSpeech" TEXT NOT NULL DEFAULT '',
    "cefrLevel" TEXT NOT NULL DEFAULT '',
    "frequencyRank" INTEGER,
    "articleId" TEXT,
    "sentence" TEXT NOT NULL DEFAULT '',
    "isAdded" BOOLEAN NOT NULL DEFAULT false,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false
);

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
