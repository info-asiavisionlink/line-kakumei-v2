export type PlanType = "free" | "economy" | "business" | "first";

export interface Profile {
  id: string;
  tenant_id: string;
  line_user_id: string | null;
  company_name: string;
  email: string;
  plan_type: PlanType;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  source_url: string | null;
  embedding_status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  action_type: "line_message" | "ai_response" | "api_call";
  usage_count: number;
  is_unresolved?: boolean;
  user_message?: string | null;
  ai_response?: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LineConfig {
  id: string;
  tenant_id: string;
  channel_access_token: string | null;
  channel_secret: string | null;
  system_prompt: string | null;
  updated_at: string;
}

export const PLAN_CONFIG: Record<
  PlanType,
  { label: string; monthlyMessageLimit: number }
> = {
  free: {
    label: "Free",
    monthlyMessageLimit: 300,
  },
  economy: {
    label: "Economy",
    monthlyMessageLimit: 3_000,
  },
  business: {
    label: "Business",
    monthlyMessageLimit: 30_000,
  },
  first: {
    label: "First",
    monthlyMessageLimit: 100_000,
  },
};
