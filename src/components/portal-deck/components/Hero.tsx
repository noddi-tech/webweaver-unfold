import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, bodyTextStyle, containerQueryStyle, deckSurfaceStyle, headlineTextStyle, labelTextStyle, metricTextStyle, safeTextStyle } from "./utils";

export interface HeroProps extends DeckComponentProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  metrics?: MetricItem[];
  variant?: "gradient" | "minimal";
  kicker?: string;
}

export function Hero({ eyebrow, title, subtitle, metrics = [], variant = "minimal", density = "sparse", accent = "primary", kicker, className }: HeroProps) {
  const isGradient = variant === "gradient";
  return (
    <section
      className={cn("relative isolate overflow-hidden rounded-md", isGradient ? "text-primary-foreground" : "text-foreground", className)}
      style={{ ...deckSurfaceStyle(isGradient ? "gradient" : "minimal"), ...accentStyle(accent), ...containerQueryStyle }}
    >
      {isGradient ? <div className="absolute inset-x-0 bottom-0 h-px bg-primary-foreground/30" aria-hidden="true" /> : <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />}
      <div className="deck-hero-content deck-responsive-hero-grid relative z-10 grid w-full min-w-0 gap-10">
        <div className="min-w-0 max-w-5xl self-center">
          {eyebrow ? <p className={cn(type.micro, isGradient ? "text-primary-foreground/75" : "text-muted-foreground")} style={safeTextStyle}>{eyebrow}</p> : null}
          <h1 className={cn("mt-5 max-w-5xl font-bold tracking-tight", density === "dense" ? "leading-[1.02]" : "leading-[0.96]")} style={headlineTextStyle(density === "dense" ? 4.35 : 5.1)}>{title}</h1>
          {subtitle ? <p className={cn("mt-8 max-w-3xl leading-relaxed", density === "dense" ? "text-lg" : type.subhead, isGradient ? "text-primary-foreground/82" : "text-muted-foreground")} style={safeTextStyle}>{subtitle}</p> : null}
        </div>
        <aside className="deck-responsive-hero-metrics grid min-w-0 self-end gap-3">
          {metrics.slice(0, density === "dense" ? 4 : 3).map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className={cn("min-w-0 rounded-sm border-t p-4", isGradient ? "border-primary-foreground/25 bg-primary-foreground/5" : "border-border bg-card-background")} style={containerQueryStyle}>
              <div className="min-w-0 font-semibold tabular-nums" style={metricTextStyle(metric.value, density, density === "dense" ? 1.7 : 2.1)}>{metric.value}</div>
              <div className={cn("mt-1 min-w-0 text-sm", isGradient ? "text-primary-foreground/70" : "text-muted-foreground")} style={labelTextStyle}>{metric.label}</div>
              {metric.context ? <div className={cn("mt-2 min-w-0 text-xs", isGradient ? "text-primary-foreground/62" : "text-muted-foreground")} style={bodyTextStyle}>{metric.context}</div> : null}
            </div>
          ))}
          {kicker ? <div className={cn("flex min-w-0 items-center gap-2 pt-3 text-sm font-semibold", isGradient ? "text-primary-foreground" : "text-foreground")} style={safeTextStyle}><ArrowUpRight className="h-4 w-4 flex-none" />{kicker}</div> : null}
        </aside>
      </div>
    </section>
  );
}
