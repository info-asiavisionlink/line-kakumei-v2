import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { KnowledgeManager } from "@/src/components/knowledge-manager";
import { KnowledgeBase, Profile } from "@/types";

export default async function KnowledgePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/signup");
  }

  const { data: knowledgeRows } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("tenant_id", (profile as Profile).tenant_id)
    .order("created_at", { ascending: false });

  return (
    <KnowledgeManager
      tenantId={(profile as Profile).tenant_id}
      planType={(profile as Profile).plan_type}
      initialItems={(knowledgeRows ?? []) as KnowledgeBase[]}
    />
  );
}
