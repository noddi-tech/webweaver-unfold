import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps } from "./types";
import { accentStyle } from "./utils";

export interface QuoteBlockProps extends DeckComponentProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
}

export function QuoteBlock({ quote, author, role, company, density = "sparse", accent = "primary", className }: QuoteBlockProps) {
  return (
    <figure className={cn("rounded-md border border-border bg-card-background", density === "dense" ? "grid gap-8 p-8 md:grid-cols-[80px_1fr]" : "p-10", className)} style={accentStyle(accent)}>
      <Quote className="h-10 w-10" style={{ color: "var(--deck-accent)" }} aria-hidden="true" />
      <div>
        <blockquote className={cn(density === "dense" ? type.title : type.headline, "leading-tight text-foreground")}>“{quote}”</blockquote>
        <figcaption className="mt-8 border-t border-border pt-5">
          <span className="font-semibold text-foreground">{author}</span>
          {[role, company].filter(Boolean).length ? <span className="text-muted-foreground"> · {[role, company].filter(Boolean).join(", ")}</span> : null}
        </figcaption>
      </div>
    </figure>
  );
}
