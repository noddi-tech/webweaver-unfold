import { cn } from "@/lib/utils";
import { brand, type } from "../visuals/_brand";
import type { DeckComponentProps } from "./types";
import { accentStyle } from "./utils";

export interface StatCalloutProps extends DeckComponentProps {
  label: string;
  value: string;
  context: string;
  supporting?: string;
}

export function StatCallout({ label, value, context, supporting, density = "sparse", accent = "primary", className }: StatCalloutProps) {
  return (
    <section className={cn("rounded-md border border-border bg-card-background p-8", density === "dense" ? "grid gap-6 md:grid-cols-[280px_1fr] md:items-end" : "space-y-8", className)} style={accentStyle(accent)}>
      <div>
        <p className={type.micro}>{label}</p>
        <div className={cn("mt-4 font-semibold leading-none tabular-nums", density === "dense" ? "text-6xl" : "text-8xl")} style={{ color: "var(--deck-accent)" }}>{value}</div>
      </div>
      <div className="max-w-3xl">
        <h3 className={cn(type.headline, "text-foreground")}>{context}</h3>
        {supporting ? <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{supporting}</p> : null}
      </div>
      <div className="h-px w-full bg-border" style={{ background: brand.border }} aria-hidden="true" />
    </section>
  );
}
