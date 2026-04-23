import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl border-[#06C755]/20">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-900">LINE革命</CardTitle>
          <CardDescription>
            認証基盤の初期実装が完了しました。ログインまたは新規登録から開始してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/signup">新規登録</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
