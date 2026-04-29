import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, MetricItem } from "./types";
import { accentStyle } from "./utils";

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
    <section className={cn("grid gap-6 rounded-md border border-border bg-card-background p-8", density === "dense" ? "lg:grid-cols-[1.1fr_1fr]" : "lg:grid-cols-[1fr_420px]", className)} style={accentStyle(accent)}>
      <div>
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-card-surface text-card-surface-foreground">{logoUrl ? <img src={logoUrl} alt={`${customer} logo`} className="max-h-10 max-w-12 object-contain" loading="lazy" /> : <Building2 className="h-8 w-8" />}</div>
          <div><p className={type.micro}>Spotlight customer</p><h2 className="mt-1 text-3xl font-semibold text-foreground">{customer}</h2>{parentBrand ? <p className="text-sm text-muted-foreground">{parentBrand}</p> : null}</div>
        </div>
        <p className={cn("leading-relaxed text-foreground", density === "dense" ? "text-lg" : "text-2xl")}>{summary}</p>
        {quote ? <blockquote className="mt-8 border-l-2 pl-5 text-lg leading-relaxed text-muted-foreground" style={{ borderColor: "var(--deck-accent)" }}>“{quote}”{author ? <footer className="mt-4 text-sm font-semibold text-foreground">{author}</footer> : null}</blockquote> : null}
      </div>
      <div className="grid content-end gap-3">
        {metrics.map((metric) => <article key={metric.label} className="rounded-md border border-border bg-background p-5"><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-2 text-4xl font-semibold tabular-nums text-foreground">{metric.value}</p>{metric.context ? <p className="mt-3 text-sm text-muted-foreground">{metric.context}</p> : null}</article>)}
      </div>
    </section>
  );
}
