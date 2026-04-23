import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { UnresolvedLogs } from "@/src/components/unresolved-logs";
import { Profile, UsageLog } from "@/types";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile) {
    redirect("/signup");
  }

  const { data: unresolvedRows } = await supabase
    .from("usage_logs")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .eq("is_unresolved", true)
    .order("created_at", { ascending: false });

  return (
    <UnresolvedLogs
      tenantId={profile.tenant_id}
      logs={(unresolvedRows ?? []) as UsageLog[]}
    />
  );
}
