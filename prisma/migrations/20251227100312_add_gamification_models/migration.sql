-- AlterTable
ALTER TABLE "user" ADD COLUMN     "totalXp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weeklyXp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streakFreezes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionJa" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "activityType" TEXT NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_streak_userId_key" ON "user_streak"("userId");

-- CreateIndex
CREATE INDEX "user_streak_userId_idx" ON "user_streak"("userId");

-- CreateIndex
CREATE INDEX "user_streak_currentStreak_idx" ON "user_streak"("currentStreak");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_code_key" ON "achievement"("code");

-- CreateIndex
CREATE INDEX "achievement_category_idx" ON "achievement"("category");

-- CreateIndex
CREATE INDEX "achievement_isActive_idx" ON "achievement"("isActive");

-- CreateIndex
CREATE INDEX "user_achievement_userId_idx" ON "user_achievement"("userId");

-- CreateIndex
CREATE INDEX "user_achievement_achievementId_idx" ON "user_achievement"("achievementId");

-- CreateIndex
CREATE INDEX "user_achievement_earnedAt_idx" ON "user_achievement"("earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_userId_achievementId_key" ON "user_achievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "learning_activity_userId_idx" ON "learning_activity"("userId");

-- CreateIndex
CREATE INDEX "learning_activity_activityType_idx" ON "learning_activity"("activityType");

-- CreateIndex
CREATE INDEX "learning_activity_createdAt_idx" ON "learning_activity"("createdAt");

-- AddForeignKey
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
