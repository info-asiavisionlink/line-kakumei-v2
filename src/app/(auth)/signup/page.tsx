"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Mail, Lock, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lineUid = searchParams.get("uid") ?? "";

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/login`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            company_name: companyName,
            line_uid: lineUid,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("確認メールを送信しました。メール認証後にログインしてください。");
      router.push("/login");
    } catch {
      toast.error("登録処理に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-[#06C755]/25">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-900">新規登録</CardTitle>
          <CardDescription>会社情報とアカウント情報を入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <input type="hidden" name="uid" value={lineUid} />

            <div className="space-y-2">
              <Label htmlFor="companyName">会社名</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-2.5 size-5 text-zinc-400" />
                <Input
                  id="companyName"
                  placeholder="株式会社LINE革命"
                  className="pl-10"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 size-5 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 size-5 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  className="pl-10"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <UserPlus className="mr-2 size-4" />
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-600">
            既にアカウントをお持ちですか？{" "}
            <Link href="/login" className="font-medium text-[#06C755] hover:underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
