import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types";

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as { message?: string };
    if (!message) {
      return NextResponse.json(
        { error: "メッセージを指定してください。" },
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
    const profile = profileData as (Profile & { is_admin?: boolean }) | null;

    if (!profile) {
      return NextResponse.json(
        { error: "プロフィールが見つかりません。" },
        { status: 404 },
      );
    }

    if (!profile.is_admin) {
      return NextResponse.json(
        { error: "管理者のみ利用できます。" },
        { status: 403 },
      );
    }

    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_CHAT_WEBHOOK_URL が設定されていません。" },
        { status: 500 },
      );
    }

    const n8nResponse = await fetch(webhookUrl, {
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
        message,
        simulator: true,
      }),
    });

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: "n8nチャットWebhookの呼び出しに失敗しました。" },
        { status: 502 },
      );
    }

    const payload = (await n8nResponse.json().catch(() => ({}))) as {
      reply?: string;
    };

    return NextResponse.json({
      reply: payload.reply ?? "テスト応答を受信しました。",
    });
  } catch {
    return NextResponse.json(
      { error: "チャット処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
