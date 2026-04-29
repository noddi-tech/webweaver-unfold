import { cn } from "@/lib/utils";
import { brand, type } from "../visuals/_brand";
import type { DeckComponentProps } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, metricTextStyle, safeTextStyle } from "./utils";

export interface StatCalloutProps extends DeckComponentProps {
  label: string;
  value: string;
  context: string;
  supporting?: string;
}

export function StatCallout({ label, value, context, supporting, density = "sparse", accent = "primary", className }: StatCalloutProps) {
  return (
    <section className={cn("deck-two-panel min-w-0 gap-8 rounded-md border border-border bg-card-background p-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      <div className="min-w-0 self-end" style={containerQueryStyle}>
        <p className={type.micro} style={labelTextStyle}>{label}</p>
        <div className="mt-4 min-w-0 font-semibold tabular-nums" style={{ ...metricTextStyle(value, density, density === "dense" ? 2.35 : 3.2), color: "var(--deck-accent)" }}>{value}</div>
      </div>
      <div className="min-w-0 max-w-3xl">
        <h3 className={cn(type.headline, "text-foreground")} style={safeTextStyle}>{context}</h3>
        {supporting ? <p className="mt-4 text-lg text-muted-foreground" style={bodyTextStyle}>{supporting}</p> : null}
      </div>
      <div className="h-px w-full bg-border" style={{ background: brand.border }} aria-hidden="true" />
    </section>
  );
}
