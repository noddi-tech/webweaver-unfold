import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, TextPair } from "./types";
import { accentStyle } from "./utils";

export interface ProblemSolutionGridProps extends DeckComponentProps {
  title?: string;
  pairs: TextPair[];
}

export function ProblemSolutionGrid({ title, pairs, density = "sparse", accent = "primary", className }: ProblemSolutionGridProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline}>{title}</h2> : null}
      <div className={cn("grid gap-4", density === "dense" ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {pairs.map((pair) => (
          <article key={pair.title} className="rounded-md border border-border bg-card-background p-6">
            {pair.label ? <p className={type.micro}>{pair.label}</p> : null}
            <h3 className="mt-4 text-2xl font-semibold leading-tight text-foreground">{pair.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{pair.description}</p>
            {pair.metric ? <p className="mt-6 border-t border-border pt-4 text-xl font-semibold text-foreground">{pair.metric}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
