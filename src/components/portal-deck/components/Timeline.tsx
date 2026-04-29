import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, TimelineItem } from "./types";
import { accentStyle, balancedTextStyle, safeTextStyle, valueTextStyle } from "./utils";

export interface TimelineProps extends DeckComponentProps {
  title?: string;
  items: TimelineItem[];
}

export function Timeline({ title, items, density = "sparse", accent = "primary", className }: TimelineProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className={cn("grid", density === "dense" ? "gap-4 md:grid-cols-2 xl:grid-cols-4" : "gap-6 md:grid-cols-2 xl:grid-cols-3")}>
        {items.map((item, index) => (
          <article key={`${item.date}-${item.title}`} className="relative min-w-0 rounded-md border border-border bg-card-background p-6">
            <div className="mb-5 flex min-w-0 items-center justify-between gap-3 border-b border-border pb-4">
              <span className="min-w-0 text-sm font-semibold uppercase tracking-widest text-muted-foreground" style={balancedTextStyle}>{item.date}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: "var(--deck-accent)" }}>{index + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground" style={balancedTextStyle}>{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground" style={safeTextStyle}>{item.description}</p>
            {item.metric ? <p className="mt-5 font-semibold tabular-nums text-foreground" style={valueTextStyle(density, 1.35)}>{item.metric}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
