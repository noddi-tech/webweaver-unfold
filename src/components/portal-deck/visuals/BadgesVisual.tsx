import { ProblemSolutionGrid } from "../components";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import type { BadgesConfig, SlideVisualProps } from "../types";

export function BadgesVisual({ slide, config }: SlideVisualProps<BadgesConfig>) {
  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      {config?.pairs?.length ? <ProblemSolutionGrid title={slide.title ?? undefined} pairs={config.pairs} /> : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
