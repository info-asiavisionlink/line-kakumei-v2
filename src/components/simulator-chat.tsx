"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, SendHorizontal, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type SimulatorChatProps = {
  tenantId: string;
  isAdmin: boolean;
};

export function SimulatorChat({ tenantId, isAdmin }: SimulatorChatProps) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || !isAdmin) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        tenantId,
        userId,
      }),
    });

    const payload = (await res.json()) as { reply?: string; error?: string };

    if (!res.ok) {
      toast.error(payload.error ?? "シミュレーターの実行に失敗しました。");
      setIsSending(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: payload.reply ?? "応答がありませんでした。" },
    ]);
    setIsSending(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">AIシミュレーター</h1>
        <p className="mt-1 text-sm text-zinc-600">
          実際のLINE通数を消費せず、管理者が応答をテストできます。
        </p>
      </header>

      {!isAdmin ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <ShieldAlert className="size-5" />
              管理者専用機能
            </CardTitle>
            <CardDescription className="text-amber-800">
              この画面は管理者のみ利用できます。`profiles.is_admin` を有効にしてください。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="border-[#06C755]/20">
        <CardHeader>
          <CardTitle>テストチャット</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[380px] space-y-3 overflow-y-auto rounded-md border border-zinc-200 bg-white p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-500">
                ここに会話履歴が表示されます。
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`inline-flex max-w-[85%] items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-[#06C755] text-white"
                        : "bg-zinc-100 text-zinc-900"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="mt-0.5 size-4 shrink-0" />
                    ) : (
                      <Bot className="mt-0.5 size-4 shrink-0 text-[#06C755]" />
                    )}
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-[#06C755] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755]/20"
              placeholder="テストメッセージを入力"
              disabled={!isAdmin || isSending}
            />
            <Button type="submit" disabled={!isAdmin || isSending}>
              <SendHorizontal className="mr-2 size-4" />
              {isSending ? "送信中..." : "送信"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
