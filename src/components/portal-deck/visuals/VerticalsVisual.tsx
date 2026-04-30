import { CategoryCard } from "../components";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { SlideVisualProps, VerticalsConfig } from "../types";

export function VerticalsVisual({ slide, config }: SlideVisualProps<VerticalsConfig>) {
  return (
    <section className="h-full overflow-hidden p-6 sm:p-10">
      {config?.items?.length ? (
        <div className="space-y-8">
          {slide.title ? <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{slide.title}</h2> : null}
          <div className="deck-auto-grid gap-4">
            {config.items.map((vertical, index) => <CategoryCard key={vertical.name} label={`Vertikal ${index + 1}`} title={vertical.name} description={vertical.description} status={vertical.status} />)}
          </div>
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
