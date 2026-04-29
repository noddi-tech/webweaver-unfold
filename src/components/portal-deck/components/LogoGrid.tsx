import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, LogoItem } from "./types";

export interface LogoGridProps extends DeckComponentProps {
  title?: string;
  caption?: string;
  logos: LogoItem[];
}

export function LogoGrid({ title, caption, logos, density = "sparse", className }: LogoGridProps) {
  return (
    <section className={cn("space-y-8", className)}>
      {title ? <h2 className={type.headline}>{title}</h2> : null}
      <div className={cn("grid gap-3", density === "dense" ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4")}>
        {logos.map((logo) => (
          <article key={logo.name} className="flex min-h-[128px] flex-col justify-between rounded-md border border-border bg-card-background p-5">
            <div className="flex h-14 items-center">
              {logo.logoUrl ? <img src={logo.logoUrl} alt={`${logo.name} logo`} className="max-h-12 max-w-full object-contain" loading="lazy" /> : <span className="text-xl font-semibold text-foreground">{logo.name}</span>}
            </div>
            <div>
              {logo.label ? <p className="text-sm text-muted-foreground">{logo.label}</p> : null}
              {logo.status ? <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-foreground">{logo.status}</p> : null}
            </div>
          </article>
        ))}
      </div>
      {caption ? <p className="max-w-3xl text-sm text-muted-foreground">{caption}</p> : null}
    </section>
  );
}
