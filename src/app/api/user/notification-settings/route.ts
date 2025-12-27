import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーの通知設定を取得（存在しない場合はデフォルト値を返す）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notificationSettings: true,
      },
    });

    // notificationSettingsフィールドがない場合のデフォルト値
    const defaultSettings = {
      emailEnabled: true,
      emailDigest: "weekly",
      pushEnabled: true,
      newArticles: true,
      learningReminders: true,
      streakReminders: true,
      achievementAlerts: true,
      weeklyProgress: true,
      flashcardReview: true,
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    };

    // ユーザーの設定があればパース、なければデフォルト
    const settings = user?.notificationSettings
      ? typeof user.notificationSettings === "string"
        ? JSON.parse(user.notificationSettings)
        : user.notificationSettings
      : defaultSettings;

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to get notification settings:", error);
    return NextResponse.json(
      { error: "Failed to get notification settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 通知設定を更新
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationSettings: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
