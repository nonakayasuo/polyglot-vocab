import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// コンテンツ設定を取得
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userContentSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      // デフォルト設定を返す
      return NextResponse.json({
        adultContentEnabled: false,
        ageVerified: false,
        dateOfBirth: null,
        showSlang: true,
        showTaboo: false,
        preferredCategories: ["news", "entertainment"],
        blockedCategories: [],
      });
    }

    return NextResponse.json({
      adultContentEnabled: settings.adultContentEnabled,
      ageVerified: settings.ageVerified,
      dateOfBirth: settings.dateOfBirth?.toISOString() || null,
      showSlang: settings.showSlang,
      showTaboo: settings.showTaboo,
      preferredCategories: JSON.parse(settings.preferredCategories),
      blockedCategories: JSON.parse(settings.blockedCategories),
    });
  } catch (error) {
    console.error("Failed to get content settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// コンテンツ設定を更新
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      adultContentEnabled,
      ageVerified,
      dateOfBirth,
      showSlang,
      showTaboo,
      preferredCategories,
      blockedCategories,
    } = body;

    // 年齢確認が必要な機能の検証
    if ((adultContentEnabled || showTaboo) && !ageVerified) {
      return NextResponse.json(
        { error: "Age verification required for adult content" },
        { status: 400 },
      );
    }

    // 年齢確認
    let ageVerifiedAt = null;
    if (ageVerified && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        return NextResponse.json(
          { error: "Must be 18 or older for adult content" },
          { status: 400 },
        );
      }

      ageVerifiedAt = new Date();
    }

    const settings = await prisma.userContentSettings.upsert({
      where: { userId: session.user.id },
      update: {
        adultContentEnabled: adultContentEnabled ?? false,
        ageVerified: ageVerified ?? false,
        ageVerifiedAt: ageVerifiedAt,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        showSlang: showSlang ?? true,
        showTaboo: showTaboo ?? false,
        preferredCategories: JSON.stringify(preferredCategories || []),
        blockedCategories: JSON.stringify(blockedCategories || []),
      },
      create: {
        userId: session.user.id,
        adultContentEnabled: adultContentEnabled ?? false,
        ageVerified: ageVerified ?? false,
        ageVerifiedAt: ageVerifiedAt,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        showSlang: showSlang ?? true,
        showTaboo: showTaboo ?? false,
        preferredCategories: JSON.stringify(preferredCategories || []),
        blockedCategories: JSON.stringify(blockedCategories || []),
      },
    });

    return NextResponse.json({
      adultContentEnabled: settings.adultContentEnabled,
      ageVerified: settings.ageVerified,
      dateOfBirth: settings.dateOfBirth?.toISOString() || null,
      showSlang: settings.showSlang,
      showTaboo: settings.showTaboo,
      preferredCategories: JSON.parse(settings.preferredCategories),
      blockedCategories: JSON.parse(settings.blockedCategories),
    });
  } catch (error) {
    console.error("Failed to update content settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
