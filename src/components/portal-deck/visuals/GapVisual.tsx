import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { GapConfig, SlideVisualProps } from "../types";

export function GapVisual({ slide, config }: SlideVisualProps<GapConfig>) {
  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {config?.categories?.length ? (
        <div className="space-y-7">
          {config.categories.map((category) => (
            <div key={category.label} className="grid gap-3 md:grid-cols-[180px_1fr] md:items-center">
              <p className="text-sm font-semibold text-foreground">{category.label}</p>
              <div className="relative h-12 rounded-full bg-muted">
                <div className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-border" />
                {category.competitors.map((competitor) => <div key={competitor.name} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground" style={{ left: `${competitor.position}%` }} title={competitor.name} />)}
                <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20" style={{ left: `${category.navio_position}%` }} title="Navio" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary">Navio gap</span>
              </div>
            </div>
          ))}
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
