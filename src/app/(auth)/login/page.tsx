"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("ログインしました。");
      router.push("/");
    } catch {
      toast.error("ログイン処理に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-[#06C755]/25">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-900">ログイン</CardTitle>
          <CardDescription>登録済みのメールアドレスでログインしてください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <LogIn className="mr-2 size-4" />
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-600">
            アカウントをお持ちでないですか？{" "}
            <Link href="/signup" className="font-medium text-[#06C755] hover:underline">
              新規登録
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
