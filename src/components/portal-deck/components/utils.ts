import type React from "react";
import { accentColor, brand, type DeckAccent, type Density } from "../visuals/_brand";

export function densityClasses(density: Density | undefined, sparseClass: string, denseClass: string) {
  return density === "dense" ? denseClass : sparseClass;
}

export function accentStyle(accent: DeckAccent = "primary") {
  return { "--deck-accent": accentColor[accent] } as React.CSSProperties;
}

export function deckSurfaceStyle(variant: "warm" | "dark" | "gradient" | "minimal" = "warm") {
  if (variant === "dark") return { background: brand.surfaceDark, color: brand.foregroundInverse } as React.CSSProperties;
  if (variant === "gradient") return { background: brand.gradientPrimary, color: brand.foregroundInverse } as React.CSSProperties;
  if (variant === "minimal") return { background: brand.surfaceBackground, color: brand.foreground } as React.CSSProperties;
  return { background: brand.surfaceWarm, color: brand.foreground } as React.CSSProperties;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function formatNok(value: number) {
  if (value >= 1_000_000) return `NOK ${(value / 1_000_000).toLocaleString("en", { maximumFractionDigits: 1 })}M`;
  if (value >= 1_000) return `NOK ${(value / 1_000).toLocaleString("en", { maximumFractionDigits: 0 })}k`;
  return `NOK ${value.toLocaleString("en")}`;
}

export const balancedTextStyle = {
  textWrap: "balance",
  overflowWrap: "normal",
  wordBreak: "normal",
  hyphens: "manual",
} as React.CSSProperties;

export const safeTextStyle = {
  textWrap: "pretty",
  overflowWrap: "break-word",
  wordBreak: "normal",
  hyphens: "manual",
} as React.CSSProperties;

export const bodyTextStyle = {
  textWrap: "pretty",
  overflowWrap: "break-word",
  wordBreak: "normal",
  hyphens: "manual",
  lineHeight: 1.55,
} as React.CSSProperties;

export const labelTextStyle = {
  textWrap: "pretty",
  overflowWrap: "break-word",
  wordBreak: "normal",
  hyphens: "manual",
  lineHeight: 1.25,
} as React.CSSProperties;

export const unbreakableTextStyle = {
  textWrap: "pretty",
  overflowWrap: "anywhere",
  wordBreak: "normal",
  hyphens: "manual",
} as React.CSSProperties;

export const containerQueryStyle = {
  containerType: "inline-size",
} as React.CSSProperties;

export function valueTextStyle(density: Density = "sparse", maxRem?: number) {
  const max = maxRem ?? (density === "dense" ? 3 : 3.75);
  const min = density === "dense" ? 1.05 : 1.15;
  return {
    textWrap: "nowrap",
    whiteSpace: "nowrap",
    overflowWrap: "normal",
    wordBreak: "normal",
    hyphens: "manual",
    fontSize: `clamp(${min}rem, 11cqw, ${max}rem)`,
    lineHeight: 0.96,
  } as React.CSSProperties;
}

export function metricValueTextStyle(density: Density = "sparse", maxRem?: number) {
  const max = maxRem ?? (density === "dense" ? 2.45 : 3.1);
  const min = density === "dense" ? 1.05 : 1.15;
  return {
    textWrap: "nowrap",
    whiteSpace: "nowrap",
    overflowWrap: "normal",
    wordBreak: "normal",
    hyphens: "manual",
    fontSize: `clamp(${min}rem, 10cqw, ${max}rem)`,
    lineHeight: 1,
  } as React.CSSProperties;
}

export function textMetricStyle(density: Density = "sparse", maxRem?: number) {
  const max = maxRem ?? (density === "dense" ? 1.65 : 2.05);
  const min = density === "dense" ? 1.05 : 1.15;
  return {
    ...balancedTextStyle,
    fontSize: `clamp(${min}rem, 7cqw, ${max}rem)`,
    lineHeight: 1.08,
  } as React.CSSProperties;
}

export function metricValueLooksNumeric(value: string) {
  return /\d/.test(value) && !/[A-Za-zÆØÅæøå]{4,}/.test(value.replace(/NOK|ARR|MRR|Q\d/gi, ""));
}

export function metricTextStyle(value: string, density: Density = "sparse", maxRem?: number) {
  return metricValueLooksNumeric(value) ? metricValueTextStyle(density, maxRem) : textMetricStyle(density, maxRem ? Math.min(maxRem, 2) : undefined);
}

export function headlineClampStyle(density: Density = "sparse", maxRem?: number) {
  const max = maxRem ?? (density === "dense" ? 2.3 : 2.8);
  return {
    ...balancedTextStyle,
    fontSize: `clamp(1.45rem, 5.5cqw, ${max}rem)`,
    lineHeight: 1.06,
  } as React.CSSProperties;
}

export function headlineTextStyle(maxRem = 4.5) {
  return {
    ...balancedTextStyle,
    fontSize: `clamp(2.4rem, 8cqw, ${maxRem}rem)`,
  } as React.CSSProperties;
}
