import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, FunnelStage } from "./types";
import { accentStyle, balancedTextStyle, containerQueryStyle, safeTextStyle, valueTextStyle } from "./utils";

export interface FunnelLayoutProps extends DeckComponentProps {
  title?: string;
  stages: FunnelStage[];
}

export function FunnelLayout({ title, stages, density = "sparse", accent = "primary", className }: FunnelLayoutProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className="space-y-3">
        {stages.map((stage) => (
          <article key={stage.label} className="min-w-0 rounded-md border border-border bg-card-background p-4" style={containerQueryStyle}>
            <div className="grid min-w-0 items-center gap-4 md:grid-cols-[minmax(96px,0.34fr)_minmax(0,1fr)]">
              <div className="h-12 rounded-sm" style={{ width: `${stage.widthPct}%`, minWidth: density === "dense" ? "80px" : "112px", maxWidth: "100%", background: "var(--deck-accent)" }} />
              <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(96px,160px)] md:items-center">
                <div className="min-w-0"><p className="font-semibold text-foreground" style={safeTextStyle}>{stage.label}</p>{stage.context ? <p className="text-sm text-muted-foreground" style={safeTextStyle}>{stage.context}</p> : null}</div>
                <p className="min-w-0 text-right font-semibold tabular-nums text-foreground" style={valueTextStyle(density, 1.8)}>{stage.value}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
