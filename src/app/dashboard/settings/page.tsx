import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/src/components/settings-form";
import { LineConfig, Profile } from "@/types";

export default async function SettingsPage() {
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

  const { data: configData } = await supabase
    .from("line_configs")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .maybeSingle();

  const config = configData as LineConfig | null;

  return (
    <SettingsForm
      tenantId={profile.tenant_id}
      initialChannelAccessToken={config?.channel_access_token ?? ""}
      initialChannelSecret={config?.channel_secret ?? ""}
      initialSystemPrompt={config?.system_prompt ?? ""}
    />
  );
}
