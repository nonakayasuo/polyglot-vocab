import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

// 料金プラン定義
export const PLANS = {
  free: {
    name: "Free",
    nameJa: "無料",
    price: 0,
    priceId: null,
    features: {
      articlesPerDay: 5,
      maxWords: 100,
      aiAssist: false,
      offlineMode: false,
      allLanguages: false,
      advancedAnalytics: false,
    },
    featuresJa: [
      "1日5記事まで",
      "100単語まで保存",
      "基本機能",
      "レベル判定",
    ],
  },
  pro: {
    name: "Pro",
    nameJa: "プロ",
    price: 980,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      articlesPerDay: -1, // 無制限
      maxWords: -1,
      aiAssist: true,
      offlineMode: true,
      allLanguages: true,
      advancedAnalytics: true,
    },
    featuresJa: [
      "記事無制限",
      "単語帳無制限",
      "AIアシスタント",
      "全言語対応",
      "オフラインモード",
      "詳細分析",
    ],
  },
  business: {
    name: "Business",
    nameJa: "ビジネス",
    price: 4980,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    features: {
      articlesPerDay: -1,
      maxWords: -1,
      aiAssist: true,
      offlineMode: true,
      allLanguages: true,
      advancedAnalytics: true,
      teamManagement: true,
      apiAccess: true,
      prioritySupport: true,
    },
    featuresJa: [
      "全Pro機能",
      "チーム管理",
      "API連携",
      "分析レポート",
      "専用サポート",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

// サブスクリプション状態をチェック
export function isPro(subscriptionTier: string | null | undefined): boolean {
  return subscriptionTier === "pro" || subscriptionTier === "business";
}

export function isBusiness(subscriptionTier: string | null | undefined): boolean {
  return subscriptionTier === "business";
}

// プランの機能チェック
export function canUseFeature(
  subscriptionTier: string | null | undefined,
  feature: keyof typeof PLANS.pro.features
): boolean {
  const tier = (subscriptionTier || "free") as PlanType;
  const plan = PLANS[tier] || PLANS.free;
  return Boolean(plan.features[feature as keyof typeof plan.features]);
}

// 記事制限チェック
export function getArticleLimit(subscriptionTier: string | null | undefined): number {
  const tier = (subscriptionTier || "free") as PlanType;
  const plan = PLANS[tier] || PLANS.free;
  return plan.features.articlesPerDay;
}

// 単語数制限チェック
export function getWordLimit(subscriptionTier: string | null | undefined): number {
  const tier = (subscriptionTier || "free") as PlanType;
  const plan = PLANS[tier] || PLANS.free;
  return plan.features.maxWords;
}

