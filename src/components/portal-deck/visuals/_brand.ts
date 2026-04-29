/**
 * Investor deck brand grounding.
 *
 * Source of truth:
 * - Live `/cms` Design System → Colors & Tokens (`public.color_tokens`)
 * - Existing CSS semantic tokens in `src/index.css`
 *
 * Components should import these constants instead of hardcoding colors,
 * typography scales, or spacing rhythm.
 */

export const brand = {
  // Core brand colors from live color_tokens.
  primary: "hsl(var(--primary))", // Federal Blue — 249 67% 24%
  primaryDeep: "hsl(var(--color-brand-dark, var(--primary)))", // Federal Blue deep — 249 67% 24%
  secondary: "hsl(var(--secondary))", // Vivid Purple — 250 57% 55%
  vibrantPurple: "hsl(var(--vibrant-purple))", // Vibrant Purple — 266 85% 58%
  accentOrange: "hsl(var(--brand-orange))", // Brand Orange — 25 95% 63%
  accentPink: "hsl(var(--brand-pink))", // Brand Pink — 321 59% 85%
  accentPeach: "hsl(var(--brand-peach))", // Brand Peach — 25 95% 70%
  accentBlue: "hsl(var(--brand-blue))", // Ocean Blue — 210 100% 50%
  accentTeal: "hsl(var(--brand-teal))", // Brand Teal — 180 70% 45%
  accentGreen: "hsl(var(--brand-green))", // Success Green — 142 76% 50%

  // Gradients. Runtime follows active CSS variables so CMS/system updates win.
  gradientHero: "var(--gradient-hero)", // DB: linear-gradient(135deg, hsl(266, 85%, 58%), hsl(25, 95%, 63%))
  gradientPrimary: "var(--gradient-primary)", // DB: linear-gradient(135deg, hsl(249, 67%, 24%), hsl(266, 85%, 58%))
  gradientPurpleDepth: "var(--gradient-purple-depth)", // 250 57% 55% → 250 54% 39% → 249 67% 24%

  // Surfaces and text.
  surfaceBackground: "hsl(var(--background))", // DB: 0 0% 100%; app memory/CSS warm bg: 40 18% 96% (#F8F7F4)
  surfaceWarm: "hsl(40 18% 96%)", // Bright Snow / warm deck canvas — #F8F7F4
  surfaceCard: "hsl(var(--card-background, 0 0% 98%))", // Light card surface — CSS: 0 0% 98%
  surfaceCardAccent: "hsl(var(--card-surface))", // Soft Lavender — 258 72% 95%
  surfaceMuted: "hsl(var(--muted))", // DB: 0 0% 96%; CSS app token: 34 10% 85%
  surfaceDark: "hsl(var(--card))", // Federal Blue card background — 249 67% 24%
  border: "hsl(var(--border))", // 0 0% 90%
  foreground: "hsl(var(--foreground))", // Federal Blue text — 249 67% 24%
  foregroundInverse: "hsl(var(--primary-foreground))", // 0 0% 100%
  foregroundMuted: "hsl(var(--muted-foreground))", // 0 0% 35%
  foregroundOnCardAccent: "hsl(var(--card-surface-foreground))", // 250 54% 39%

  // Data visualization accents: restrained by default, multi-color only for actual data viz.
  chartPrimary: "hsl(var(--primary))",
  chartAccent: "hsl(var(--brand-teal))",
  chartWarm: "hsl(var(--brand-orange))",
  chartPositive: "hsl(var(--brand-green))",
} as const;

export const type = {
  hero: "text-6xl md:text-7xl font-bold tracking-tight",
  display: "text-4xl md:text-5xl font-bold tracking-tight",
  headline: "text-3xl md:text-4xl font-semibold tracking-tight",
  title: "text-2xl md:text-3xl font-semibold",
  subhead: "text-lg md:text-xl text-muted-foreground",
  body: "text-base md:text-lg leading-relaxed",
  caption: "text-sm text-muted-foreground",
  micro: "text-xs uppercase tracking-widest font-semibold text-muted-foreground",
} as const;

export const space = {
  slidePadding: "p-12 md:p-16 lg:p-20",
  sectionGap: "space-y-8 md:space-y-12",
  cardPadding: "p-6 md:p-8",
  itemGap: "gap-4 md:gap-6",
} as const;

export type Density = "sparse" | "dense";
export type DeckAccent = "primary" | "purple" | "orange" | "teal" | "green";

export const accentColor: Record<DeckAccent, string> = {
  primary: brand.primary,
  purple: brand.vibrantPurple,
  orange: brand.accentOrange,
  teal: brand.accentTeal,
  green: brand.accentGreen,
} as const;
