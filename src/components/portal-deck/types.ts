import type { Database } from "@/integrations/supabase/types";
import type { ChartAnnotation, FunnelStage, MetricItem, TextPair } from "./components/types";

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
  eyebrow?: string;
  headline?: string;
  supporting?: string;
  layout?: string;
  background?: "gradient" | "minimal" | string;
  footer?: { note?: string; sources?: string[] } | string;
}

export interface LogosConfig {
  headline?: string;
  caption?: string;
  greyscale?: boolean;
  columns?: number;
  customer_slugs?: string[];
}

export interface BadgeItem extends TextPair {
  icon?: string;
  problem?: string;
  solution?: string;
}

export interface BadgesConfig {
  pairs: TextPair[];
  badges?: BadgeItem[];
}

export interface FunnelConfig {
  caption?: string;
  stages?: FunnelStage[];
}

export interface AdoptionConfig {
  caption?: string;
  headline?: string;
  chartType?: string;
  annotations?: ChartAnnotation[];
}

export interface GlideConfig {
  headline?: string;
  annotations?: ChartAnnotation[];
  breakEvenLabel?: string;
  break_even_nok?: number;
}

export interface TeamConfig {
  layout?: string;
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

export interface GapRow {
  category: string;
  leftValue: string;
  rightValue: string;
}

export interface GapConfig {
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
  rows?: GapRow[];
  categories?: GapCategory[];
}

export interface VerticalItem {
  name: string;
  description: string;
  status: string;
  icon?: string;
}

export interface VerticalsConfig {
  items: VerticalItem[];
  verticals?: VerticalItem[];
}

export interface CustomerSpotlightConfig {
  customer_slug: string;
  layout?: string;
  metrics?: MetricItem[];
}

export type ComponentRefName =
  | "Hero"
  | "StatCallout"
  | "StatGrid"
  | "LogoGrid"
  | "QuoteBlock"
  | "ComparisonTable"
  | "Timeline"
  | "ProcessFlow"
  | "ProblemSolutionGrid"
  | "AnnotatedChart"
  | "FunnelLayout"
  | "CustomerSpotlight"
  | "SectionDivider"
  | "CitationFooter"
  | "PersonCard"
  | "CategoryCard";

export interface ComponentRef {
  component: ComponentRefName;
  props?: Record<string, unknown>;
}

export interface CustomConfig {
  composition?: ComponentRef[];
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

const componentNames = new Set<ComponentRefName>([
  "Hero", "StatCallout", "StatGrid", "LogoGrid", "QuoteBlock", "ComparisonTable", "Timeline", "ProcessFlow", "ProblemSolutionGrid", "AnnotatedChart", "FunnelLayout", "CustomerSpotlight", "SectionDivider", "CitationFooter", "PersonCard", "CategoryCard",
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

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter(isString) : undefined;
}

function normalizeTextPair(value: unknown): TextPair | null {
  if (!isRecord(value)) return null;
  const title = isString(value.title) ? value.title : isString(value.problem) ? value.problem : null;
  const description = isString(value.description) ? value.description : isString(value.solution) ? value.solution : null;
  if (!title || !description) return null;
  return {
    label: isString(value.label) ? value.label : undefined,
    title,
    description,
    metric: isString(value.metric) ? value.metric : undefined,
  };
}

function normalizeMetric(value: unknown): MetricItem | null {
  if (!isRecord(value) || !isString(value.label) || !isString(value.value)) return null;
  return { label: value.label, value: value.value, context: isString(value.context) ? value.context : undefined, trend: isString(value.trend) ? value.trend : undefined };
}

function normalizeAnnotation(value: unknown): ChartAnnotation | null {
  if (!isRecord(value) || !isString(value.label) || !isString(value.pointLabel)) return null;
  return { label: value.label, pointLabel: value.pointLabel, description: isString(value.description) ? value.description : undefined, align: value.align === "left" || value.align === "right" ? value.align : undefined };
}

function normalizeFunnelStage(value: unknown): FunnelStage | null {
  if (!isRecord(value) || !isString(value.label) || !isString(value.value)) return null;
  return { label: value.label, value: value.value, context: isString(value.context) ? value.context : undefined, widthPct: isNumber(value.widthPct) ? value.widthPct : 100 };
}

export function isVisualType(value: unknown): value is VisualType {
  return isString(value) && visualTypes.has(value as VisualType);
}

export function isLogosConfig(config: unknown): config is LogosConfig {
  return isRecord(config) && optionalString(config.caption) && optionalString(config.headline);
}

export function normalizeLogosConfig(config: unknown): LogosConfig | null {
  if (!isRecord(config)) return null;
  return { headline: isString(config.headline) ? config.headline : undefined, caption: isString(config.caption) ? config.caption : undefined, greyscale: typeof config.greyscale === "boolean" ? config.greyscale : undefined, columns: isNumber(config.columns) ? config.columns : undefined, customer_slugs: stringArray(config.customer_slugs) };
}

export function normalizeBadgesConfig(config: unknown): BadgesConfig | null {
  if (!isRecord(config)) return null;
  const rawPairs = Array.isArray(config.pairs) ? config.pairs : Array.isArray(config.badges) ? config.badges : [];
  const pairs = rawPairs.map(normalizeTextPair).filter(Boolean) as TextPair[];
  return pairs.length ? { pairs } : null;
}

export function isBadgesConfig(config: unknown): config is BadgesConfig {
  return !!normalizeBadgesConfig(config);
}

export function normalizeFunnelConfig(config: unknown): FunnelConfig | null {
  if (!isRecord(config)) return null;
  const stages = Array.isArray(config.stages) ? (config.stages.map(normalizeFunnelStage).filter(Boolean) as FunnelStage[]) : undefined;
  return { caption: isString(config.caption) ? config.caption : undefined, stages };
}

export function normalizeAdoptionConfig(config: unknown): AdoptionConfig | null {
  if (!isRecord(config)) return null;
  const annotations = Array.isArray(config.annotations) ? (config.annotations.map(normalizeAnnotation).filter(Boolean) as ChartAnnotation[]) : undefined;
  return { headline: isString(config.headline) ? config.headline : undefined, chartType: isString(config.chartType) ? config.chartType : undefined, caption: isString(config.caption) ? config.caption : undefined, annotations };
}

export function normalizeGlideConfig(config: unknown): GlideConfig | null {
  if (!isRecord(config)) return null;
  const annotations = Array.isArray(config.annotations) ? (config.annotations.map(normalizeAnnotation).filter(Boolean) as ChartAnnotation[]) : undefined;
  return { headline: isString(config.headline) ? config.headline : undefined, annotations, breakEvenLabel: isString(config.breakEvenLabel) ? config.breakEvenLabel : undefined, break_even_nok: isNumber(config.break_even_nok) ? config.break_even_nok : undefined };
}

export function isGlideConfig(config: unknown): config is GlideConfig {
  return !!normalizeGlideConfig(config);
}

export function normalizeGapConfig(config: unknown): GapConfig | null {
  if (!isRecord(config)) return null;
  const rows = Array.isArray(config.rows)
    ? config.rows.filter(isRecord).map((row) => isString(row.category) && isString(row.leftValue) && isString(row.rightValue) ? { category: row.category, leftValue: row.leftValue, rightValue: row.rightValue } : null).filter(Boolean) as GapRow[]
    : undefined;
  const categories = Array.isArray(config.categories)
    ? config.categories.filter(isRecord).map((category) => isString(category.label) ? { label: category.label, navio_position: isNumber(category.navio_position) ? category.navio_position : 0, competitors: Array.isArray(category.competitors) ? category.competitors.filter(isRecord).map((competitor) => ({ name: isString(competitor.name) ? competitor.name : "", position: isNumber(competitor.position) ? competitor.position : 0 })).filter((competitor) => competitor.name) : [] } : null).filter(Boolean) as GapCategory[]
    : undefined;
  return { title: isString(config.title) ? config.title : undefined, leftLabel: isString(config.leftLabel) ? config.leftLabel : undefined, rightLabel: isString(config.rightLabel) ? config.rightLabel : undefined, rows, categories };
}

export function isGapConfig(config: unknown): config is GapConfig {
  return !!normalizeGapConfig(config);
}

export function normalizeVerticalsConfig(config: unknown): VerticalsConfig | null {
  if (!isRecord(config)) return null;
  const raw = Array.isArray(config.items) ? config.items : Array.isArray(config.verticals) ? config.verticals : [];
  const items = raw.filter(isRecord).map((item) => isString(item.name) && isString(item.description) && isString(item.status) ? { name: item.name, description: item.description, status: item.status, icon: isString(item.icon) ? item.icon : undefined } : null).filter(Boolean) as VerticalItem[];
  return items.length ? { items } : null;
}

export function isVerticalsConfig(config: unknown): config is VerticalsConfig {
  return !!normalizeVerticalsConfig(config);
}

export function normalizeCustomerSpotlightConfig(config: unknown): CustomerSpotlightConfig | null {
  if (!isRecord(config) || !isString(config.customer_slug)) return null;
  const metrics = Array.isArray(config.metrics) ? (config.metrics.map(normalizeMetric).filter(Boolean) as MetricItem[]) : undefined;
  return { customer_slug: config.customer_slug, layout: isString(config.layout) ? config.layout : undefined, metrics };
}

export function isCustomerSpotlightConfig(config: unknown): config is CustomerSpotlightConfig {
  return !!normalizeCustomerSpotlightConfig(config);
}

export function normalizeCustomConfig(config: unknown): CustomConfig | null {
  if (!isRecord(config)) return null;
  const composition = Array.isArray(config.composition) ? config.composition.filter(isRecord).map((ref) => isString(ref.component) && componentNames.has(ref.component as ComponentRefName) ? { component: ref.component as ComponentRefName, props: isRecord(ref.props) ? ref.props : {} } : null).filter(Boolean) as ComponentRef[] : undefined;
  return { composition, accent: isString(config.accent) ? config.accent : undefined };
}

export function normalizeSlide(row: PortalSlideRow): SlideRow {
  const visualType = isVisualType(row.visual_type) ? row.visual_type : null;
  const rawConfig: unknown = row.visual_config;
  let visualConfig: VisualConfig | null = null;

  if (isRecord(rawConfig)) {
    switch (visualType) {
      case "logos":
        visualConfig = normalizeLogosConfig(rawConfig);
        break;
      case "badges":
        visualConfig = normalizeBadgesConfig(rawConfig);
        break;
      case "funnel":
        visualConfig = normalizeFunnelConfig(rawConfig);
        break;
      case "adoption":
        visualConfig = normalizeAdoptionConfig(rawConfig);
        break;
      case "glide":
        visualConfig = normalizeGlideConfig(rawConfig);
        break;
      case "gap":
        visualConfig = normalizeGapConfig(rawConfig);
        break;
      case "verticals":
        visualConfig = normalizeVerticalsConfig(rawConfig);
        break;
      case "customer-spotlight":
        visualConfig = normalizeCustomerSpotlightConfig(rawConfig);
        break;
      case "custom":
        visualConfig = normalizeCustomConfig(rawConfig);
        break;
      default:
        visualConfig = rawConfig;
        break;
    }
  } else if (visualType === "cover") {
    visualConfig = {};
  }

  return { ...row, visual_type: visualType, visual_config: visualConfig };
}
