import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle, balancedTextStyle, containerQueryStyle, safeTextStyle, valueTextStyle } from "./utils";

export interface CustomerSpotlightProps extends DeckComponentProps {
  customer: string;
  parentBrand?: string;
  summary: string;
  quote?: string;
  author?: string;
  metrics: MetricItem[];
  logoUrl?: string | null;
}

export function CustomerSpotlight({ customer, parentBrand, summary, quote, author, metrics, logoUrl, density = "sparse", accent = "primary", className }: CustomerSpotlightProps) {
  return (
    <section className={cn("grid min-w-0 gap-6 rounded-md border border-border bg-card-background p-8", density === "dense" ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]", className)} style={accentStyle(accent)}>
      <div className="min-w-0">
        <div className="mb-8 flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-card-surface text-card-surface-foreground">{logoUrl ? <img src={logoUrl} alt={`${customer} logo`} className="max-h-10 max-w-12 object-contain" loading="lazy" /> : <Building2 className="h-8 w-8" />}</div>
          <div className="min-w-0"><p className={type.micro}>Spotlight customer</p><h2 className="mt-1 font-semibold leading-tight text-foreground" style={{ ...balancedTextStyle, fontSize: "clamp(1.75rem, 7cqw, 2.25rem)" }}>{customer}</h2>{parentBrand ? <p className="text-sm text-muted-foreground" style={safeTextStyle}>{parentBrand}</p> : null}</div>
        </div>
        <p className={cn("leading-relaxed text-foreground", density === "dense" ? "text-lg" : "text-2xl")} style={safeTextStyle}>{summary}</p>
        {quote ? <blockquote className="mt-8 border-l-2 pl-5 text-lg leading-relaxed text-muted-foreground" style={{ ...safeTextStyle, borderColor: "var(--deck-accent)" }}>“{quote}”{author ? <footer className="mt-4 text-sm font-semibold text-foreground" style={safeTextStyle}>{author}</footer> : null}</blockquote> : null}
      </div>
      <div className="grid min-w-0 content-end gap-3">
        {metrics.map((metric) => <article key={metric.label} className="min-w-0 rounded-md border border-border bg-background p-5" style={containerQueryStyle}><p className="text-sm text-muted-foreground" style={safeTextStyle}>{metric.label}</p><p className="mt-2 font-semibold tabular-nums text-foreground" style={valueTextStyle(density, 2.8)}>{metric.value}</p>{metric.context ? <p className="mt-3 text-sm text-muted-foreground" style={safeTextStyle}>{metric.context}</p> : null}</article>)}
      </div>
    </section>
  );
}
