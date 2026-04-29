import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { ComparisonColumn, ComparisonRow, DeckComponentProps } from "./types";
import { accentStyle, balancedTextStyle, safeTextStyle } from "./utils";

export interface ComparisonTableProps extends DeckComponentProps {
  title?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export function ComparisonTable({ title, columns, rows, density = "sparse", accent = "primary", className }: ComparisonTableProps) {
  return (
    <section className={cn("space-y-6", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className="overflow-x-auto rounded-md border border-border bg-card-background">
        <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `minmax(180px, 0.9fr) repeat(${columns.length}, minmax(170px, 1fr))` }}>
          <div className="border-b border-border p-4 text-sm font-semibold text-muted-foreground">Dimension</div>
          {columns.map((column) => <div key={column.key} className="min-w-0 border-b border-l border-border p-4 text-sm font-semibold text-foreground" style={balancedTextStyle}>{column.label}</div>)}
          {rows.map((row) => [
            <div key={`${row.label}-label`} className="min-w-0 border-t border-border p-4 text-sm font-semibold text-foreground" style={safeTextStyle}>{row.label}</div>,
            ...columns.map((column) => {
              const emphasized = row.emphasisKey === column.key;
              return <div key={`${row.label}-${column.key}`} className={cn("min-w-0 border-l border-t border-border p-4 text-sm leading-relaxed", emphasized ? "bg-card-surface text-card-surface-foreground" : "text-muted-foreground")} style={safeTextStyle}>{emphasized ? <Check className="mb-2 h-4 w-4" style={{ color: "var(--deck-accent)" }} /> : null}{row.values[column.key]}</div>;
            })
          ])}
        </div>
      </div>
      {density === "dense" ? <p className="text-xs text-muted-foreground" style={safeTextStyle}>Navio position reflects mobile-first operations across tire and car service workflows.</p> : null}
    </section>
  );
}
