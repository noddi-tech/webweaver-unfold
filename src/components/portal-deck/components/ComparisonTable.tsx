import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { ComparisonColumn, ComparisonRow, DeckComponentProps } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, safeTextStyle } from "./utils";

export interface ComparisonTableProps extends DeckComponentProps {
  title?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export function ComparisonTable({ title, columns, rows, density = "sparse", accent = "primary", className }: ComparisonTableProps) {
  return (
    <section className={cn("min-w-0 space-y-6", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className="space-y-4">
        {rows.map((row) => (
          <article key={row.label} className="min-w-0 rounded-md border border-border bg-card-background p-5">
            <p className="text-sm font-semibold text-foreground" style={safeTextStyle}>{row.label}</p>
            <div className="deck-auto-grid-compact mt-4 gap-3">
              {columns.map((column) => {
                const emphasized = row.emphasisKey === column.key;
                return <div key={`${row.label}-${column.key}`} className={cn("min-w-0 rounded-sm border border-border p-4", emphasized ? "bg-card-surface text-card-surface-foreground" : "bg-background text-muted-foreground")}><p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground" style={labelTextStyle}>{emphasized ? <Check className="h-4 w-4 flex-none" style={{ color: "var(--deck-accent)" }} /> : null}{column.label}</p><p className="mt-3 text-sm" style={bodyTextStyle}>{row.values[column.key]}</p></div>;
              })}
            </div>
          </article>
        ))}
      </div>
      {density === "dense" ? <p className="text-xs text-muted-foreground" style={safeTextStyle}>Navio position reflects mobile-first operations across tire and car service workflows.</p> : null}
    </section>
  );
}
