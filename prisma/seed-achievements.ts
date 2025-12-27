import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// 達成可能なバッジの定義
const achievements = [
  // ストリーク系
  {
    code: "streak_3",
    name: "Getting Started",
    nameJa: "スタートダッシュ",
    description: "Maintain a 3-day learning streak",
    descriptionJa: "3日連続で学習する",
    icon: "🔥",
    category: "streak",
    requirement: 3,
    xpReward: 50,
    rarity: "common",
  },
  {
    code: "streak_7",
    name: "Week Warrior",
    nameJa: "週間戦士",
    description: "Maintain a 7-day learning streak",
    descriptionJa: "7日連続で学習する",
    icon: "⚡",
    category: "streak",
    requirement: 7,
    xpReward: 100,
    rarity: "common",
  },
  {
    code: "streak_30",
    name: "Monthly Master",
    nameJa: "月間マスター",
    description: "Maintain a 30-day learning streak",
    descriptionJa: "30日連続で学習する",
    icon: "🌟",
    category: "streak",
    requirement: 30,
    xpReward: 500,
    rarity: "rare",
  },
  {
    code: "streak_100",
    name: "Centurion",
    nameJa: "センチュリオン",
    description: "Maintain a 100-day learning streak",
    descriptionJa: "100日連続で学習する",
    icon: "👑",
    category: "streak",
    requirement: 100,
    xpReward: 2000,
    rarity: "legendary",
  },

  // 語彙系
  {
    code: "first_word",
    name: "First Steps",
    nameJa: "はじめの一歩",
    description: "Add your first word to vocabulary",
    descriptionJa: "最初の単語を単語帳に追加",
    icon: "📝",
    category: "vocabulary",
    requirement: 1,
    xpReward: 10,
    rarity: "common",
  },
  {
    code: "vocabulary_10",
    name: "Word Collector",
    nameJa: "単語コレクター",
    description: "Learn 10 words",
    descriptionJa: "10単語を学習",
    icon: "📚",
    category: "vocabulary",
    requirement: 10,
    xpReward: 50,
    rarity: "common",
  },
  {
    code: "vocabulary_50",
    name: "Vocab Builder",
    nameJa: "ボキャブビルダー",
    description: "Learn 50 words",
    descriptionJa: "50単語を学習",
    icon: "📖",
    category: "vocabulary",
    requirement: 50,
    xpReward: 150,
    rarity: "common",
  },
  {
    code: "vocabulary_100",
    name: "Word Enthusiast",
    nameJa: "単語愛好家",
    description: "Learn 100 words",
    descriptionJa: "100単語を学習",
    icon: "🎓",
    category: "vocabulary",
    requirement: 100,
    xpReward: 300,
    rarity: "rare",
  },
  {
    code: "vocabulary_500",
    name: "Lexicon Legend",
    nameJa: "語彙の達人",
    description: "Learn 500 words",
    descriptionJa: "500単語を学習",
    icon: "🏆",
    category: "vocabulary",
    requirement: 500,
    xpReward: 1000,
    rarity: "epic",
  },
  {
    code: "vocabulary_1000",
    name: "Word Wizard",
    nameJa: "ワードウィザード",
    description: "Learn 1000 words",
    descriptionJa: "1000単語を学習",
    icon: "🧙",
    category: "vocabulary",
    requirement: 1000,
    xpReward: 3000,
    rarity: "legendary",
  },

  // マスター系
  {
    code: "mastered_10",
    name: "Quick Learner",
    nameJa: "クイックラーナー",
    description: "Master 10 words",
    descriptionJa: "10単語をマスター",
    icon: "✨",
    category: "mastery",
    requirement: 10,
    xpReward: 100,
    rarity: "common",
  },
  {
    code: "mastered_50",
    name: "Memory Master",
    nameJa: "記憶の達人",
    description: "Master 50 words",
    descriptionJa: "50単語をマスター",
    icon: "🧠",
    category: "mastery",
    requirement: 50,
    xpReward: 300,
    rarity: "rare",
  },
  {
    code: "mastered_100",
    name: "Vocabulary Virtuoso",
    nameJa: "語彙の名人",
    description: "Master 100 words",
    descriptionJa: "100単語をマスター",
    icon: "💎",
    category: "mastery",
    requirement: 100,
    xpReward: 800,
    rarity: "epic",
  },

  // 読書系
  {
    code: "first_article",
    name: "News Reader",
    nameJa: "ニュースリーダー",
    description: "Read your first news article",
    descriptionJa: "最初のニュース記事を読む",
    icon: "📰",
    category: "reading",
    requirement: 1,
    xpReward: 20,
    rarity: "common",
  },
  {
    code: "articles_10",
    name: "Informed Citizen",
    nameJa: "情報通",
    description: "Read 10 articles",
    descriptionJa: "10記事を読む",
    icon: "🗞️",
    category: "reading",
    requirement: 10,
    xpReward: 100,
    rarity: "common",
  },
  {
    code: "articles_50",
    name: "News Junkie",
    nameJa: "ニュースジャンキー",
    description: "Read 50 articles",
    descriptionJa: "50記事を読む",
    icon: "📊",
    category: "reading",
    requirement: 50,
    xpReward: 400,
    rarity: "rare",
  },
  {
    code: "articles_100",
    name: "World Observer",
    nameJa: "世界の観察者",
    description: "Read 100 articles",
    descriptionJa: "100記事を読む",
    icon: "🌍",
    category: "reading",
    requirement: 100,
    xpReward: 1000,
    rarity: "epic",
  },

  // 特別系
  {
    code: "night_owl",
    name: "Night Owl",
    nameJa: "夜更かしフクロウ",
    description: "Study after midnight",
    descriptionJa: "深夜0時以降に学習",
    icon: "🦉",
    category: "special",
    requirement: 1,
    xpReward: 30,
    rarity: "rare",
  },
  {
    code: "early_bird",
    name: "Early Bird",
    nameJa: "早起き鳥",
    description: "Study before 6 AM",
    descriptionJa: "朝6時前に学習",
    icon: "🐦",
    category: "special",
    requirement: 1,
    xpReward: 30,
    rarity: "rare",
  },
  {
    code: "polyglot",
    name: "Polyglot",
    nameJa: "ポリグロット",
    description: "Learn words in 3 different languages",
    descriptionJa: "3つの異なる言語で単語を学習",
    icon: "🌐",
    category: "special",
    requirement: 3,
    xpReward: 500,
    rarity: "epic",
  },
];

async function seedAchievements() {
  console.log("🏆 Seeding achievements...");

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
    console.log(`  ✅ ${achievement.icon} ${achievement.nameJa}`);
  }

  console.log(`\n🎉 Seeded ${achievements.length} achievements!`);
}

seedAchievements()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

