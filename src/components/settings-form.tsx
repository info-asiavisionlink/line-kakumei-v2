"use client";

import { FormEvent, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type SettingsFormProps = {
  tenantId: string;
  initialChannelAccessToken: string;
  initialChannelSecret: string;
  initialSystemPrompt: string;
};

export function SettingsForm({
  tenantId,
  initialChannelAccessToken,
  initialChannelSecret,
  initialSystemPrompt,
}: SettingsFormProps) {
  const supabase = useMemo(() => createClient(), []);

  const [channelAccessToken, setChannelAccessToken] = useState(
    initialChannelAccessToken,
  );
  const [channelSecret, setChannelSecret] = useState(initialChannelSecret);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("line_configs").upsert(
      {
        tenant_id: tenantId,
        channel_access_token: channelAccessToken || null,
        channel_secret: channelSecret || null,
        system_prompt: systemPrompt || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" },
    );

    if (error) {
      toast.error(error.message);
      setIsSaving(false);
      return;
    }

    toast.success("AI設定を保存しました。");
    setIsSaving(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">AI設定</h1>
        <p className="mt-1 text-sm text-zinc-600">
          LINE連携情報とシステムプロンプトを編集できます。
        </p>
      </header>

      <Card className="border-[#06C755]/20">
        <CardHeader>
          <CardTitle>LINEチャネル設定</CardTitle>
          <CardDescription>
            LINE Messaging APIのチャネルトークンとシークレットを保存します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelAccessToken">チャネルアクセストークン</Label>
              <Input
                id="channelAccessToken"
                value={channelAccessToken}
                onChange={(e) => setChannelAccessToken(e.target.value)}
                placeholder="LINE Channel Access Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channelSecret">チャネルシークレット</Label>
              <Input
                id="channelSecret"
                value={channelSecret}
                onChange={(e) => setChannelSecret(e.target.value)}
                placeholder="LINE Channel Secret"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">システムプロンプト（AIの性格設定）</Label>
              <textarea
                id="systemPrompt"
                className="min-h-40 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-[#06C755] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755]/20"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="AIの応答トーンや禁止事項、優先事項を記載"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 size-4" />
              {isSaving ? "保存中..." : "設定を保存"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
