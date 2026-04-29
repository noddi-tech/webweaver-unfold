import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, TimelineItem } from "./types";
import { accentStyle } from "./utils";

export interface TimelineProps extends DeckComponentProps {
  title?: string;
  items: TimelineItem[];
}

export function Timeline({ title, items, density = "sparse", accent = "primary", className }: TimelineProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline}>{title}</h2> : null}
      <div className={cn("grid", density === "dense" ? "gap-4 md:grid-cols-4" : "gap-6 md:grid-cols-3")}>
        {items.map((item, index) => (
          <article key={`${item.date}-${item.title}`} className="relative rounded-md border border-border bg-card-background p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{item.date}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: "var(--deck-accent)" }}>{index + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            {item.metric ? <p className="mt-5 text-lg font-semibold tabular-nums text-foreground">{item.metric}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
