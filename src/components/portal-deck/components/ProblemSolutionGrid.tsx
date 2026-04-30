import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, TextPair } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, safeTextStyle } from "./utils";

export interface ProblemSolutionGridProps extends DeckComponentProps {
  title?: string;
  pairs: TextPair[];
}

export function ProblemSolutionGrid({ title, pairs, density = "sparse", accent = "primary", className }: ProblemSolutionGridProps) {
  const count = pairs.length;
  const isFive = count === 5;
  const isCompact = isFive || count >= 6;

  const gridClass = isFive
    ? "grid grid-cols-5 gap-3"
    : count >= 6
      ? "grid grid-cols-3 gap-4"
      : density === "dense"
        ? "deck-auto-grid-compact gap-4"
        : "deck-auto-grid gap-5";

  const cardPad = isCompact ? "p-4" : "p-6";
  const titleClass = isCompact
    ? "mt-2 text-lg font-semibold leading-snug text-foreground"
    : "mt-4 text-2xl font-semibold leading-tight text-foreground";
  const descClass = isCompact
    ? "mt-2 text-xs text-muted-foreground"
    : "mt-4 text-sm text-muted-foreground";
  const metricClass = isCompact
    ? "mt-3 rounded-sm border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
    : "mt-6 rounded-sm border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground";

  return (
    <section className={cn("min-w-0", isCompact ? "space-y-4" : "space-y-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className={gridClass}>
        {pairs.map((pair) => (
          <article key={pair.title} className={cn("min-w-0 rounded-md border border-border bg-card-background", cardPad)}>
            {pair.label ? <p className={type.micro} style={labelTextStyle}>{pair.label}</p> : null}
            <h3 className={titleClass} style={balancedTextStyle}>{pair.title}</h3>
            <p className={descClass} style={bodyTextStyle}>{pair.description}</p>
            {pair.metric ? <p className={metricClass} style={safeTextStyle}>{pair.metric}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
