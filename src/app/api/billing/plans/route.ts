import { NextResponse } from "next/server";
import { PLANS } from "@/lib/stripe";

export async function GET() {
  // 料金プラン情報を返す（公開API）
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    nameJa: plan.nameJa,
    price: plan.price,
    priceFormatted: plan.price === 0 ? "無料" : `¥${plan.price.toLocaleString()}/月`,
    features: plan.featuresJa,
  }));

  return NextResponse.json({
    plans,
    currency: "JPY",
    billingCycle: "monthly",
  });
}

