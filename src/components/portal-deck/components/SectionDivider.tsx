import { cn } from "@/lib/utils";
import { space, type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, balancedTextStyle, containerQueryStyle, deckSurfaceStyle, headlineTextStyle, safeTextStyle, valueTextStyle } from "./utils";

export interface SectionDividerProps extends DeckComponentProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  metric?: MetricItem;
  variant?: "gradient" | "minimal";
}

export function SectionDivider({ eyebrow, title, subtitle, metric, variant = "gradient", density = "sparse", accent = "primary", className }: SectionDividerProps) {
  const gradient = variant === "gradient";
  return (
    <section className={cn("flex min-h-[420px] min-w-0 items-end rounded-md", space.slidePadding, gradient ? "text-primary-foreground" : "text-foreground", className)} style={{ ...deckSurfaceStyle(gradient ? "gradient" : "minimal"), ...accentStyle(accent), ...containerQueryStyle }}>
      <div className="grid w-full min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] md:items-end">
        <div className="min-w-0">{eyebrow ? <p className={cn(type.micro, gradient ? "text-primary-foreground/75" : "text-muted-foreground")} style={safeTextStyle}>{eyebrow}</p> : null}<h2 className="mt-4 max-w-4xl font-bold leading-tight tracking-tight" style={headlineTextStyle(density === "dense" ? 4.2 : 5)}>{title}</h2>{subtitle ? <p className={cn("mt-6 max-w-3xl text-lg leading-relaxed", gradient ? "text-primary-foreground/75" : "text-muted-foreground")} style={safeTextStyle}>{subtitle}</p> : null}</div>
        {metric ? <aside className={cn("min-w-0 border-t pt-5", gradient ? "border-primary-foreground/25" : "border-border")}><p className="font-semibold tabular-nums" style={valueTextStyle(density, 2.6)}>{metric.value}</p><p className={cn("mt-2 text-sm", gradient ? "text-primary-foreground/70" : "text-muted-foreground")} style={balancedTextStyle}>{metric.label}</p></aside> : null}
      </div>
    </section>
  );
}
