import type { Database, Json } from "@/integrations/supabase/types";
import type { VisualType } from "@/components/portal-deck/types";

export type PortalSlideRow = Database["public"]["Tables"]["portal_slides"]["Row"];
export type PortalCustomerRow = Database["public"]["Tables"]["portal_customers"]["Row"];
export type PortalAdoptionPointRow = Database["public"]["Tables"]["portal_adoption_points"]["Row"];
export type PortalFinancialRow = Database["public"]["Tables"]["portal_financial_projections"]["Row"];
export type PortalTeamMemberRow = Database["public"]["Tables"]["portal_team_members"]["Row"];
export type PortalRoundTermsRow = Database["public"]["Tables"]["portal_round_terms"]["Row"];
export type InvestorSessionRow = Database["public"]["Tables"]["investor_sessions"]["Row"];
export type InvestorPledgeRow = Database["public"]["Tables"]["investor_pledges"]["Row"];
export type InvestorEventRow = Database["public"]["Tables"]["investor_events"]["Row"];

export type PortalSlideBriefRow = {
  id: string;
  slug: string;
  narrative_position: number;
  narrative_role: string;
  drafting_guidance: string;
  suggested_visual_types: string[];
  reference_resources: string[] | null;
  created_at: string;
  updated_at: string;
};

export type SlideDraftResponse = {
  title: string;
  subtitle?: string;
  body_md?: string;
  visual_type: VisualType;
  visual_config: Record<string, unknown>;
};

export interface InvestorSummary {
  email: string | null;
  name: string | null;
  firm: string | null;
  total_visits: number | null;
  total_dwell_seconds: number | null;
  last_seen_at: string | null;
  first_seen_at: string | null;
  has_accepted_nda: boolean | null;
  nda_accepted_at: string | null;
  has_pledge: boolean | null;
  pledge_amount_nok: number | null;
  pledge_is_firm: boolean | null;
  pledge_updated_at: string | null;
}

export const VISUAL_TYPES: VisualType[] = [
  "cover",
  "logos",
  "badges",
  "funnel",
  "adoption",
  "glide",
  "team",
  "round",
  "gap",
  "verticals",
  "customer-spotlight",
  "custom",
];

export const CURATED_ICONS = [
  "Database", "Users", "Truck", "Smartphone", "TrendingUp", "Briefcase", "Building", "Globe", "Zap", "Layers", "Activity", "Target", "Award", "BarChart", "Calendar", "CheckCircle", "Clock", "Compass", "DollarSign", "FileText", "Gauge", "Heart", "Home", "Lightbulb", "Map", "MessageCircle", "Package", "PieChart", "Rocket", "Settings", "Shield", "Star", "Tag", "Tool", "TrendingDown", "User", "Wallet", "Wrench", "Building2", "BarChart3"
];

export type UseOfFundsItem = { label: string; pct: number };

export type SlideFormValues = {
  id?: string;
  slug: string;
  slide_number: number;
  title: string;
  subtitle: string;
  body_md: string;
  visual_type: VisualType;
  visual_config: Json;
  is_published: boolean;
  display_order: number;
};
