import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { SlideVisualProps, VisualConfig } from "../types";

export function CustomVisual({ slide }: SlideVisualProps<VisualConfig>) {
  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {slide.body_md ? <MarkdownBody body={slide.body_md} /> : <PreparedPlaceholder />}
    </section>
  );
}
