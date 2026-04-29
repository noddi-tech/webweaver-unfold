import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, FunnelStage } from "./types";
import { accentStyle, balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, metricTextStyle, safeTextStyle } from "./utils";

export interface FunnelLayoutProps extends DeckComponentProps {
  title?: string;
  stages: FunnelStage[];
}

export function FunnelLayout({ title, stages, density = "sparse", accent = "primary", className }: FunnelLayoutProps) {
  return (
    <section className={cn("min-w-0 space-y-8", className)} style={{ ...accentStyle(accent), ...containerQueryStyle }}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className="space-y-3">
        {stages.map((stage) => (
          <article key={stage.label} className="min-w-0 rounded-md border border-border bg-card-background p-5" style={containerQueryStyle}>
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground" style={safeTextStyle}>{stage.label}</p>
                {stage.context ? <p className="mt-1 text-sm text-muted-foreground" style={bodyTextStyle}>{stage.context}</p> : null}
              </div>
              <p className="min-w-0 rounded-sm bg-card-surface px-3 py-2 font-semibold tabular-nums text-card-surface-foreground" style={metricTextStyle(stage.value, density, 1.55)}>{stage.value}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full" style={{ width: `${stage.widthPct}%`, background: "var(--deck-accent)" }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
