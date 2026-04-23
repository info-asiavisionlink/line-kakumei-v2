"use client";

import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { UsageLog } from "@/types";

type UnresolvedLogsProps = {
  tenantId: string;
  logs: UsageLog[];
};

function getQuestion(log: UsageLog) {
  if (typeof log.user_message === "string" && log.user_message.length > 0) {
    return log.user_message;
  }
  if (log.metadata && typeof log.metadata.user_message === "string") {
    return log.metadata.user_message;
  }
  return "未解決の質問";
}

export function UnresolvedLogs({ tenantId, logs }: UnresolvedLogsProps) {
  const supabase = useMemo(() => createClient(), []);
  const [addingId, setAddingId] = useState<string | null>(null);

  const addToKnowledge = async (log: UsageLog) => {
    setAddingId(log.id);
    const question = getQuestion(log);
    const answer =
      (typeof log.ai_response === "string" ? log.ai_response : null) ??
      (log.metadata && typeof log.metadata.ai_response === "string"
        ? log.metadata.ai_response
        : null) ??
      "（回答候補を入力してください）";

    const { error } = await supabase.from("knowledge_base").insert({
      tenant_id: tenantId,
      title: question.slice(0, 120),
      content: answer,
      source_url: null,
      embedding_status: "pending",
    });

    if (error) {
      toast.error("ナレッジ追加に失敗しました。");
      setAddingId(null);
      return;
    }

    toast.success("未解決質問をナレッジへ追加しました。");
    setAddingId(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">未解決質問ログ</h1>
        <p className="mt-1 text-sm text-zinc-600">
          AIが回答できなかった内容を確認し、直接ナレッジに取り込めます。
        </p>
      </header>

      <Card className="border-[#06C755]/20">
        <CardHeader>
          <CardTitle>未解決一覧</CardTitle>
          <CardDescription>{logs.length} 件の未解決質問があります。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500">未解決質問はありません。</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <p className="text-sm font-medium text-zinc-900">{getQuestion(log)}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(log.created_at).toLocaleString("ja-JP")}
                </p>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    onClick={() => void addToKnowledge(log)}
                    disabled={addingId === log.id}
                  >
                    <PlusCircle className="mr-2 size-4" />
                    {addingId === log.id ? "追加中..." : "ナレッジへクイック追加"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
