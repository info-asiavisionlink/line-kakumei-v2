import { NextResponse } from "next/server";

const SIGNUP_HOOK_URL = "https://nextasia.app.n8n.cloud/webhook/line-support";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      company_name?: string;
      email?: string;
      password?: string;
    };

    const companyName = payload.company_name?.trim() ?? "";
    const email = payload.email?.trim() ?? "";
    const password = payload.password ?? "";

    if (!companyName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "必須パラメータが不足しています。" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      company_name: companyName,
      email,
      password,
    });

    const url = `${SIGNUP_HOOK_URL}?${params.toString()}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Webhook送信に失敗しました。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Webhook処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
