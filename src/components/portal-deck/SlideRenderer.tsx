import ReactMarkdown from "react-markdown";
import { CoverVisual } from "./visuals/CoverVisual";
import { LogosVisual } from "./visuals/LogosVisual";
import { BadgesVisual } from "./visuals/BadgesVisual";
import { FunnelVisual } from "./visuals/FunnelVisual";
import { AdoptionVisual } from "./visuals/AdoptionVisual";
import { GlideVisual } from "./visuals/GlideVisual";
import { TeamVisual } from "./visuals/TeamVisual";
import { RoundVisual } from "./visuals/RoundVisual";
import { GapVisual } from "./visuals/GapVisual";
import { VerticalsVisual } from "./visuals/VerticalsVisual";
import { CustomerSpotlightVisual } from "./visuals/CustomerSpotlightVisual";
import { CustomVisual } from "./visuals/CustomVisual";
import { deckText } from "./i18n";
import type { SlideMode, SlideRow } from "./types";
import { normalizeBadgesConfig, normalizeCustomerSpotlightConfig, normalizeGapConfig, normalizeGlideConfig, normalizeLogosConfig, normalizeVerticalsConfig } from "./types";

interface SlideRendererProps {
  slide: SlideRow;
  mode?: SlideMode;
}

export function PreparedPlaceholder() {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-center text-sm italic text-muted-foreground">
      {deckText.contentBeingPrepared}
    </div>
  );
}

export function SlideHeader({ slide }: { slide: SlideRow }) {
  if (!slide.title && !slide.subtitle) return null;

  return (
    <header className="mb-6 sm:mb-8">
      {slide.title ? <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{slide.title}</h2> : null}
      {slide.subtitle ? <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">{slide.subtitle}</p> : null}
    </header>
  );
}

export function MarkdownBody({ body }: { body?: string | null }) {
  if (!body) return null;

  return (
    <div className="prose prose-sm mt-6 max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-p:leading-relaxed prose-li:leading-relaxed sm:prose-base">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}

export function SlideRenderer({ slide, mode = "viewer" }: SlideRendererProps) {
  try {
    switch (slide.visual_type) {
      case "cover":
        return <CoverVisual slide={slide} config={slide.visual_config} mode={mode} />;
      case "logos":
        return <LogosVisual slide={slide} config={normalizeLogosConfig(slide.visual_config)} mode={mode} />;
      case "badges":
        return <BadgesVisual slide={slide} config={normalizeBadgesConfig(slide.visual_config)} mode={mode} />;
      case "funnel":
        return <FunnelVisual slide={slide} config={slide.visual_config} mode={mode} />;
      case "adoption":
        return <AdoptionVisual slide={slide} config={slide.visual_config} mode={mode} />;
      case "glide":
        return <GlideVisual slide={slide} config={normalizeGlideConfig(slide.visual_config)} mode={mode} />;
      case "team":
        return <TeamVisual slide={slide} config={slide.visual_config} mode={mode} />;
      case "round":
        return <RoundVisual slide={slide} config={slide.visual_config} mode={mode} />;
      case "gap":
        return <GapVisual slide={slide} config={normalizeGapConfig(slide.visual_config)} mode={mode} />;
      case "verticals":
        return <VerticalsVisual slide={slide} config={normalizeVerticalsConfig(slide.visual_config)} mode={mode} />;
      case "customer-spotlight":
        return <CustomerSpotlightVisual slide={slide} config={normalizeCustomerSpotlightConfig(slide.visual_config)} mode={mode} />;
      case "custom":
        return <CustomVisual slide={slide} config={slide.visual_config} mode={mode} />;
      default:
        return <PreparedPlaceholder />;
    }
  } catch {
    return <PreparedPlaceholder />;
  }
}
