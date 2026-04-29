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
  const min = density === "dense" ? 1.7 : 1.9;
  return {
    ...balancedTextStyle,
    fontSize: `clamp(${min}rem, 14cqw, ${max}rem)`,
    lineHeight: 0.96,
  } as React.CSSProperties;
}

export function headlineTextStyle(maxRem = 4.5) {
  return {
    ...balancedTextStyle,
    fontSize: `clamp(2.4rem, 8cqw, ${maxRem}rem)`,
  } as React.CSSProperties;
}
