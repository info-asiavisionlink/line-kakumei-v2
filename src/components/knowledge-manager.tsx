"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { BookPlus, Globe, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { KnowledgeBase, PlanType, PLAN_CONFIG } from "@/types";

type KnowledgeManagerProps = {
  tenantId: string;
  planType: PlanType;
  initialItems: KnowledgeBase[];
};

export function KnowledgeManager({
  tenantId,
  planType,
  initialItems,
}: KnowledgeManagerProps) {
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [learningUrl, setLearningUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLearning, setIsLearning] = useState(false);

  const reloadKnowledge = async () => {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("ナレッジ一覧の取得に失敗しました。");
      return;
    }

    setItems((data ?? []) as KnowledgeBase[]);
  };

  const addKnowledge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAdding(true);

    const { error } = await supabase.from("knowledge_base").insert({
      tenant_id: tenantId,
      title,
      content,
      source_url: sourceUrl || null,
      embedding_status: "pending",
    });

    if (error) {
      toast.error(error.message);
      setIsAdding(false);
      return;
    }

    toast.success("Q&Aを追加しました。");
    setTitle("");
    setContent("");
    setSourceUrl("");
    await reloadKnowledge();
    setIsAdding(false);
  };

  const deleteKnowledge = async (id: string) => {
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);

    if (error) {
      toast.error("削除に失敗しました。");
      return;
    }

    toast.success("ナレッジを削除しました。");
    await reloadKnowledge();
  };

  const runAutoLearning = async () => {
    if (!learningUrl) {
      toast.error("URLを入力してください。");
      return;
    }

    setIsLearning(true);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: learningUrl }),
    });

    const payload = (await res.json()) as { error?: string; message?: string };

    if (!res.ok) {
      toast.error(payload.error ?? "AI自動学習の実行に失敗しました。");
      setIsLearning(false);
      return;
    }

    toast.success(payload.message ?? "AI自動学習を開始しました。");
    setLearningUrl("");
    setIsLearning(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">ナレッジ管理</h1>
          <p className="mt-1 text-sm text-zinc-600">
            手動登録またはURL学習で応答精度を向上させます。
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#06C755] hover:underline"
        >
          ダッシュボードに戻る
        </Link>
      </header>

      <Card className="border-[#06C755]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-[#06C755]" />
            AI自動学習
          </CardTitle>
          <CardDescription>
            現在のプラン: {PLAN_CONFIG[planType].label}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="https://example.com/faq"
            value={learningUrl}
            onChange={(e) => setLearningUrl(e.target.value)}
          />
          <Button onClick={runAutoLearning} disabled={isLearning}>
            {isLearning ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                実行中...
              </>
            ) : (
              <>
                <Globe className="mr-2 size-4" />
                AI自動学習
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookPlus className="size-5 text-[#06C755]" />
            Q&Aを手動追加
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addKnowledge} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">質問タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 営業時間は？"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">回答内容</Label>
              <textarea
                id="content"
                className="min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-[#06C755] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755]/20"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="回答内容を入力"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">参照URL（任意）</Label>
              <Input
                id="sourceUrl"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article"
              />
            </div>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "追加中..." : "Q&Aを追加"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>登録済みナレッジ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">まだナレッジがありません。</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{item.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">
                    {item.content}
                  </p>
                  {item.source_url ? (
                    <p className="mt-2 truncate text-xs text-[#06C755]">
                      {item.source_url}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void deleteKnowledge(item.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  削除
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
