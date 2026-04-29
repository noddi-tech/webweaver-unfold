import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, LogoItem } from "./types";
import { balancedTextStyle, bodyTextStyle, containerQueryStyle, labelTextStyle, safeTextStyle } from "./utils";

export interface LogoGridProps extends DeckComponentProps {
  title?: string;
  caption?: string;
  logos: LogoItem[];
}

export function LogoGrid({ title, caption, logos, density = "sparse", className }: LogoGridProps) {
  return (
    <section className={cn("min-w-0 space-y-8", className)} style={containerQueryStyle}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className="deck-auto-grid-compact gap-3">
        {logos.map((logo) => (
          <article key={logo.name} className="flex min-h-[128px] min-w-0 flex-col justify-between rounded-md border border-border bg-card-background p-5" style={containerQueryStyle}>
            <div className="flex min-h-14 min-w-0 items-center">
              {logo.logoUrl ? <img src={logo.logoUrl} alt={`${logo.name} logo`} className="max-h-12 max-w-full object-contain" loading="lazy" /> : <span className="min-w-0 font-semibold leading-tight text-foreground" style={{ ...balancedTextStyle, fontSize: "clamp(1.05rem, 9cqw, 1.45rem)" }}>{logo.name}</span>}
            </div>
            <div className="min-w-0">
              {logo.label ? <p className="text-sm text-muted-foreground" style={bodyTextStyle}>{logo.label}</p> : null}
              {logo.status ? <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-foreground" style={labelTextStyle}>{logo.status}</p> : null}
            </div>
          </article>
        ))}
      </div>
      {caption ? <p className="max-w-3xl text-sm text-muted-foreground" style={safeTextStyle}>{caption}</p> : null}
    </section>
  );
}
