import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = "claude-opus-4-7";
const MAX_DRAFTS_PER_HOUR = 30;
const VALID_VISUAL_TYPES = new Set(["cover", "logos", "badges", "funnel", "adoption", "glide", "team", "round", "gap", "verticals", "customer-spotlight", "custom"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DraftRequest = { slug?: unknown; editor_prompt?: unknown; selected_references?: unknown; include_style_references?: unknown };
type DraftResponse = { title: string; subtitle?: string; body_md?: string; visual_type: string; visual_config: Record<string, unknown> };
type Brief = { slug: string; narrative_role: string; drafting_guidance: string; suggested_visual_types: string[]; reference_resources: string[] | null };
type ValidationResult = { ok: true; value: DraftResponse } | { ok: false; errors: string[] };
type JsonSchema = {
  type: "object" | "array" | "string" | "number" | "integer" | "boolean";
  additionalProperties?: boolean;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
};

const annotationSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "pointLabel"],
  properties: { label: { type: "string" }, pointLabel: { type: "string" }, description: { type: "string" } },
};

const componentRefNames = ["Hero", "StatCallout", "StatGrid", "LogoGrid", "QuoteBlock", "ComparisonTable", "Timeline", "ProcessFlow", "ProblemSolutionGrid", "AnnotatedChart", "FunnelLayout", "CustomerSpotlight", "SectionDivider", "CitationFooter", "PersonCard", "CategoryCard"];

const schemaMap: Record<string, JsonSchema> = {
  cover: { type: "object", additionalProperties: false, properties: { eyebrow: { type: "string" }, headline: { type: "string" }, supporting: { type: "string" }, layout: { type: "string", enum: ["centered", "left"] }, background: { type: "string", enum: ["gradient", "minimal", "dark"] }, footer: { type: "object", additionalProperties: false, properties: { note: { type: "string" }, sources: { type: "array", items: { type: "string" } } } } } },
  logos: { type: "object", additionalProperties: false, properties: { headline: { type: "string" }, caption: { type: "string" }, greyscale: { type: "boolean" }, columns: { type: "integer", minimum: 2, maximum: 6 }, customer_slugs: { type: "array", items: { type: "string" } } } },
  badges: { type: "object", additionalProperties: false, required: ["pairs"], properties: { pairs: { type: "array", minItems: 3, maxItems: 6, items: { type: "object", additionalProperties: false, required: ["title", "description"], properties: { label: { type: "string" }, title: { type: "string" }, description: { type: "string" }, metric: { type: "string" } } } } } },
  funnel: { type: "object", additionalProperties: false, properties: { stages: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "value"], properties: { label: { type: "string" }, value: { type: "string" }, context: { type: "string" }, widthPct: { type: "number", minimum: 10, maximum: 100 } } } } } },
  adoption: { type: "object", additionalProperties: false, properties: { headline: { type: "string" }, chartType: { type: "string", enum: ["line", "area"] }, annotations: { type: "array", items: annotationSchema } } },
  glide: { type: "object", additionalProperties: false, properties: { headline: { type: "string" }, annotations: { type: "array", items: annotationSchema }, breakEvenLabel: { type: "string" } } },
  team: { type: "object", additionalProperties: false, properties: { layout: { type: "string", enum: ["founders-prominent", "flat-grid"] }, caption: { type: "string" } } },
  round: { type: "object", additionalProperties: false, properties: { cta_label: { type: "string" } } },
  gap: { type: "object", additionalProperties: false, required: ["leftLabel", "rightLabel", "rows"], properties: { title: { type: "string" }, leftLabel: { type: "string" }, rightLabel: { type: "string" }, rows: { type: "array", minItems: 3, maxItems: 6, items: { type: "object", additionalProperties: false, required: ["category", "leftValue", "rightValue"], properties: { category: { type: "string" }, leftValue: { type: "string" }, rightValue: { type: "string" } } } } } },
  verticals: { type: "object", additionalProperties: false, required: ["items"], properties: { items: { type: "array", minItems: 2, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["name", "status", "description"], properties: { name: { type: "string" }, status: { type: "string" }, description: { type: "string" }, icon: { type: "string" } } } } } },
  "customer-spotlight": { type: "object", additionalProperties: false, required: ["customer_slug"], properties: { customer_slug: { type: "string" }, layout: { type: "string", enum: ["logo-left", "logo-top", "photo-fullbleed"] }, metrics: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "value"], properties: { label: { type: "string" }, value: { type: "string" }, context: { type: "string" }, trend: { type: "string" } } } } } },
  custom: { type: "object", additionalProperties: false, required: ["composition"], properties: { composition: { type: "array", minItems: 1, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["component", "props"], properties: { component: { type: "string", enum: componentRefNames }, props: { type: "object" } } } } } },
};

const SYSTEM_PROMPT = `You are drafting a slide for Navio Solutions' investor pitch deck. Navio is a Norwegian B2B SaaS for mobile car and tire service operators.

DESIGN PRINCIPLES (apply rigorously):

1. ONE IDEA PER SLIDE. The slide communicates exactly one thing. Everything else is supporting context.
2. DEATH OF BULLET POINTS. Never produce bullet point lists in body_md or visual_config. If content is sequential, the slide should be split. If content is additive, represent it through visual_config (StatGrid, ProcessFlow, ProblemSolutionGrid, ComparisonTable). Bullets are a signal that the slide structure is wrong.
3. EVERY NUMBER NEEDS CONTEXT. "250 customers/day" is weak. "250 customers/day, up from 80 a year ago" is strong. Stats include label + value + context (and where applicable, change indicator).
4. RESTRAINT. Most slides use minimal background, single accent color. The Navio purple gradient is reserved for hero moments (cover, section dividers, the-ask). Don't request gradient backgrounds for content slides.
5. REFERENCE DATA, NEVER INVENT. Customer names, financial numbers, traction stats, team members must come from reference data. When in doubt, write content that gracefully omits a datapoint rather than fabricating one.
6. SPARSE BY DEFAULT. Components support density: 'sparse' | 'dense'. Default to sparse. Use dense only when the content genuinely demands it (data tables, multi-metric overviews on traction or financials slides).
7. COMPOSITION RHYTHM. For visual_type='custom', think about pacing. A slide is usually one big idea (one component), sometimes two (hero + supporting stat grid), rarely three. Avoid 4-5 component compositions unless absolutely necessary.

OUTPUT LANGUAGE: All slide content (title, subtitle, body_md, all visual_config text fields including labels, descriptions, captions, problem/solution pairs, annotations, comparison row text, vertical names, status text, metric labels, etc.) must be in Norwegian Bokmål. Use natural Norwegian business language — confident, restrained, suitable for an investor pitch.
Do not translate brand terms (e.g., "Navio", "Fundraise", "SaaS", proper company names). Do not include English phrases unless the term is brand-specific or internationally standard.

OUTPUT FORMAT: Return only valid JSON matching the schema. Do not wrap in markdown code blocks. Do not include explanations or preambles.`;

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

function validateSchema(schema: JsonSchema, value: unknown, path = "visual_config"): string | null {
  if (schema.type === "object") {
    if (!isRecord(value)) return `${path} must be an object`;
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      const extra = Object.keys(value).find((key) => !allowed.has(key));
      if (extra) return `${path}.${extra} is not allowed`;
    }
    for (const key of schema.required ?? []) {
      if (value[key] === undefined) return `${path}.${key} is required`;
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (value[key] !== undefined) {
        const error = validateSchema(childSchema, value[key], `${path}.${key}`);
        if (error) return error;
      }
    }
    return null;
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) return `${path} must be an array`;
    if (schema.minItems !== undefined && value.length < schema.minItems) return `${path} must contain at least ${schema.minItems} items`;
    if (schema.maxItems !== undefined && value.length > schema.maxItems) return `${path} must contain at most ${schema.maxItems} items`;
    if (schema.items) {
      for (let index = 0; index < value.length; index += 1) {
        const error = validateSchema(schema.items, value[index], `${path}[${index}]`);
        if (error) return error;
      }
    }
    return null;
  }
  if (schema.type === "string") {
    if (!isString(value)) return `${path} must be a string`;
    if (schema.enum && !schema.enum.includes(value)) return `${path} must be one of ${schema.enum.join(", ")}`;
    return null;
  }
  if (schema.type === "number" || schema.type === "integer") {
    if (!isNumber(value)) return `${path} must be a number`;
    if (schema.type === "integer" && !Number.isInteger(value)) return `${path} must be an integer`;
    if (schema.minimum !== undefined && value < schema.minimum) return `${path} must be at least ${schema.minimum}`;
    if (schema.maximum !== undefined && value > schema.maximum) return `${path} must be at most ${schema.maximum}`;
    return null;
  }
  if (schema.type === "boolean") return typeof value === "boolean" ? null : `${path} must be a boolean`;
  return null;
}

function validateVisualConfig(visualType: string, config: unknown): string | null {
  const schema = schemaMap[visualType];
  if (!schema) return "visual_type is not supported";
  return validateSchema(schema, config);
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
