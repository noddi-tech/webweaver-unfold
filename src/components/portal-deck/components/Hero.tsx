import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand, space, type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, balancedTextStyle, containerQueryStyle, deckSurfaceStyle, densityClasses, headlineTextStyle, safeTextStyle, valueTextStyle } from "./utils";

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
      className={cn("relative isolate flex min-h-[520px] overflow-hidden rounded-md", space.slidePadding, isGradient ? "text-primary-foreground" : "text-foreground", className)}
      style={{ ...deckSurfaceStyle(isGradient ? "gradient" : "minimal"), ...accentStyle(accent), ...containerQueryStyle }}
    >
      {isGradient ? <div className="absolute inset-x-0 bottom-0 h-px bg-primary-foreground/30" aria-hidden="true" /> : <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />}
      <div className="relative z-10 grid w-full min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-end">
        <div className="min-w-0 max-w-5xl self-center">
          {eyebrow ? <p className={cn(type.micro, isGradient ? "text-primary-foreground/75" : "text-muted-foreground")} style={safeTextStyle}>{eyebrow}</p> : null}
          <h1 className={cn("mt-5 max-w-5xl font-bold tracking-tight", density === "dense" ? "leading-tight" : "leading-[0.94]")} style={headlineTextStyle(density === "dense" ? 4.5 : 5.2)}>{title}</h1>
          {subtitle ? <p className={cn("mt-8 max-w-3xl leading-relaxed", density === "dense" ? "text-lg" : type.subhead, isGradient ? "text-primary-foreground/82" : "text-muted-foreground")} style={safeTextStyle}>{subtitle}</p> : null}
        </div>
        <aside className={cn("min-w-0 self-end", densityClasses(density, "space-y-4", "grid grid-cols-2 gap-3 lg:grid-cols-1"))}>
          {metrics.slice(0, density === "dense" ? 4 : 3).map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className={cn("min-w-0 border-t pt-4", isGradient ? "border-primary-foreground/25" : "border-border")}>
              <div className="min-w-0 font-semibold tabular-nums" style={valueTextStyle(density, density === "dense" ? 1.8 : 2.6)}>{metric.value}</div>
              <div className={cn("mt-1 min-w-0 text-sm", isGradient ? "text-primary-foreground/70" : "text-muted-foreground")} style={safeTextStyle}>{metric.label}</div>
              {metric.context ? <div className={cn("mt-2 min-w-0 text-xs leading-relaxed", isGradient ? "text-primary-foreground/62" : "text-muted-foreground")} style={safeTextStyle}>{metric.context}</div> : null}
            </div>
          ))}
          {kicker ? <div className={cn("flex items-center gap-2 pt-3 text-sm font-semibold", isGradient ? "text-primary-foreground" : "text-foreground")}><ArrowUpRight className="h-4 w-4" />{kicker}</div> : null}
        </aside>
      </div>
    </section>
  );
}
