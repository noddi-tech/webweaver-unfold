// Shared visual_config schema validator for the AI draft editor UI.
// Mirrors the authoritative validator in supabase/functions/draft-slide/index.ts.
// The edge function remains the source of truth on the server; this module
// exists only to give the inline editor fast client-side feedback.

export type JsonSchema = {
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
  properties: {
    label: { type: "string" },
    pointLabel: { type: "string" },
    description: { type: "string" },
  },
};

const componentRefNames = [
  "Hero", "StatCallout", "StatGrid", "LogoGrid", "QuoteBlock",
  "ComparisonTable", "Timeline", "ProcessFlow", "ProblemSolutionGrid",
  "AnnotatedChart", "FunnelLayout", "CustomerSpotlight",
  "SectionDivider", "CitationFooter", "PersonCard", "CategoryCard",
];

export const visualConfigSchemaMap: Record<string, JsonSchema> = {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateAgainstSchema(schema: JsonSchema, value: unknown, path = "visual_config"): string | null {
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
        const error = validateAgainstSchema(childSchema, value[key], `${path}.${key}`);
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
        const error = validateAgainstSchema(schema.items, value[index], `${path}[${index}]`);
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

export function validateVisualConfigForType(visualType: string, config: unknown): string | null {
  const schema = visualConfigSchemaMap[visualType];
  if (!schema) return `visual_type "${visualType}" is not supported`;
  return validateAgainstSchema(schema, config);
}

export type VisualConfigValidation =
  | { kind: "ok"; value: Record<string, unknown> }
  | { kind: "syntax"; error: string }
  | { kind: "schema"; error: string };

/** Parses a raw textarea string and validates it against the visual_type schema. */
export function parseAndValidateVisualConfig(visualType: string, raw: string): VisualConfigValidation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { kind: "syntax", error: (error as Error).message };
  }
  const schemaError = validateVisualConfigForType(visualType, parsed);
  if (schemaError) return { kind: "schema", error: schemaError };
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { kind: "schema", error: "visual_config must be a JSON object" };
  }
  return { kind: "ok", value: parsed as Record<string, unknown> };
}

/** Stable stringify-based comparison for editedFields detection on visual_config. */
export function deepEqualJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
