import { CitationFooter, Hero } from "../components";
import type { CoverConfig, SlideVisualProps } from "../types";

export function CoverVisual({ slide, config }: SlideVisualProps<CoverConfig>) {
  const footer = typeof config?.footer === "object" ? config.footer : null;
  return (
    <section className="flex h-full flex-col overflow-hidden p-6 sm:p-10">
      <Hero
        className="flex-1"
        variant={config?.background === "minimal" ? "minimal" : "gradient"}
        eyebrow={config?.eyebrow ?? config?.brand}
        title={config?.headline ?? slide.title ?? "Navio"}
        subtitle={config?.supporting ?? slide.subtitle ?? undefined}
        kicker={typeof config?.footer === "string" ? config.footer : undefined}
      />
      {footer?.sources?.length ? <CitationFooter className="mt-5" note={footer.note} sources={footer.sources} /> : null}
    </section>
  );
}
