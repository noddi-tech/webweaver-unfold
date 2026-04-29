import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, metricTextStyle, safeTextStyle } from "./utils";

export interface StatGridProps extends DeckComponentProps {
  title?: string;
  subtitle?: string;
  metrics: MetricItem[];
}

export function StatGrid({ title, subtitle, metrics, density = "sparse", accent = "primary", className }: StatGridProps) {
  return (
    <section className={cn("min-w-0 space-y-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      {title || subtitle ? <header className="max-w-4xl min-w-0">{title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}{subtitle ? <p className="mt-3 text-lg text-muted-foreground" style={safeTextStyle}>{subtitle}</p> : null}</header> : null}
      <div className="deck-auto-grid gap-4">
        {metrics.map((metric) => (
          <article key={`${metric.label}-${metric.value}`} className="flex min-w-0 flex-col rounded-md border border-border bg-card-background p-6" style={containerQueryStyle}>
            <p className="min-w-0 text-sm font-medium text-muted-foreground" style={labelTextStyle}>{metric.label}</p>
            <div className="mt-3 min-w-0 font-semibold tabular-nums text-foreground" style={{ ...metricTextStyle(metric.value, density), color: metric.accent ? undefined : "var(--deck-accent)" }}>{metric.value}</div>
            {metric.context ? <p className="mt-4 min-w-0 flex-1 text-sm text-muted-foreground" style={bodyTextStyle}>{metric.context}</p> : null}
            {metric.trend ? <p className="mt-5 min-w-0 border-t border-border pt-3 text-xs font-semibold uppercase tracking-widest text-foreground" style={labelTextStyle}>{metric.trend}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
