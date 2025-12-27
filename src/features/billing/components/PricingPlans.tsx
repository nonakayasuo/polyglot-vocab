"use client";

import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  nameJa: string;
  price: number;
  priceFormatted: string;
  features: string[];
}

interface PricingPlansProps {
  currentPlan?: string;
}

const planIcons = {
  free: Zap,
  pro: Sparkles,
  business: Crown,
};

const planColors = {
  free: "from-gray-500 to-gray-600",
  pro: "from-indigo-500 to-purple-600",
  business: "from-amber-500 to-orange-600",
};

export function PricingPlans({ currentPlan = "free" }: PricingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [plans] = useState<Plan[]>([
    {
      id: "free",
      name: "Free",
      nameJa: "無料",
      price: 0,
      priceFormatted: "無料",
      features: ["1日5記事まで", "100単語まで保存", "基本機能", "レベル判定"],
    },
    {
      id: "pro",
      name: "Pro",
      nameJa: "プロ",
      price: 980,
      priceFormatted: "¥980/月",
      features: [
        "記事無制限",
        "単語帳無制限",
        "AIアシスタント",
        "全言語対応",
        "オフラインモード",
        "詳細分析",
      ],
    },
    {
      id: "business",
      name: "Business",
      nameJa: "ビジネス",
      price: 4980,
      priceFormatted: "¥4,980/月",
      features: [
        "全Pro機能",
        "チーム管理",
        "API連携",
        "分析レポート",
        "専用サポート",
      ],
    },
  ]);

  const handleSubscribe = async (planId: string) => {
    if (planId === "free" || planId === currentPlan) return;

    setLoading(planId);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to start checkout:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">料金プラン</h2>
        <p className="text-gray-500">
          あなたの学習スタイルに合ったプランを選択
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = planIcons[plan.id as keyof typeof planIcons] || Zap;
          const gradientColor =
            planColors[plan.id as keyof typeof planColors] || planColors.free;
          const isCurrent = plan.id === currentPlan;
          const isPopular = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
                isCurrent
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                  : isPopular
                    ? "border-purple-300 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Popular バッジ */}
              {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    おすすめ
                  </span>
                </div>
              )}

              {/* Current バッジ */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    現在のプラン
                  </span>
                </div>
              )}

              {/* アイコンと名前 */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plan.nameJa}</h3>
                  <p className="text-sm text-gray-500">{plan.name}</p>
                </div>
              </div>

              {/* 価格 */}
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {plan.priceFormatted}
                </span>
              </div>

              {/* 機能リスト */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* ボタン */}
              <button
                type="button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || plan.id === "free" || loading !== null}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  isCurrent
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : plan.id === "free"
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : `bg-gradient-to-r ${gradientColor} text-white hover:opacity-90 shadow-lg`
                }`}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    処理中...
                  </span>
                ) : isCurrent ? (
                  "現在のプラン"
                ) : plan.id === "free" ? (
                  "無料で始める"
                ) : (
                  "アップグレード"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>いつでもキャンセル可能 • 安全な決済 • 14日間返金保証</p>
      </div>
    </div>
  );
}
