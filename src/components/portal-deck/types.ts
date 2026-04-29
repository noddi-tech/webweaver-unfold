import type { Database } from "@/integrations/supabase/types";

export type VisualType =
  | "cover"
  | "logos"
  | "badges"
  | "funnel"
  | "adoption"
  | "glide"
  | "team"
  | "round"
  | "gap"
  | "verticals"
  | "customer-spotlight"
  | "custom";

export type SlideMode = "viewer" | "present" | "print";

type PortalSlideRow = Database["public"]["Tables"]["portal_slides"]["Row"];

export interface CoverConfig {
  brand?: string;
}

export interface LogosConfig {
  caption?: string;
}

export interface BadgeItem {
  icon: string;
  problem: string;
  solution: string;
}

export interface BadgesConfig {
  badges: BadgeItem[];
}

export interface FunnelConfig {
  caption?: string;
}

export interface AdoptionConfig {
  caption?: string;
}

export interface GlideConfig {
  break_even_nok?: number;
}

export interface TeamConfig {
  caption?: string;
}

export interface RoundConfig {
  cta_label?: string;
}

export interface GapCompetitor {
  name: string;
  position: number;
}

export interface GapCategory {
  label: string;
  navio_position: number;
  competitors: GapCompetitor[];
}

export interface GapConfig {
  categories: GapCategory[];
}

export interface VerticalItem {
  name: string;
  description: string;
  status: string;
}

export interface VerticalsConfig {
  verticals: VerticalItem[];
}

export interface CustomerSpotlightConfig {
  customer_slug: string;
}

export interface CustomConfig {
  accent?: string;
}

export type VisualConfig =
  | CoverConfig
  | LogosConfig
  | BadgesConfig
  | FunnelConfig
  | AdoptionConfig
  | GlideConfig
  | TeamConfig
  | RoundConfig
  | GapConfig
  | VerticalsConfig
  | CustomerSpotlightConfig
  | CustomConfig;

export interface SlideRow extends Omit<PortalSlideRow, "visual_config" | "visual_type"> {
  visual_type: VisualType | null;
  visual_config: VisualConfig | null;
}

export interface PortalCustomerRow {
  id: string;
  slug: string;
  name: string;
  parent_brand: string | null;
  logo_url: string | null;
  status: string | null;
  funnel_stage: string | null;
  cities_live: number | null;
  customers_per_day: number | null;
  monthly_revenue_nok: number | null;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;
  display_order: number;
}

export interface SlideVisualProps<TConfig extends VisualConfig = VisualConfig> {
  slide: SlideRow;
  config: TConfig | null;
  mode?: SlideMode;
}

const visualTypes = new Set<VisualType>([
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
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function optionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

export function isVisualType(value: unknown): value is VisualType {
  return isString(value) && visualTypes.has(value as VisualType);
}

export function isLogosConfig(config: unknown): config is LogosConfig {
  return isRecord(config) && optionalString(config.caption);
}

export function isBadgesConfig(config: unknown): config is BadgesConfig {
  if (!isRecord(config) || !Array.isArray(config.badges)) return false;
  return config.badges.every((badge) => {
    if (!isRecord(badge)) return false;
    return isString(badge.icon) && isString(badge.problem) && isString(badge.solution);
  });
}

export function isGlideConfig(config: unknown): config is GlideConfig {
  return isRecord(config) && (config.break_even_nok === undefined || isNumber(config.break_even_nok));
}

export function isGapConfig(config: unknown): config is GapConfig {
  if (!isRecord(config) || !Array.isArray(config.categories)) return false;
  return config.categories.every((category) => {
    if (!isRecord(category) || !isString(category.label) || !isNumber(category.navio_position) || !Array.isArray(category.competitors)) return false;
    return category.competitors.every((competitor) => isRecord(competitor) && isString(competitor.name) && isNumber(competitor.position));
  });
}

export function isVerticalsConfig(config: unknown): config is VerticalsConfig {
  if (!isRecord(config) || !Array.isArray(config.verticals)) return false;
  return config.verticals.every((vertical) => isRecord(vertical) && isString(vertical.name) && isString(vertical.description) && isString(vertical.status));
}

export function isCustomerSpotlightConfig(config: unknown): config is CustomerSpotlightConfig {
  return isRecord(config) && isString(config.customer_slug);
}

export function normalizeSlide(row: PortalSlideRow): SlideRow {
  const visualType = isVisualType(row.visual_type) ? row.visual_type : null;
  const rawConfig: unknown = row.visual_config;
  let visualConfig: VisualConfig | null = null;

  if (isRecord(rawConfig)) {
    switch (visualType) {
      case "logos":
        visualConfig = isLogosConfig(rawConfig) ? rawConfig : null;
        break;
      case "badges":
        visualConfig = isBadgesConfig(rawConfig) ? rawConfig : null;
        break;
      case "glide":
        visualConfig = isGlideConfig(rawConfig) ? rawConfig : null;
        break;
      case "gap":
        visualConfig = isGapConfig(rawConfig) ? rawConfig : null;
        break;
      case "verticals":
        visualConfig = isVerticalsConfig(rawConfig) ? rawConfig : null;
        break;
      case "customer-spotlight":
        visualConfig = isCustomerSpotlightConfig(rawConfig) ? rawConfig : null;
        break;
      default:
        visualConfig = rawConfig;
        break;
    }
  }

  return { ...row, visual_type: visualType, visual_config: visualConfig };
}
