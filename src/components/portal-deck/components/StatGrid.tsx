import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle } from "./utils";

export interface StatGridProps extends DeckComponentProps {
  title?: string;
  subtitle?: string;
  metrics: MetricItem[];
}

export function StatGrid({ title, subtitle, metrics, density = "sparse", accent = "primary", className }: StatGridProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title || subtitle ? <header className="max-w-4xl">{title ? <h2 className={type.headline}>{title}</h2> : null}{subtitle ? <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p> : null}</header> : null}
      <div className={cn("grid gap-4", density === "dense" ? "md:grid-cols-4" : "md:grid-cols-3")}>
        {metrics.map((metric) => (
          <article key={`${metric.label}-${metric.value}`} className="rounded-md border border-border bg-card-background p-6">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <div className={cn("mt-3 font-semibold leading-none tabular-nums", density === "dense" ? "text-4xl" : "text-5xl")} style={{ color: metric.accent ? undefined : "var(--deck-accent)" }}>{metric.value}</div>
            {metric.context ? <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{metric.context}</p> : null}
            {metric.trend ? <p className="mt-5 border-t border-border pt-3 text-xs font-semibold uppercase tracking-widest text-foreground">{metric.trend}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
