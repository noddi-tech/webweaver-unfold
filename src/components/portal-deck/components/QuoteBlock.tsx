import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, safeTextStyle } from "./utils";

export interface QuoteBlockProps extends DeckComponentProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
}

export function QuoteBlock({ quote, author, role, company, density = "sparse", accent = "primary", className }: QuoteBlockProps) {
  return (
    <figure className={cn("min-w-0 rounded-md border border-border bg-card-background", density === "dense" ? "grid gap-8 p-8 md:grid-cols-[80px_minmax(0,1fr)]" : "p-10", className)} style={accentStyle(accent)}>
      <Quote className="h-10 w-10 shrink-0" style={{ color: "var(--deck-accent)" }} aria-hidden="true" />
      <div className="min-w-0">
        <blockquote className={cn(density === "dense" ? type.title : "text-2xl md:text-3xl font-semibold", "leading-tight text-foreground")} style={bodyTextStyle}>“{quote}”</blockquote>
        <figcaption className="mt-8 border-t border-border pt-5">
          <span className="font-semibold text-foreground" style={safeTextStyle}>{author}</span>
          {[role, company].filter(Boolean).length ? <span className="text-muted-foreground" style={safeTextStyle}> · {[role, company].filter(Boolean).join(", ")}</span> : null}
        </figcaption>
      </div>
    </figure>
  );
}
