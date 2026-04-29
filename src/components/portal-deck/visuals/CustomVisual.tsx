import {
  AnnotatedChart,
  CategoryCard,
  CitationFooter,
  ComparisonTable,
  CustomerSpotlight,
  FunnelLayout,
  Hero,
  LogoGrid,
  PersonCard,
  ProblemSolutionGrid,
  ProcessFlow,
  QuoteBlock,
  SectionDivider,
  StatCallout,
  StatGrid,
  Timeline,
} from "../components";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { ComponentRef, CustomConfig, SlideVisualProps } from "../types";

function asProps(ref: ComponentRef) {
  return ref.props ?? {};
}

function renderRef(ref: ComponentRef, index: number) {
  const props = asProps(ref) as any;
  switch (ref.component) {
    case "Hero": return <Hero key={index} {...props} title={props.title ?? props.headline ?? "Navio"} />;
    case "StatCallout": return <StatCallout key={index} {...props} label={props.label ?? ""} value={props.value ?? ""} context={props.context ?? ""} />;
    case "StatGrid": return <StatGrid key={index} {...props} metrics={props.metrics ?? []} />;
    case "LogoGrid": return <LogoGrid key={index} {...props} logos={props.logos ?? []} />;
    case "QuoteBlock": return <QuoteBlock key={index} {...props} quote={props.quote ?? ""} author={props.author ?? ""} />;
    case "ComparisonTable": return <ComparisonTable key={index} {...props} columns={props.columns ?? []} rows={props.rows ?? []} />;
    case "Timeline": return <Timeline key={index} {...props} items={props.items ?? []} />;
    case "ProcessFlow": return <ProcessFlow key={index} {...props} steps={props.steps ?? []} />;
    case "ProblemSolutionGrid": return <ProblemSolutionGrid key={index} {...props} pairs={props.pairs ?? []} />;
    case "AnnotatedChart": return <AnnotatedChart key={index} {...props} points={props.points ?? []} annotations={props.annotations ?? []} />;
    case "FunnelLayout": return <FunnelLayout key={index} {...props} stages={props.stages ?? []} />;
    case "CustomerSpotlight": return <CustomerSpotlight key={index} {...props} customer={props.customer ?? ""} summary={props.summary ?? ""} metrics={props.metrics ?? []} />;
    case "SectionDivider": return <SectionDivider key={index} {...props} title={props.title ?? ""} />;
    case "CitationFooter": return <CitationFooter key={index} {...props} sources={props.sources ?? []} />;
    case "PersonCard": return <PersonCard key={index} {...props} person={props.person ?? { name: "", role: "", bio: "" }} />;
    case "CategoryCard": return <CategoryCard key={index} {...props} label={props.label ?? ""} title={props.title ?? ""} description={props.description ?? ""} />;
    default: return null;
  }
}

export function CustomVisual({ slide, config }: SlideVisualProps<CustomConfig>) {
  const rendered = config?.composition?.map(renderRef).filter(Boolean) ?? [];
  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      {!rendered.length ? <SlideHeader slide={slide} /> : null}
      {rendered.length ? <div className="space-y-8">{rendered}</div> : slide.body_md ? <MarkdownBody body={slide.body_md} /> : <PreparedPlaceholder />}
    </section>
  );
}
