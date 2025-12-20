-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VocabularyWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VocabularyWord" ("category", "check1", "check2", "check3", "createdAt", "example", "exampleTranslation", "id", "language", "meaning", "note", "pronunciation", "updatedAt", "word") SELECT "category", "check1", "check2", "check3", "createdAt", "example", "exampleTranslation", "id", "language", "meaning", "note", "pronunciation", "updatedAt", "word" FROM "VocabularyWord";
DROP TABLE "VocabularyWord";
ALTER TABLE "new_VocabularyWord" RENAME TO "VocabularyWord";
CREATE INDEX "VocabularyWord_language_idx" ON "VocabularyWord"("language");
CREATE INDEX "VocabularyWord_createdAt_idx" ON "VocabularyWord"("createdAt");
CREATE INDEX "VocabularyWord_displayOrder_idx" ON "VocabularyWord"("displayOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
