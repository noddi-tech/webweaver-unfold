import { cn } from "@/lib/utils";
import { brand, type } from "../visuals/_brand";
import type { DeckComponentProps } from "./types";
import { accentStyle, balancedTextStyle, containerQueryStyle, safeTextStyle, valueTextStyle } from "./utils";

export interface StatCalloutProps extends DeckComponentProps {
  label: string;
  value: string;
  context: string;
  supporting?: string;
}

export function StatCallout({ label, value, context, supporting, density = "sparse", accent = "primary", className }: StatCalloutProps) {
  return (
    <section className={cn("min-w-0 rounded-md border border-border bg-card-background p-8", density === "dense" ? "grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)] md:items-end" : "space-y-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      <div className="min-w-0">
        <p className={type.micro} style={safeTextStyle}>{label}</p>
        <div className="mt-4 min-w-0 font-semibold tabular-nums" style={{ ...valueTextStyle(density, density === "dense" ? 3.5 : 5.8), color: "var(--deck-accent)" }}>{value}</div>
      </div>
      <div className="min-w-0 max-w-3xl">
        <h3 className={cn(type.headline, "text-foreground")} style={balancedTextStyle}>{context}</h3>
        {supporting ? <p className="mt-4 text-lg leading-relaxed text-muted-foreground" style={safeTextStyle}>{supporting}</p> : null}
      </div>
      <div className="h-px w-full bg-border" style={{ background: brand.border }} aria-hidden="true" />
    </section>
  );
}
