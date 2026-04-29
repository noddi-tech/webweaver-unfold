import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useInvestorTracking } from "@/hooks/useInvestorTracking";
import { cn } from "@/lib/utils";
import { EmptyDeckState } from "./EmptyDeckState";
import { deckText } from "./i18n";
import { {deckText.present}Mode } from "./{deckText.present}Mode";
import { SlideRenderer } from "./SlideRenderer";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { normalizeSlide, type SlideRow } from "./types";

const dwellSecondsSince = (startedAt: number) => Math.max(0, Math.round((Date.now() - startedAt) / 1000));
const trackedPathForSlide = (slide: SlideRow) => `${window.location.pathname}?tab=pitch&slide=${slide.slug}`;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

function SlideSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="aspect-video overflow-hidden rounded-2xl bg-card-background p-8 shadow-2xl">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
      <div className="mx-auto mt-6 max-w-2xl space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function SlideViewer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [presentOpen, set{deckText.present}Open] = useState(false);
  const { trackEvent } = useInvestorTracking();
  const activeSlideRef = useRef<SlideRow | null>(null);
  const slideEnteredAtRef = useRef(Date.now());
  const hasTrackedInitialSlideRef = useRef(false);
  const presentSlideRef = useRef<SlideRow | null>(null);
  const presentEnteredAtRef = useRef(Date.now());
  const hasTracked{deckText.present}Ref = useRef(false);

  const previewAll = import.meta.env.DEV && searchParams.get("preview") === "all";

  const { data: slides = [], isLoading, isError } = useQuery({
    queryKey: ["portal-slides-published", previewAll],
    queryFn: async () => {
      const query = supabase
        .from("portal_slides")
        .select("*")
        .order("display_order", { ascending: true });

      // TODO: revisit when CMS preview auth is built — for now, dev-only is sufficient.
      if (!previewAll) {
        query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(normalizeSlide);
    },
  });

  const activeSlide = slides[activeIndex] ?? null;

  const updateUrlForSlide = useCallback((slide: SlideRow) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "pitch");
    nextParams.set("slide", slide.slug);
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const trackRegularTransition = useCallback((nextIndex: number) => {
    const nextSlide = slides[nextIndex];
    if (!nextSlide) return;

    const previousSlide = activeSlideRef.current;
    if (previousSlide?.id === nextSlide.id) return;

    if (previousSlide) {
      trackEvent({
        event_type: "slide_exit",
        path: trackedPathForSlide(previousSlide),
        payload: { slug: previousSlide.slug, slide_number: previousSlide.slide_number },
        dwell_seconds: dwellSecondsSince(slideEnteredAtRef.current),
      });
    }

    trackEvent({
      event_type: "slide_view",
      path: trackedPathForSlide(nextSlide),
      payload: { slug: nextSlide.slug, slide_number: nextSlide.slide_number },
    });
    activeSlideRef.current = nextSlide;
    slideEnteredAtRef.current = Date.now();
  }, [slides, trackEvent]);

  const goToSlide = useCallback((index: number, via{deckText.present} = false) => {
    const boundedIndex = Math.max(0, Math.min(slides.length - 1, index));
    const nextSlide = slides[boundedIndex];
    if (!nextSlide) return;

    if (via{deckText.present} && presentSlideRef.current?.id !== nextSlide.id) {
      const previous{deckText.present}Slide = presentSlideRef.current;
      if (previous{deckText.present}Slide) {
        trackEvent({
          event_type: "slide_exit",
          path: trackedPathForSlide(previous{deckText.present}Slide),
          payload: { slug: previous{deckText.present}Slide.slug, slide_number: previous{deckText.present}Slide.slide_number, via: "present" },
          dwell_seconds: dwellSecondsSince(presentEnteredAtRef.current),
        });
      }
      trackEvent({
        event_type: "slide_view",
        path: trackedPathForSlide(nextSlide),
        payload: { slug: nextSlide.slug, slide_number: nextSlide.slide_number, via: "present" },
      });
      presentSlideRef.current = nextSlide;
      presentEnteredAtRef.current = Date.now();
    } else if (!via{deckText.present}) {
      trackRegularTransition(boundedIndex);
    }

    setActiveIndex(boundedIndex);
    updateUrlForSlide(nextSlide);
  }, [slides, trackEvent, trackRegularTransition, updateUrlForSlide]);

  useEffect(() => {
    if (!slides.length) return;

    const requestedSlug = searchParams.get("slide");
    const requestedIndex = requestedSlug ? slides.findIndex((slide) => slide.slug === requestedSlug) : -1;
    const initialIndex = requestedIndex >= 0 ? requestedIndex : 0;
    const initialSlide = slides[initialIndex];

    setActiveIndex(initialIndex);
    if (!hasTrackedInitialSlideRef.current) {
      hasTrackedInitialSlideRef.current = true;
      activeSlideRef.current = initialSlide;
      slideEnteredAtRef.current = Date.now();
      trackEvent({
        event_type: "slide_view",
        path: trackedPathForSlide(initialSlide),
        payload: { slug: initialSlide.slug, slide_number: initialSlide.slide_number },
      });
    }

    if (requestedIndex < 0 || requestedSlug !== initialSlide.slug) {
      updateUrlForSlide(initialSlide);
    }
  }, [slides, searchParams, trackEvent, updateUrlForSlide]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (presentOpen || isTypingTarget(event.target) || !slides.length) return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goToSlide(activeIndex + 1);
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goToSlide(activeIndex - 1);
      } else if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        set{deckText.present}Open(true);
      } else if (/^[1-9]$/.test(event.key)) {
        const targetIndex = Number(event.key) - 1;
        if (targetIndex < slides.length) goToSlide(targetIndex);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goToSlide, presentOpen, slides.length]);

  useEffect(() => {
    return () => {
      const currentSlide = activeSlideRef.current;
      if (!currentSlide) return;
      trackEvent({
        event_type: "slide_exit",
        path: trackedPathForSlide(currentSlide),
        payload: { slug: currentSlide.slug, slide_number: currentSlide.slide_number },
        dwell_seconds: dwellSecondsSince(slideEnteredAtRef.current),
      });
    };
  }, [trackEvent]);

  useEffect(() => {
    if (!presentOpen || !activeSlide || hasTracked{deckText.present}Ref.current) return;
    hasTracked{deckText.present}Ref.current = true;
    presentSlideRef.current = activeSlide;
    presentEnteredAtRef.current = Date.now();
    trackEvent({
      event_type: "slide_view",
      path: trackedPathForSlide(activeSlide),
      payload: { slug: activeSlide.slug, slide_number: activeSlide.slide_number, via: "present" },
    });
  }, [activeSlide, presentOpen, trackEvent]);

  const close{deckText.present}Mode = useCallback(() => {
    const current{deckText.present}Slide = presentSlideRef.current;
    if (current{deckText.present}Slide) {
      trackEvent({
        event_type: "slide_exit",
        path: trackedPathForSlide(current{deckText.present}Slide),
        payload: { slug: current{deckText.present}Slide.slug, slide_number: current{deckText.present}Slide.slide_number, via: "present" },
        dwell_seconds: dwellSecondsSince(presentEnteredAtRef.current),
      });
    }
    hasTracked{deckText.present}Ref.current = false;
    presentSlideRef.current = null;
    set{deckText.present}Open(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [trackEvent]);

  const handleExportPdf = () => {
    trackEvent({
      event_type: "pdf_export",
      path: window.location.pathname,
      payload: { trigger: "button" },
    });
    window.print();
  };

  const currentCounter = useMemo(() => deckText.slideCounter(activeIndex + 1, slides.length), [activeIndex, slides.length]);

  if (isLoading) return <SlideSkeleton />;
  if (isError || slides.length === 0) return <EmptyDeckState />;
  if (!activeSlide) return <EmptyDeckState />;

  return (
    <div className="w-full">
      <div className="no-print mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{currentCounter}</p>
        <p className="hidden text-xs italic text-muted-foreground sm:block">{deckText.pressTo{deckText.present}}</p>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <div className="aspect-video overflow-hidden rounded-2xl bg-card-background shadow-2xl">
          <div key={activeSlide.id} className={cn("h-full w-full transition-opacity duration-200 ease-out opacity-100")}>
            <SlideRenderer slide={activeSlide} mode="viewer" />
          </div>
        </div>
      </div>

      <div className="no-print mt-4 mb-4 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => goToSlide(activeIndex - 1)} disabled={activeIndex === 0}>
          <ChevronLeft className="h-4 w-4" />
          {deckText.previous}
        </Button>
        <p className="text-sm text-muted-foreground md:hidden">{currentCounter}</p>
        <Button variant="ghost" size="sm" onClick={() => goToSlide(activeIndex + 1)} disabled={activeIndex === slides.length - 1}>
          {deckText.next}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ThumbnailStrip slides={slides} activeIndex={activeIndex} onSelect={(index) => goToSlide(index)} />

      <div className="no-print mt-4 flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={handleExportPdf}>
          <Download className="h-4 w-4" />
          {deckText.exportPdf}
        </Button>
        <Button variant="outline" size="sm" onClick={() => set{deckText.present}Open(true)}>
          <Maximize2 className="h-4 w-4" />
          {deckText.present}
        </Button>
      </div>

      <div className="print-deck-container hidden print:block" aria-hidden="true">
        {slides.map((slide) => (
          <div key={`print-${slide.id}`} className="print-slide">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-card-background">
              <SlideRenderer slide={slide} mode="print" />
            </div>
          </div>
        ))}
      </div>

      {presentOpen ? <{deckText.present}Mode slides={slides} activeIndex={activeIndex} onIndexChange={goToSlide} onExit={close{deckText.present}Mode} /> : null}
    </div>
  );
}
