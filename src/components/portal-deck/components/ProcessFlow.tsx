import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type } from "../visuals/_brand";
import type { DeckComponentProps, ProcessStep } from "./types";
import { accentStyle, balancedTextStyle, safeTextStyle } from "./utils";

export interface ProcessFlowProps extends DeckComponentProps {
  title?: string;
  steps: ProcessStep[];
}

export function ProcessFlow({ title, steps, density = "sparse", accent = "primary", className }: ProcessFlowProps) {
  return (
    <section className={cn("space-y-8", className)} style={accentStyle(accent)}>
      {title ? <h2 className={type.headline} style={balancedTextStyle}>{title}</h2> : null}
      <div className={cn("grid items-stretch", density === "dense" ? "gap-4 md:grid-cols-2 xl:grid-cols-4" : "gap-5 md:grid-cols-2 xl:grid-cols-4")}>
        {steps.map((step, index) => (
          <div key={step.title} className="relative min-w-0">
            <article className="flex h-full min-w-0 flex-col rounded-md border border-border bg-card-background p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md text-primary-foreground" style={{ background: "var(--deck-accent)" }}>{step.icon ?? index + 1}</div>
              <h3 className="text-lg font-semibold text-foreground" style={balancedTextStyle}>{step.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground" style={safeTextStyle}>{step.description}</p>
              {step.metric ? <p className="mt-5 border-t border-border pt-4 text-sm font-semibold text-foreground" style={balancedTextStyle}>{step.metric}</p> : null}
            </article>
            {index < steps.length - 1 ? <ArrowRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground xl:block" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
