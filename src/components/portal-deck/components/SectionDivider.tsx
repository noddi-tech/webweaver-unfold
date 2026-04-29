import { cn } from "@/lib/utils";
import { space, type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, bodyTextStyle, containerQueryStyle, deckSurfaceStyle, headlineClampStyle, labelTextStyle, metricTextStyle, safeTextStyle } from "./utils";

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
      <div className="deck-two-panel w-full min-w-0 gap-8 md:items-end">
        <div className="min-w-0">{eyebrow ? <p className={cn(type.micro, gradient ? "text-primary-foreground/75" : "text-muted-foreground")} style={labelTextStyle}>{eyebrow}</p> : null}<h2 className="mt-4 max-w-4xl font-bold leading-tight tracking-tight" style={headlineClampStyle(density, density === "dense" ? 3.4 : 4.1)}>{title}</h2>{subtitle ? <p className={cn("mt-6 max-w-3xl text-lg", gradient ? "text-primary-foreground/75" : "text-muted-foreground")} style={bodyTextStyle}>{subtitle}</p> : null}</div>
        {metric ? <aside className={cn("min-w-0 border-t pt-5", gradient ? "border-primary-foreground/25" : "border-border")} style={containerQueryStyle}><p className="font-semibold tabular-nums" style={metricTextStyle(metric.value, density, 2.2)}>{metric.value}</p><p className={cn("mt-2 text-sm", gradient ? "text-primary-foreground/70" : "text-muted-foreground")} style={labelTextStyle}>{metric.label}</p></aside> : null}
      </div>
    </section>
  );
}
