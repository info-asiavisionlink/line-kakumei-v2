import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SimulatorChat } from "@/src/components/simulator-chat";
import { Profile } from "@/types";

export default async function SimulatorPage() {
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

  const profile = profileData as (Profile & { is_admin?: boolean }) | null;

  if (!profile) {
    redirect("/signup");
  }

  return (
    <SimulatorChat
      tenantId={profile.tenant_id}
      isAdmin={Boolean(profile.is_admin)}
    />
  );
}
