"use client";

import {
  CreditCard,
  ExternalLink,
  Loader2,
  Receipt,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PricingPlans } from "@/components/billing/PricingPlans";
import { authClient } from "@/lib/auth-client";

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/signin");
          return;
        }

        // サブスクリプション情報を取得
        const response = await fetch("/api/billing/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error("Failed to load subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";
  const isActive = subscription?.status === "active";
  const willCancel = subscription?.cancelAtPeriodEnd;

  return (
    <div className="space-y-6">
      {/* 現在のプラン */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              現在のプラン
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              サブスクリプションの管理
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl mb-4">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">
              {currentPlan === "free" ? "無料プラン" : `${currentPlan}プラン`}
            </p>
            {isActive && subscription?.currentPeriodEnd && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {willCancel ? "キャンセル予定: " : "次回更新: "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  "ja-JP"
                )}
              </p>
            )}
            {willCancel && (
              <p className="text-sm text-orange-500 mt-1">
                ※ 期間終了後、無料プランに戻ります
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : currentPlan === "free"
                  ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {isActive ? "アクティブ" : currentPlan === "free" ? "無料" : "未払い"}
          </span>
        </div>

        {currentPlan !== "free" && (
          <Button
            onClick={handleManageBilling}
            disabled={portalLoading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            請求設定を管理
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* 料金プラン */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <PricingPlans currentPlan={currentPlan} />
      </div>

      {/* 請求履歴 */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              請求履歴
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              過去のお支払い履歴
            </p>
          </div>
        </div>

        {currentPlan === "free" ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            有料プランに加入すると、ここに請求履歴が表示されます。
          </p>
        ) : (
          <Button
            onClick={handleManageBilling}
            disabled={portalLoading}
            variant="outline"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Receipt className="w-4 h-4 mr-2" />
            )}
            請求履歴を確認
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

