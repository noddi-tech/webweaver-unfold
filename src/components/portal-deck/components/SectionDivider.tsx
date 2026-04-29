import { cn } from "@/lib/utils";
import { space, type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, deckSurfaceStyle } from "./utils";

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
    <section className={cn("flex min-h-[420px] items-end rounded-md", space.slidePadding, gradient ? "text-primary-foreground" : "text-foreground", className)} style={{ ...deckSurfaceStyle(gradient ? "gradient" : "minimal"), ...accentStyle(accent) }}>
      <div className="grid w-full gap-8 md:grid-cols-[1fr_280px] md:items-end">
        <div>{eyebrow ? <p className={cn(type.micro, gradient ? "text-primary-foreground/75" : "text-muted-foreground")}>{eyebrow}</p> : null}<h2 className={cn("mt-4 max-w-4xl leading-tight", density === "dense" ? type.display : type.hero)}>{title}</h2>{subtitle ? <p className={cn("mt-6 max-w-3xl text-lg leading-relaxed", gradient ? "text-primary-foreground/75" : "text-muted-foreground")}>{subtitle}</p> : null}</div>
        {metric ? <aside className={cn("border-t pt-5", gradient ? "border-primary-foreground/25" : "border-border")}><p className="text-4xl font-semibold tabular-nums">{metric.value}</p><p className={cn("mt-2 text-sm", gradient ? "text-primary-foreground/70" : "text-muted-foreground")}>{metric.label}</p></aside> : null}
      </div>
    </section>
  );
}
