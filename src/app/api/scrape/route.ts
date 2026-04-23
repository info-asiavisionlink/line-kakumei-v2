import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG, PlanType, Profile } from "@/types";

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };

    if (!url) {
      return NextResponse.json(
        { error: "URLを指定してください。" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です。" },
        { status: 401 },
      );
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;

    if (!profile) {
      return NextResponse.json(
        { error: "プロフィール情報が見つかりません。" },
        { status: 404 },
      );
    }

    const plan = PLAN_CONFIG[profile.plan_type as PlanType] ?? PLAN_CONFIG.free;
    const { start, end } = getCurrentMonthRange();

    const { data: usageRows } = await supabase
      .from("usage_logs")
      .select("usage_count")
      .eq("tenant_id", profile.tenant_id)
      .gte("created_at", start)
      .lt("created_at", end);

    const monthlyUsage = (usageRows ?? []).reduce(
      (sum, row) => sum + (row.usage_count ?? 0),
      0,
    );

    if (monthlyUsage >= plan.monthlyMessageLimit) {
      return NextResponse.json(
        { error: "プラン上限に達しているため、AI自動学習を実行できません。" },
        { status: 403 },
      );
    }

    if (!process.env.N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL が設定されていません。" },
        { status: 500 },
      );
    }

    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_API_KEY
          ? { Authorization: `Bearer ${process.env.N8N_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        tenantId: profile.tenant_id,
        userId: user.id,
        url,
        planType: profile.plan_type,
        monthlyUsage,
        monthlyLimit: plan.monthlyMessageLimit,
      }),
    });

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: "n8nへの転送に失敗しました。" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "AI自動学習を開始しました。",
    });
  } catch {
    return NextResponse.json(
      { error: "AI自動学習の処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
