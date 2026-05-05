export const ASSET_TYPES = [
  { value: "slide", label: "Slide" },
  { value: "page", label: "Page / web" },
  { value: "chart", label: "Chart / data-viz" },
  { value: "ui", label: "UI component" },
] as const;

export const USE_FOR_OPTIONS = [
  "typography",
  "color",
  "layout",
  "data-viz",
  "whitespace",
  "photography",
  "narrative-structure",
  "tone",
] as const;

export const SOURCE_COMPANY_SUGGESTIONS = [
  "Y Combinator",
  "Airbnb",
  "Linear",
  "Apple",
  "Stripe",
  "Notion",
  "Figma",
  "Vercel",
];

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 300;
export const NOTES_MAX = 2000;
