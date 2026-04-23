import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, MessageSquare } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG, PlanType, Profile } from "@/types";
import { UsageWarningToast } from "@/src/components/usage-warning-toast";

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile) {
    redirect("/signup");
  }

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
  const plan = PLAN_CONFIG[profile.plan_type as PlanType] ?? PLAN_CONFIG.free;
  const usagePercentage = Math.min(
    100,
    (monthlyUsage / plan.monthlyMessageLimit) * 100,
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <UsageWarningToast
        usagePercentage={usagePercentage}
        usedMessages={monthlyUsage}
        maxMessages={plan.monthlyMessageLimit}
      />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {profile.company_name} の今月の利用状況です。
          </p>
        </div>
        <Link
          href="/dashboard/knowledge"
          className="inline-flex items-center gap-2 rounded-md border border-[#06C755]/30 bg-white px-4 py-2 text-sm font-medium text-[#06C755] transition-colors hover:bg-[#06C755]/10"
        >
          <BookOpen className="size-4" />
          ナレッジ管理へ
        </Link>
      </header>

      <Card className="border-[#06C755]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <BarChart3 className="size-5 text-[#06C755]" />
            通数利用状況
          </CardTitle>
          <CardDescription>
            プラン: {plan.label}（上限 {plan.monthlyMessageLimit.toLocaleString()}通/月）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">現在の利用通数</span>
            <span className="font-medium text-zinc-900">
              {monthlyUsage.toLocaleString()} / {plan.monthlyMessageLimit.toLocaleString()} 通
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-[#06C755] transition-all"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">
            利用率: {usagePercentage.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <MessageSquare className="size-5 text-[#06C755]" />
            次のアクション
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600">
          ナレッジ管理画面からQ&Aを追加し、AI自動学習でURLコンテンツを取り込めます。
        </CardContent>
      </Card>
    </main>
  );
}
