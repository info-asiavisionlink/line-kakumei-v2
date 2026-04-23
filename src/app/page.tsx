import Link from "next/link";
import { Bot, MessageCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-12">
      <section className="w-full rounded-2xl border border-[#06C755]/20 bg-white/90 p-8 shadow-sm md:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-[#06C755]">LINE革命 AI SaaS</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
            LINE運用を、学習するAIで自動化
          </h1>
          <p className="mt-4 text-base text-zinc-600 md:text-lg">
            ナレッジを学習し、LINE連携で24時間対応を実現。設定から改善までを一つの管理画面で完結できます。
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="min-w-44">
            <Link href="/signup">今すぐ始める</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-44">
            <Link href="/login">ログイン</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Bot className="size-5 text-[#06C755]" />}
            title="AI学習"
            description="FAQやWebページからナレッジを学習し、回答品質を継続的に改善。"
          />
          <FeatureCard
            icon={<MessageCircle className="size-5 text-[#06C755]" />}
            title="LINE連携"
            description="LINEチャネルと連携し、問い合わせ対応を自動化して運用負荷を削減。"
          />
          <FeatureCard
            icon={<ShieldCheck className="size-5 text-[#06C755]" />}
            title="24時間対応"
            description="営業時間外でも即時応答。取りこぼしを防ぎ、顧客満足度を向上。"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-[#06C755]/15">
      <CardHeader className="pb-3">
        <div className="mb-2 inline-flex w-fit rounded-md bg-[#06C755]/10 p-2">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
