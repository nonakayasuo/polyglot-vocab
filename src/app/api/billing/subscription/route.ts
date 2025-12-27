import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        // subscriptionTier などがあれば追加
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 現在のプラン情報（デフォルトはfree）
    const currentPlan = "free";
    const plan = PLANS[currentPlan as keyof typeof PLANS];

    return NextResponse.json({
      currentPlan,
      planDetails: {
        name: plan.name,
        nameJa: plan.nameJa,
        price: plan.price,
        features: plan.featuresJa,
      },
      isActive: true,
      // subscriptionId: null,
      // currentPeriodEnd: null,
    });
  } catch (error) {
    console.error("Failed to get subscription:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}

