import type { SlideVisualProps } from "../types";

export function CoverVisual({ slide }: SlideVisualProps) {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-8 text-center" style={{ background: "var(--gradient-mesh-velvet)" }}>
      <div className="absolute inset-0 bg-primary/25" aria-hidden="true" />
      <div className="relative z-10 max-w-4xl">
        <h1 className="text-5xl font-bold leading-none text-white sm:text-7xl">{slide.title || "Navio"}</h1>
        {slide.subtitle ? <p className="mt-6 text-xl leading-relaxed text-white/80 sm:text-2xl">{slide.subtitle}</p> : null}
      </div>
      <div className="absolute bottom-6 right-6 z-10 text-2xl font-bold text-white/80">Navio</div>
    </section>
  );
}
