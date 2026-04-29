import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, TimelineItem } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, safeTextStyle } from "./utils";

export interface TimelineProps extends DeckComponentProps {
  title?: string;
  items: TimelineItem[];
}

export function Timeline({ title, items, density = "sparse", accent = "primary", className }: TimelineProps) {
  return (
    <section className={cn("min-w-0 space-y-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className={cn(density === "dense" ? "deck-auto-grid-compact gap-4" : "deck-auto-grid gap-5")}>
        {items.map((item, index) => (
          <article key={`${item.date}-${item.title}`} className="relative min-w-0 rounded-md border border-border bg-card-background p-6">
            <div className="mb-5 flex min-w-0 items-center justify-between gap-3 border-b border-border pb-4">
              <span className="min-w-0 text-sm font-semibold uppercase tracking-widest text-muted-foreground" style={labelTextStyle}>{item.date}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: "var(--deck-accent)" }}>{index + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground" style={balancedTextStyle}>{item.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground" style={bodyTextStyle}>{item.description}</p>
            {item.metric ? <p className="mt-5 rounded-sm border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground" style={safeTextStyle}>{item.metric}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
