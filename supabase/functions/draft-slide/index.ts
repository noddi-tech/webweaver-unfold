import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = "claude-opus-4-7";
const MAX_DRAFTS_PER_HOUR = 30;
const VALID_VISUAL_TYPES = new Set(["cover", "logos", "badges", "funnel", "adoption", "glide", "team", "round", "gap", "verticals", "customer-spotlight", "custom"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DraftRequest = { slug?: unknown; editor_prompt?: unknown; selected_references?: unknown };
type DraftResponse = { title: string; subtitle?: string; body_md?: string; visual_type: string; visual_config: Record<string, unknown> };
type Brief = { slug: string; narrative_role: string; drafting_guidance: string; suggested_visual_types: string[]; reference_resources: string[] | null };
type ValidationResult = { ok: true; value: DraftResponse } | { ok: false; errors: string[] };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

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

function isLogosLikeConfig(config: unknown): boolean {
  return isRecord(config) && optionalString(config.caption);
}

function isBadgesConfig(config: unknown): boolean {
  return isRecord(config) && Array.isArray(config.badges) && config.badges.every((badge) => isRecord(badge) && isString(badge.icon) && isString(badge.problem) && isString(badge.solution));
}

function isGlideConfig(config: unknown): boolean {
  return isRecord(config) && (config.break_even_nok === undefined || isNumber(config.break_even_nok));
}

function isGapConfig(config: unknown): boolean {
  return isRecord(config) && Array.isArray(config.categories) && config.categories.every((category) => {
    if (!isRecord(category) || !isString(category.label) || !isNumber(category.navio_position) || !Array.isArray(category.competitors)) return false;
    return category.competitors.every((competitor) => isRecord(competitor) && isString(competitor.name) && isNumber(competitor.position));
  });
}

function isVerticalsConfig(config: unknown): boolean {
  return isRecord(config) && Array.isArray(config.verticals) && config.verticals.every((vertical) => isRecord(vertical) && isString(vertical.name) && isString(vertical.description) && isString(vertical.status));
}

function isCustomerSpotlightConfig(config: unknown): boolean {
  return isRecord(config) && isString(config.customer_slug) && config.customer_slug.length > 0;
}

function isRoundConfig(config: unknown): boolean {
  return isRecord(config) && optionalString(config.cta_label);
}

function validateVisualConfig(visualType: string, config: unknown): string | null {
  if (!isRecord(config)) return "visual_config must be an object";
  switch (visualType) {
    case "cover":
    case "custom":
      return null;
    case "logos":
    case "funnel":
    case "adoption":
    case "team":
      return isLogosLikeConfig(config) ? null : "visual_config.caption must be a string when provided";
    case "badges":
      return isBadgesConfig(config) ? null : "visual_config.badges must be an array of { icon, problem, solution } strings";
    case "glide":
      return isGlideConfig(config) ? null : "visual_config.break_even_nok must be a number when provided";
    case "round":
      return isRoundConfig(config) ? null : "visual_config.cta_label must be a string when provided";
    case "gap":
      return isGapConfig(config) ? null : "visual_config.categories must contain label, navio_position, and competitors";
    case "verticals":
      return isVerticalsConfig(config) ? null : "visual_config.verticals must be an array of { name, description, status } strings";
    case "customer-spotlight":
      return isCustomerSpotlightConfig(config) ? null : "visual_config.customer_slug must be a non-empty string";
    default:
      return "visual_type is not supported";
  }
}

function validateDraft(raw: unknown, suggested: string[]): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["response must be a JSON object"] };
  const title = raw.title;
  const subtitle = raw.subtitle;
  const body = raw.body_md;
  const visualType = raw.visual_type;
  const visualConfig = raw.visual_config;

  if (!isString(title) || title.trim().length < 1 || title.length > 80) errors.push("title is required and must be 1-80 characters");
  if (subtitle !== undefined && (!isString(subtitle) || subtitle.length > 120)) errors.push("subtitle must be a string up to 120 characters when provided");
  if (body !== undefined && (!isString(body) || body.length > 4000)) errors.push("body_md must be a string up to 4000 characters when provided");
  if (!isString(visualType) || !VALID_VISUAL_TYPES.has(visualType)) errors.push("visual_type must be a valid visual type");
  if (isString(visualType) && !suggested.includes(visualType)) errors.push("visual_type must be one of this slide brief's suggested_visual_types");
  if (isString(visualType)) {
    const configError = validateVisualConfig(visualType, visualConfig);
    if (configError) errors.push(configError);
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { title: String(title).trim(), subtitle: isString(subtitle) && subtitle.trim() ? subtitle.trim() : undefined, body_md: isString(body) && body.trim() ? body.trim() : undefined, visual_type: String(visualType), visual_config: visualConfig as Record<string, unknown> } };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("AI response was not parseable JSON");
  }
}

function schemasFor(types: string[]) {
  const schemaMap: Record<string, unknown> = {
    cover: { type: "object", additionalProperties: true },
    custom: { type: "object", additionalProperties: true },
    logos: { type: "object", properties: { caption: { type: "string" } } },
    funnel: { type: "object", properties: { caption: { type: "string" } } },
    adoption: { type: "object", properties: { caption: { type: "string" } } },
    team: { type: "object", properties: { caption: { type: "string" } } },
    round: { type: "object", properties: { cta_label: { type: "string" } } },
    glide: { type: "object", properties: { break_even_nok: { type: "number" } } },
    badges: { type: "object", required: ["badges"], properties: { badges: { type: "array", items: { type: "object", required: ["icon", "problem", "solution"], properties: { icon: { type: "string" }, problem: { type: "string" }, solution: { type: "string" } } } } } },
    gap: { type: "object", required: ["categories"], properties: { categories: { type: "array", items: { type: "object", required: ["label", "navio_position", "competitors"], properties: { label: { type: "string" }, navio_position: { type: "number" }, competitors: { type: "array", items: { type: "object", required: ["name", "position"], properties: { name: { type: "string" }, position: { type: "number" } } } } } } } } },
    verticals: { type: "object", required: ["verticals"], properties: { verticals: { type: "array", items: { type: "object", required: ["name", "description", "status"], properties: { name: { type: "string" }, description: { type: "string" }, status: { type: "string" } } } } } },
    "customer-spotlight": { type: "object", required: ["customer_slug"], properties: { customer_slug: { type: "string" } } },
  };
  return Object.fromEntries(types.map((type) => [type, schemaMap[type]]).filter(([, schema]) => Boolean(schema)));
}

async function fetchReferenceData(supabase: SupabaseClient, references: string[]) {
  const output: Record<string, unknown> = {};
  for (const reference of references) {
    if (reference === "portal_customers") {
      const { data, error } = await supabase.from("portal_customers").select("name,status,parent_brand,cities_live,testimonial_quote,testimonial_author,testimonial_role").eq("is_published", true).order("display_order");
      if (error) throw error;
      output[reference] = (data ?? []).map((row) => ({ name: row.name, status: row.status, parent_brand: row.parent_brand, cities_live: row.cities_live, testimonial: row.testimonial_quote ? { quote: row.testimonial_quote, author: row.testimonial_author, role: row.testimonial_role } : null }));
    } else if (reference === "portal_team_members") {
      const { data, error } = await supabase.from("portal_team_members").select("name,role,is_founder").eq("is_published", true).order("display_order");
      if (error) throw error;
      output[reference] = data ?? [];
    } else if (reference === "portal_financial_projections") {
      const { data, error } = await supabase.from("portal_financial_projections").select("period_label,arr_nok,is_actual").order("period_date");
      if (error) throw error;
      output[reference] = data ?? [];
    } else if (reference === "portal_round_terms") {
      const { data, error } = await supabase.from("portal_round_terms").select("*").eq("is_active", true).maybeSingle();
      if (error) throw error;
      output[reference] = data ?? null;
    } else if (reference === "media_assets:partner_logos") {
      const { data, error } = await supabase.from("media_assets").select("name,image_url").eq("section", "partner-logos");
      output[reference] = error ? { items: [], note: "media_assets table is not available in this project schema" } : data ?? [];
    }
  }
  return output;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ error: "ANTHROPIC_API_KEY is not configured" }, 503);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const serviceClient = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Invalid authentication" }, 401);

    const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin");
    if (adminError || !isAdmin) return json({ error: "Admin access required" }, 403);

    const body = (await req.json()) as DraftRequest;
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const editorPrompt = typeof body.editor_prompt === "string" ? body.editor_prompt.trim().slice(0, 4000) : "";
    const selectedReferences = Array.isArray(body.selected_references) ? body.selected_references.filter(isString) : [];
    if (!slug) return json({ error: "slug is required" }, 400);

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await serviceClient.from("portal_slide_drafts").select("id", { count: "exact", head: true }).eq("editor_user_id", userData.user.id).gte("created_at", since);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_DRAFTS_PER_HOUR) return json({ error: "Draft limit reached. Try again later." }, 429);

    const { data: brief, error: briefError } = await serviceClient.from("portal_slide_briefs").select("slug,narrative_role,drafting_guidance,suggested_visual_types,reference_resources").eq("slug", slug).maybeSingle();
    if (briefError) throw briefError;
    if (!brief) return json({ error: "Slide brief not found" }, 404);

    const typedBrief = brief as Brief;
    const availableReferences = typedBrief.reference_resources ?? [];
    const referencesToUse = selectedReferences.length ? selectedReferences.filter((ref) => availableReferences.includes(ref)) : availableReferences;
    const referenceData = await fetchReferenceData(serviceClient, referencesToUse);

    const userPrompt = `Slide brief:\n  Slug: ${typedBrief.slug}\n  Narrative role: ${typedBrief.narrative_role}\n  Drafting guidance: ${typedBrief.drafting_guidance}\n  Suggested visual types: ${JSON.stringify(typedBrief.suggested_visual_types)}\n\nEditor's direction (optional):\n  ${editorPrompt || "(none provided)"}\n\nReference data:\n${JSON.stringify(referenceData, null, 2)}\n\nReturn a JSON object with:\n  title (string, required, 1-80 chars)\n  subtitle (string, optional, max 120 chars)\n  body_md (string, optional markdown body, max 4000 chars)\n  visual_type (one of suggested_visual_types)\n  visual_config (object matching the visual_type's schema)\n\nVisual config schemas:\n${JSON.stringify(schemasFor(typedBrief.suggested_visual_types), null, 2)}\n\nReturn only valid JSON. Do not wrap in markdown.`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 2400, system: "You are drafting a single slide for an investor pitch deck for Navio Solutions, a Norwegian B2B SaaS company. Be confident but grounded. Avoid superlatives. Use specific numbers when reference data provides them. Output valid JSON matching the schema.", messages: [{ role: "user", content: userPrompt }] }),
    });

    if (!anthropicResponse.ok) {
      const detail = await anthropicResponse.text();
      return json({ error: "Anthropic request failed", detail }, anthropicResponse.status >= 500 ? 502 : anthropicResponse.status);
    }

    const anthropicJson = await anthropicResponse.json();
    const content = Array.isArray(anthropicJson.content) ? anthropicJson.content : [];
    const text = content.map((part: { type?: string; text?: string }) => part.type === "text" ? part.text ?? "" : "").join("\n");
    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch (error) {
      return json({ errors: [(error as Error).message] }, 422);
    }

    const validation = validateDraft(parsed, typedBrief.suggested_visual_types);
    if (!validation.ok) return json({ errors: validation.errors }, 422);

    const { error: insertError } = await serviceClient.from("portal_slide_drafts").insert({ slide_slug: slug, editor_email: userData.user.email ?? null, editor_user_id: userData.user.id, prompt: editorPrompt || null, response: validation.value, model: MODEL });
    if (insertError) throw insertError;

    return json(validation.value);
  } catch (error) {
    console.error("draft-slide error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
