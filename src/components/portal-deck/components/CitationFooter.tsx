import { cn } from "@/lib/utils";
import type { DeckComponentProps } from "./types";

export interface CitationFooterProps extends DeckComponentProps {
  sources: string[];
  note?: string;
}

export function CitationFooter({ sources, note, density = "sparse", className }: CitationFooterProps) {
  return (
    <footer className={cn("flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between", className)}>
      <p>{note ?? "Source"}: {sources.join(" · ")}</p>
      {density === "dense" ? <p className="font-mono tabular-nums">Navio investor portal</p> : null}
    </footer>
  );
}
