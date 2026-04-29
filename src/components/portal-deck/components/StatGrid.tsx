import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, balancedTextStyle, containerQueryStyle, safeTextStyle, valueTextStyle } from "./utils";

export interface StatGridProps extends DeckComponentProps {
  title?: string;
  subtitle?: string;
  metrics: MetricItem[];
}

export function StatGrid({ title, subtitle, metrics, density = "sparse", accent = "primary", className }: StatGridProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title || subtitle ? <header className="max-w-4xl min-w-0">{title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}{subtitle ? <p className="mt-3 text-lg text-muted-foreground" style={safeTextStyle}>{subtitle}</p> : null}</header> : null}
      <div className={cn("grid gap-4", density === "dense" ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3")}>
        {metrics.map((metric) => (
          <article key={`${metric.label}-${metric.value}`} className="min-w-0 rounded-md border border-border bg-card-background p-6" style={containerQueryStyle}>
            <p className="min-w-0 text-sm font-medium text-muted-foreground" style={safeTextStyle}>{metric.label}</p>
            <div className="mt-3 min-w-0 font-semibold tabular-nums" style={{ ...valueTextStyle(density), color: metric.accent ? undefined : "var(--deck-accent)" }}>{metric.value}</div>
            {metric.context ? <p className="mt-4 min-w-0 text-sm leading-relaxed text-muted-foreground" style={safeTextStyle}>{metric.context}</p> : null}
            {metric.trend ? <p className="mt-5 min-w-0 border-t border-border pt-3 text-xs font-semibold uppercase tracking-widest text-foreground" style={balancedTextStyle}>{metric.trend}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
