import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, TextPair } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, safeTextStyle } from "./utils";

export interface ProblemSolutionGridProps extends DeckComponentProps {
  title?: string;
  pairs: TextPair[];
}

export function ProblemSolutionGrid({ title, pairs, density = "sparse", accent = "primary", className }: ProblemSolutionGridProps) {
  return (
    <section className={cn("min-w-0 space-y-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className={cn(density === "dense" ? "deck-auto-grid-compact gap-4" : "deck-auto-grid gap-5")}>
        {pairs.map((pair) => (
          <article key={pair.title} className="min-w-0 rounded-md border border-border bg-card-background p-6">
            {pair.label ? <p className={type.micro} style={labelTextStyle}>{pair.label}</p> : null}
            <h3 className="mt-4 text-2xl font-semibold leading-tight text-foreground" style={balancedTextStyle}>{pair.title}</h3>
            <p className="mt-4 text-sm text-muted-foreground" style={bodyTextStyle}>{pair.description}</p>
            {pair.metric ? <p className="mt-6 rounded-sm border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground" style={safeTextStyle}>{pair.metric}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
