import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, FunnelStage } from "./types";
import { accentStyle } from "./utils";

export interface FunnelLayoutProps extends DeckComponentProps {
  title?: string;
  stages: FunnelStage[];
}

export function FunnelLayout({ title, stages, density = "sparse", accent = "primary", className }: FunnelLayoutProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline}>{title}</h2> : null}
      <div className="space-y-3">
        {stages.map((stage) => (
          <article key={stage.label} className="rounded-md border border-border bg-card-background p-4">
            <div className="flex items-center gap-5">
              <div className="h-12 rounded-sm" style={{ width: `${stage.widthPct}%`, minWidth: density === "dense" ? "120px" : "180px", background: "var(--deck-accent)" }} />
              <div className="grid flex-1 gap-2 md:grid-cols-[1fr_180px] md:items-center">
                <div><p className="font-semibold text-foreground">{stage.label}</p>{stage.context ? <p className="text-sm text-muted-foreground">{stage.context}</p> : null}</div>
                <p className="text-right text-2xl font-semibold tabular-nums text-foreground">{stage.value}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
