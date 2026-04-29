import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { SlideRow } from "./types";

interface ThumbnailStripProps {
  slides: SlideRow[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ThumbnailStrip({ slides, activeIndex, onSelect }: ThumbnailStripProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  return (
    <div className="no-print mt-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center justify-center gap-2 px-1">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={slide.id}
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "flex h-9 w-16 items-center justify-center rounded-md border-2 bg-muted text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "border-primary text-foreground ring-2 ring-primary ring-offset-2"
                  : "border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={active ? "true" : undefined}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
