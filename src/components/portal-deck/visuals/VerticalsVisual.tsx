import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { SlideVisualProps, VerticalsConfig } from "../types";

export function VerticalsVisual({ slide, config }: SlideVisualProps<VerticalsConfig>) {
  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {config?.verticals?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {config.verticals.map((vertical) => (
            <article key={vertical.name} className="rounded-xl bg-card-surface p-6">
              <div className="mb-4 inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{vertical.status}</div>
              <h3 className="text-xl font-semibold text-foreground">{vertical.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{vertical.description}</p>
            </article>
          ))}
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
