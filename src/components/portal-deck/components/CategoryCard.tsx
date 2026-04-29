import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps } from "./types";
import { accentStyle, balancedTextStyle, safeTextStyle } from "./utils";

export interface CategoryCardProps extends DeckComponentProps {
  label: string;
  title: string;
  description: string;
  status?: string;
  metric?: string;
}

export function CategoryCard({ label, title, description, status, metric, density = "sparse", accent = "primary", className }: CategoryCardProps) {
  return (
    <article className={cn("min-w-0 rounded-md border border-border bg-card-background p-6", className)} style={accentStyle(accent)}>
      <div className="flex min-w-0 items-start justify-between gap-5"><p className={type.micro} style={safeTextStyle}>{label}</p><ArrowUpRight className="h-5 w-5 shrink-0" style={{ color: "var(--deck-accent)" }} /></div>
      <h3 className={cn("mt-5 font-semibold leading-tight text-foreground", density === "dense" ? "text-2xl" : "text-3xl")} style={balancedTextStyle}>{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground" style={safeTextStyle}>{description}</p>
      <div className="mt-6 grid min-w-0 gap-2 border-t border-border pt-4 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><span className="font-semibold text-foreground" style={balancedTextStyle}>{status}</span>{metric ? <span className="text-muted-foreground sm:text-right" style={safeTextStyle}>{metric}</span> : null}</div>
    </article>
  );
}
