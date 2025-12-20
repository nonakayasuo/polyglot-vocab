-- CreateTable
CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Noun',
    "meaning" TEXT NOT NULL DEFAULT '',
    "example" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'english',
    "check1" BOOLEAN NOT NULL DEFAULT false,
    "check2" BOOLEAN NOT NULL DEFAULT false,
    "check3" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "VocabularyWord_language_idx" ON "VocabularyWord"("language");

-- CreateIndex
CREATE INDEX "VocabularyWord_createdAt_idx" ON "VocabularyWord"("createdAt");
