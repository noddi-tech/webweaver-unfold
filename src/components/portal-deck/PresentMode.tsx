import { useEffect, useRef } from "react";
import { SlideRenderer } from "./SlideRenderer";
import type { SlideRow } from "./types";

interface PresentModeProps {
  slides: SlideRow[];
  activeIndex: number;
  onIndexChange: (index: number, viaPresent: boolean) => void;
  onExit: () => void;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

export function PresentMode({ slides, activeIndex, onIndexChange, onExit }: PresentModeProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen can be blocked; the overlay remains usable.
      }
    };

    void enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) onExit();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onExit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const next = () => onIndexChange(Math.min(slides.length - 1, activeIndex + 1), true);
      const previous = () => onIndexChange(Math.max(0, activeIndex - 1), true);

      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        next();
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        previous();
      } else if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        onExit();
      } else if (/^[1-9]$/.test(event.key)) {
        const targetIndex = Number(event.key) - 1;
        if (targetIndex < slides.length) onIndexChange(targetIndex, true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onExit, onIndexChange, slides.length]);

  const slide = slides[activeIndex];
  if (!slide) return null;

  return (
    <div ref={shellRef} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4 text-white">
      <div className="aspect-video w-full max-w-[min(96vw,calc(96vh*16/9))] overflow-hidden rounded-2xl bg-card-background shadow-2xl">
        <SlideRenderer key={`present-${slide.id}`} slide={slide} mode="present" />
      </div>
      <div className="absolute bottom-6 right-6 text-sm text-white/60">
        {activeIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
