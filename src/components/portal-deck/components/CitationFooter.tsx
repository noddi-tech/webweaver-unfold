import { cn } from "@/lib/utils";
import type { DeckComponentProps } from "./types";
import { safeTextStyle } from "./utils";

export interface CitationFooterProps extends DeckComponentProps {
  sources: string[];
  note?: string;
}

export function CitationFooter({ sources, note, density = "sparse", className }: CitationFooterProps) {
  return (
    <footer className={cn("flex min-w-0 flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between", className)}>
      <p className="min-w-0" style={safeTextStyle}>{note ?? "Source"}: {sources.join(" · ")}</p>
      {density === "dense" ? <p className="font-mono tabular-nums" style={safeTextStyle}>Navio investor portal</p> : null}
    </footer>
  );
}
