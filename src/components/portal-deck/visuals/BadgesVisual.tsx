import { ProblemSolutionGrid } from "../components";
import { PreparedPlaceholder } from "../SlideRenderer";
import type { BadgesConfig, SlideVisualProps } from "../types";

export function BadgesVisual({ slide, config }: SlideVisualProps<BadgesConfig>) {
  return (
    <section className="flex h-full flex-col overflow-hidden p-6 sm:p-10">
      {config?.pairs?.length ? (
        <ProblemSolutionGrid title={slide.title ?? undefined} pairs={config.pairs} />
      ) : (
        <PreparedPlaceholder />
      )}
    </section>
  );
}
