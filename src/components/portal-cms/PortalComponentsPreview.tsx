import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PortalCmsLayout } from "./PortalCmsLayout";
import { SlideRenderer } from "@/components/portal-deck/SlideRenderer";
import type { SlideRow, VisualType } from "@/components/portal-deck/types";
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
  type ChartPoint,
  type ComparisonColumn,
  type ComparisonRow,
  type FunnelStage,
  type LogoItem,
  type MetricItem,
  type Person,
  type ProcessStep,
  type TextPair,
  type TimelineItem,
} from "@/components/portal-deck/components";
import type { Density } from "@/components/portal-deck/visuals/_brand";
import type { Database } from "@/integrations/supabase/types";

type CustomerRow = Database["public"]["Tables"]["portal_customers"]["Row"];
type RoundRow = Database["public"]["Tables"]["portal_round_terms"]["Row"];
type AuditResult = { key: string; status: "PASS" | "FAIL"; issues: string[] };

const auditWidths = [1280, 768, 375] as const;

const fallbackCustomers: CustomerRow[] = [
  { id: "hurtigruta", slug: "hurtigruta-carglass", name: "Hurtigruta Carglass", parent_brand: "Hurtigruta", logo_url: null, status: "Live ekspansjon", funnel_stage: "Skalering", cities_live: 8, total_addressable_cities: 28, customers_per_day: 42, monthly_revenue_nok: 1350000, pilot_started_at: null, contract_signed_at: null, case_study_md: null, testimonial_quote: "Navio gir oss et skalerbart operativt lag for mobile tjenester uten at vi må bygge dispatch på nytt.", testimonial_author: "Driftsleder", testimonial_role: "Hurtigruta Carglass", display_order: 1, is_published: true },
  { id: "dekkpartner", slug: "dekkpartner", name: "Dekkpartner", parent_brand: "Dekknettverk", logo_url: null, status: "Pilot", funnel_stage: "Pilot", cities_live: 3, total_addressable_cities: 18, customers_per_day: 18, monthly_revenue_nok: 420000, pilot_started_at: null, contract_signed_at: null, case_study_md: null, testimonial_quote: null, testimonial_author: null, testimonial_role: null, display_order: 2, is_published: true },
  { id: "fleetcare", slug: "fleetcare", name: "FleetCare Norge", parent_brand: "Flåteoperatør", logo_url: null, status: "Kvalifisert", funnel_stage: "Kvalifisert", cities_live: 0, total_addressable_cities: 12, customers_per_day: null, monthly_revenue_nok: null, pilot_started_at: null, contract_signed_at: null, case_study_md: null, testimonial_quote: null, testimonial_author: null, testimonial_role: null, display_order: 3, is_published: true },
];

const fallbackRound: RoundRow = { id: "round", round_label: "NOK 10–20 mill. seed extension", round_size_min_nok: 10000000, round_size_max_nok: 20000000, valuation_min_nok: null, valuation_max_nok: null, total_raised_to_date_nok: 22000000, target_close_date: "2026-06-30", use_of_funds: [{ label: "Kommersiell ekspansjon", pct: 45 }, { label: "Produkt­automatisering", pct: 35 }, { label: "Drift", pct: 20 }], is_active: true, updated_at: new Date().toISOString() };

function PreviewFrame({ name, density, children }: { name: string; density: Density; children: React.ReactNode }) {
  return <Card className="overflow-hidden border-border bg-background"><CardHeader className="border-b border-border"><div className="flex items-center justify-between gap-4"><CardTitle className="text-lg">{name}</CardTitle><Badge variant="outline">{density}</Badge></div><CardDescription>Investor deck component preview using Norwegian Navio sample content.</CardDescription></CardHeader><CardContent className="bg-background p-6"><div className="min-h-[620px] overflow-auto rounded-md border border-border bg-background p-8">{children}</div></CardContent></Card>;
}

function ComponentPair({ name, render }: { name: string; render: (density: Density) => React.ReactNode }) {
  return <section className="grid gap-6 xl:grid-cols-2"><PreviewFrame name={name} density="sparse">{render("sparse")}</PreviewFrame><PreviewFrame name={name} density="dense">{render("dense")}</PreviewFrame></section>;
}

function AuditFrame({ name, density, width, children }: { name: string; density: Density; width: number; children: React.ReactNode }) {
  return <div data-audit-case={`${name}|${density}|${width}`} className="min-w-0 overflow-hidden border-b border-border/60 py-4"><div className="mx-auto max-w-full overflow-hidden rounded-md border border-border bg-background p-4" style={{ width }}>{children}</div></div>;
}

function sampleSlide(visual_type: VisualType, slug: string, title: string, visual_config: SlideRow["visual_config"], subtitle?: string): SlideRow {
  return { id: `sample-${slug}`, slug, title, subtitle: subtitle ?? null, body_md: null, visual_type, visual_config, slide_number: 1, display_order: 1, is_published: true, narrative_role: null, drafting_guidance: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as SlideRow;
}

export function PortalComponentsPreview() {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const { data } = useQuery({
    queryKey: ["portal-components-preview-data"],
    queryFn: async () => {
      const [customers, round] = await Promise.all([
        supabase.from("portal_customers").select("*").eq("is_published", true).order("display_order", { ascending: true }).limit(8),
        supabase.from("portal_round_terms").select("*").eq("is_active", true).limit(1).maybeSingle(),
      ]);
      if (customers.error) throw customers.error;
      if (round.error) throw round.error;
      return { customers: customers.data ?? [], round: round.data };
    },
  });

  const samples = useMemo(() => {
    const customers = data?.customers?.length ? data.customers : fallbackCustomers;
    const round = data?.round ?? fallbackRound;
    const spotlight = customers.find((customer) => customer.slug?.includes("hurtigruta")) ?? customers[0] ?? fallbackCustomers[0];
    const roundLabel = round.round_size_min_nok && round.round_size_max_nok ? `NOK ${round.round_size_min_nok / 1_000_000}–${round.round_size_max_nok / 1_000_000} mill.` : "NOK 10–20 mill.";
    const metrics: MetricItem[] = [
      { label: "Emisjonsmål", value: roundLabel, context: "Kapital for å skalere mobile bil- og dekktjenesteoperatører", accent: "purple" },
      { label: "Hentet inn til nå", value: `NOK ${Math.round((round.total_raised_to_date_nok ?? 22000000) / 1_000_000)} mill.`, context: "Tidligere kapital omgjort til operativ proof", accent: "green" },
      { label: "Aktive byer", value: "8 byer, opp fra 2", context: spotlight.parent_brand ?? "Mobil tjenesteoperatør", accent: "orange" },
      { label: "Kunder per dag", value: "42 kunder per dag", context: "Volum som viser rute- og driftsdensitet", accent: "teal" },
    ];
    const logos: LogoItem[] = ["Hurtigruta Carglass", "Best-Drive Norge", "Trønderdekk AS", ...customers.map((customer) => customer.name)].slice(0, 8).map((name, index) => ({ name, logoUrl: customers[index]?.logo_url ?? null, label: customers[index]?.parent_brand ?? "Tjenesteoperatør", status: customers[index]?.status ?? customers[index]?.funnel_stage ?? "Aktiv" }));
    const pairs: TextPair[] = [
      { label: "Operatørens utfordring", title: "Etterspørselen er lokal, kapasiteten er fragmentert", description: "Mobile bil- og dekktjenester trenger tett ruting, sesongplanlegging og kundevennlig booking i én flyt.", metric: "Bygget for by-for-by replikering" },
      { label: "Navios svar", title: "Et vertikalt operativsystem for mobile tjenester", description: "Navio kombinerer booking, dispatch, utførelse og partnerorkestrering i et repeterbart operativt lag.", metric: "Én playbook på tvers av operatører" },
      { label: "Investorimplikasjon", title: "Replikering slår skreddersøm", description: "Samme motor kan støtte bilglass, dekkskift og flåtevedlikehold uten nye spesialprosjekter hver gang.", metric: "Høyere densitet, lavere lanseringsfriksjon" },
    ];
    const timeline: TimelineItem[] = [
      { date: "2024", title: "Fot innenfor", description: "Lanser med betrodde mobile tjenesteoperatører og bevis operativ kvalitet.", metric: "Første aktive byer" },
      { date: "2025", title: "Kundeverdimotor", description: "Konverter piloter til repeterbar omsetning og bedre rutedensitet.", metric: "Hurtigruta Carglass som referanse" },
      { date: "2026", title: "Vertikal replikering", description: "Utvid fra bilglass til dekk og flåtevedlikehold.", metric: roundLabel },
      { date: "Neste", title: "Kategoriplattform", description: "Bli orkestreringslaget for mobile biltjenester i Norden.", metric: "Flere vertikaler" },
    ];
    const steps: ProcessStep[] = [
      { title: "Fang etterspørsel", description: "Kundeforespørselen går inn i en merkevaretilpasset bookingflyt med tjeneste, bil og lokasjon.", metric: "Høyere konvertering" },
      { title: "Planlegg kapasitet", description: "Navio matcher etterspørsel med teknikere, ruter, sesonger og SLA-vinduer.", metric: "Mindre dispatch-friksjon" },
      { title: "Utfør jobben", description: "Teknikere gjennomfører oppdrag i mobile arbeidsflyter med kundeoppdateringer.", metric: "Klar for felt" },
      { title: "Lær av data", description: "Hver jobb forbedrer densitet, planlegging og ekspansjonsøkonomi.", metric: "Sammensatt dataverdi" },
    ];
    const chartPoints: ChartPoint[] = [{ label: "Q1", value: 1.2 }, { label: "Q2", value: 2.4 }, { label: "Q3", value: 4.1 }, { label: "Q4", value: 7.5 }, { label: "Q5", value: 12.8 }, { label: "Q6", value: 20.0 }];
    const funnel: FunnelStage[] = [
      { label: "Kvalifiserte mobile tjenesteoperatører innen glass, dekk og flåte", value: "18", context: "Bilglass, dekk og flåteservice", widthPct: 100 },
      { label: "Pilot eller kommersiell design med byspesifikk lanseringsplan", value: "7", context: "Rutedensitet og SLA-modellering", widthPct: 72 },
      { label: "Live eller ekspansjonsklare operatører", value: "3", context: "Operativ proof i markedet", widthPct: 48 },
      { label: "Skaleringskandidat", value: "Hurtigruta Carglass", context: "Referansekunde", widthPct: 28 },
    ];
    const columns: ComparisonColumn[] = [{ key: "generic", label: "Generisk booking" }, { key: "agency", label: "Skreddersydd byråbygg" }, { key: "navio", label: "Navio" }];
    const rows: ComparisonRow[] = [
      { label: "Driftsdøgnet for én lokasjon", values: { generic: "Kun timefangst", agency: "Dyr spesialflyt", navio: "Rute-, mannskap- og jobborkestrering" }, emphasisKey: "navio" },
      { label: "Vertikal replikering", values: { generic: "Lav", agency: "Treg", navio: "Gjenbrukbar på tvers av bilglass, dekk og flåte" }, emphasisKey: "navio" },
      { label: "Operatørøkonomi", values: { generic: "Ingen operativ gearing", agency: "Tungt på tjenester", navio: "Densiteten forbedres for hver by" }, emphasisKey: "navio" },
      { label: "Sesongtopper i norske byer", values: { generic: "Manuell oppfølging", agency: "Bygges om hver sesong", navio: "Kapasitetsplanlegging gjenbrukes på tvers av byer" }, emphasisKey: "navio" },
    ];
    const people: Person[] = [
      { name: "Joachim Navio", role: "Gründer / CEO", bio: "Bygger den kommersielle og operative playbooken for mobile biltjenestekategorier.", metric: "Operatørførst utførelse" },
      { name: "Navio produktleder", role: "Produkt", bio: "Gjør feltarbeidsflyter om til repeterbare programvareprimitiver for booking, planlegging og utførelse.", metric: "Vertikal OS-arkitektur" },
    ];
    return { spotlight, metrics, logos, pairs, timeline, steps, chartPoints, funnel, columns, rows, people };
  }, [data]);

  const componentRenders = useMemo(() => [
    { name: "Hero", render: (density: Density) => <Hero density={density} variant={density === "sparse" ? "gradient" : "minimal"} eyebrow="Navio investorpresentasjon" title="En fot innenfor hos verdens største merkevarer" subtitle="Navio hjelper bilglass-, dekk- og flåteoperatører med å gjøre fragmentert mobil etterspørsel om til repeterbar by-for-by drift." metrics={samples.metrics} kicker="NOK 10–20 mill. seed extension" /> },
    { name: "StatCallout", render: (density: Density) => <StatCallout density={density} label="Emisjon" value="Operativsystemet for mobile bil- og dekktjenester" context="Kapital for å skalere kundeverdimotoren som allerede er bevist med Hurtigruta Carglass." supporting="Midlene går til kommersiell ekspansjon, produkt­automatisering og kapasitet til operatøronboarding." /> },
    { name: "StatGrid", render: (density: Density) => <StatGrid density={density} title="Proof points investorer bør huske" subtitle="Tett nok for investeringskomité, stramt nok for deck-fortellingen." metrics={[...samples.metrics, { label: "Byekspansjon live", value: "8 byer, opp fra 2", context: "Nåværende fotavtrykk for referansekunden" }]} /> },
    { name: "LogoGrid", render: (density: Density) => <LogoGrid density={density} title="Operatørøkosystem" caption="Eksempelet bruker live portalkunder der de finnes, med Navio-relevante fallback-operatører." logos={samples.logos} /> },
    { name: "QuoteBlock", render: (density: Density) => <QuoteBlock density={density} quote={samples.spotlight.testimonial_quote ?? "Navio gir oss et skalerbart operativt lag for mobile tjenester gjennom krevende norske sesongtopper."} author={samples.spotlight.testimonial_author ?? "Driftsleder"} role={samples.spotlight.testimonial_role ?? "Hurtigruta Carglass"} company={samples.spotlight.name} /> },
    { name: "ComparisonTable", render: (density: Density) => <ComparisonTable density={density} title="Hvorfor Navio er strukturelt annerledes" columns={samples.columns} rows={samples.rows} /> },
    { name: "Timeline", render: (density: Density) => <Timeline density={density} title="Narrativ bue" items={samples.timeline} /> },
    { name: "ProcessFlow", render: (density: Density) => <ProcessFlow density={density} title="Kundeverdimotor" steps={samples.steps} /> },
    { name: "ProblemSolutionGrid", render: (density: Density) => <ProblemSolutionGrid density={density} title="Fra operatørutfordring til repeterbar programvare" pairs={samples.pairs} /> },
    { name: "AnnotatedChart", render: (density: Density) => <AnnotatedChart density={density} title="Illustrativ ARR-bane" valueLabel="ARR NOK mill." points={samples.chartPoints} annotations={[{ label: "Kommersiell proof med Hurtigruta Carglass", description: "Repeterbar operatørverdi validert før bredere vertikal replikering.", pointLabel: "Q3", align: "right" }, { label: "Emisjonen akselererer replikering", description: "NOK 10–20 mill. finansierer ekspansjon frem mot 30. juni 2026.", pointLabel: "Q5", align: "left" }]} /> },
    { name: "FunnelLayout", render: (density: Density) => <FunnelLayout density={density} title="Operatørpipeline" stages={samples.funnel} /> },
    { name: "CustomerSpotlight", render: (density: Density) => <CustomerSpotlight density={density} customer={samples.spotlight.name} parentBrand="Hurtigruta Carglass" summary="En referansekunde som viser at mobile biltjenester kan orkestreres som en repeterbar programvarestøttet driftsmodell." quote="Navio gir oss et skalerbart operativt lag for mobile tjenester, med planlegging, ruteoptimalisering, feltflyt og kundeoppfølging som fungerer gjennom krevende norske sesongtopper." author={samples.spotlight.testimonial_author ?? "Driftsleder"} logoUrl={samples.spotlight.logo_url} metrics={[{ label: "Aktive byer", value: "8 byer, opp fra 2" }, { label: "Kunder per dag", value: `${samples.spotlight.customers_per_day ?? 42}` }, { label: "Månedlig omsetning", value: `NOK ${Math.round((samples.spotlight.monthly_revenue_nok ?? 1350000) / 100000) / 10} mill.` }]} /> },
    { name: "SectionDivider", render: (density: Density) => <SectionDivider density={density} eyebrow="Seksjon" title="Vertikal replikerbarhet" subtitle="De samme operative primitivene gjelder for mobil bilglass, dekktjeneste og flåtevedlikehold." metric={{ label: "Emisjonsmål", value: "NOK 10–20 mill." }} variant={density === "sparse" ? "gradient" : "minimal"} /> },
    { name: "CitationFooter", render: (density: Density) => <div className="flex h-full flex-col justify-end"><CitationFooter density={density} note="Kilder" sources={["portal_customers", "portal_round_terms", "Navio investorkontekst"]} /></div> },
    { name: "PersonCard", render: (density: Density) => <div className="deck-auto-grid-compact gap-4">{samples.people.map((person) => <PersonCard key={person.name} density={density} person={person} />)}</div> },
    { name: "CategoryCard", render: (density: Density) => <div className="deck-auto-grid gap-4"><CategoryCard density={density} label="Vertikal 01" title="Bilglass" description="Mobile bilglassoperatører trenger booking, ruting, feltutførelse og kundeoppdateringer i ett operativt lag." status="Live proof" metric="Hurtigruta Carglass" /><CategoryCard density={density} label="Vertikal 02" title="Dekktjeneste" description="Sesongtopper gjør rutedensitet og kapasitetsplanlegging særlig verdifullt." status="Replikeringsmål" metric="NOK 10–20 mill. emisjon" /><CategoryCard density={density} label="Vertikal 03" title="Flåtevedlikehold" description="Gjentakende B2B-etterspørsel gir vei til forutsigbar utnyttelse på tvers av byklynger." status="Ekspansjonsmulighet" metric="Operatørpublikum" /></div> },
  ], [samples]);

  const visualSlides = useMemo(() => [
    sampleSlide("cover", "cover", "En fot innenfor hos verdens største merkevarer", { eyebrow: "Navio", background: "gradient" }, "Repeterbar drift for mobile tjenesteoperatører."),
    sampleSlide("logos", "foot-in-door", "Operatører som viser distribusjonsinngangen", { caption: "Norske og nordiske operatører der mobil tjenesteutførelse skaper umiddelbar verdi." }),
    sampleSlide("badges", "badge-taxonomy", "Operatørutfordringer Navio løser", { badges: samples.pairs }),
    sampleSlide("funnel", "pipeline", "Operatørpipeline", { stages: samples.funnel }),
    sampleSlide("adoption", "adopsjon", "Adopsjon per kvartal", { headline: "Adopsjon per kvartal", annotations: [{ label: "Referanse bevist", pointLabel: "Q3" }] }),
    sampleSlide("glide", "arr-bane", "ARR-bane", { headline: "Illustrativ ARR-bane", annotations: [{ label: "Emisjon akselererer", pointLabel: "Q5" }] }),
    sampleSlide("team", "team", "Team", {}),
    sampleSlide("round", "emisjon", "Emisjonsbetingelser", { cta_label: "Meld investeringsinteresse" }),
    sampleSlide("gap", "gap", "Hvor Navio skaper gapet", { leftLabel: "Markedet i dag", rightLabel: "Navio", rows: [{ category: "Drift", leftValue: "Manuell koordinering", rightValue: "Orkestrert flyt" }, { category: "Replikering", leftValue: "Prosjekt for prosjekt", rightValue: "Én operativ motor" }] }),
    sampleSlide("verticals", "vertikaler", "Vertikaler", { items: [{ name: "Bilglass", status: "Live proof", description: "Mobil tjenesteutførelse med høy rutedensitet." }, { name: "Dekk", status: "Neste vertikal", description: "Sesongtopper gir tydelig behov for kapasitetsstyring." }] }),
    sampleSlide("customer-spotlight", "kunde", "Utvalgt kunde", { customer_slug: samples.spotlight.slug }, "Referansekunde med operativ proof."),
    sampleSlide("custom", "custom", "Sammensatt slide", { composition: [{ component: "Hero", props: { eyebrow: "Custom", title: "Sammensatt investorfortelling", subtitle: "Komponenter stables vertikalt fra config.", variant: "minimal" } }, { component: "StatGrid", props: { metrics: samples.metrics.slice(0, 2) } }] }),
  ], [samples]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const results = Array.from(document.querySelectorAll<HTMLElement>("[data-audit-case]")).map((root) => {
        const issues: string[] = [];
        root.querySelectorAll<HTMLElement>("*").forEach((node) => {
          if (["STYLE", "SCRIPT", "NOSCRIPT"].includes(node.tagName) || node.closest("style,script,noscript")) return;
          if (node.getAttribute("data-chart") || node.textContent?.includes("--color-value")) return;
          if (node.scrollWidth > node.clientWidth + 1) issues.push(`horizontal overflow: ${node.textContent?.trim().slice(0, 80) || node.className}`);
          if (node.scrollHeight > node.clientHeight + 1 && getComputedStyle(node).overflowY === "hidden") issues.push(`clipped vertical text: ${node.textContent?.trim().slice(0, 80) || node.className}`);
        });
        return { key: root.dataset.auditCase ?? "unknown", status: issues.length ? "FAIL" : "PASS", issues: [...new Set(issues)].slice(0, 3) } satisfies AuditResult;
      });
      setAuditResults(results);
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [componentRenders]);

  return (
    <PortalCmsLayout title="Deck component preview" description="Quality gate for the investor-grade slide component library before renderer refactor.">
      <div className="space-y-10">
        <Card className="border-border bg-background"><CardHeader><CardTitle>Automated DOM overflow audit</CardTitle><CardDescription>96 checks: 16 components × sparse/dense × 1280/768/375 widths.</CardDescription></CardHeader><CardContent><pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-card-background p-4 text-xs">{auditResults.length ? auditResults.map((result) => `${result.key}: ${result.status}${result.issues.length ? ` — ${result.issues.join("; ")}` : ""}`).join("\n") : "Running audit…"}</pre></CardContent></Card>
        <Card className="border-border bg-background"><CardHeader><CardTitle>Visual type renderer preview</CardTitle><CardDescription>12 renderer previews using realistic Norwegian visual_config samples.</CardDescription></CardHeader><CardContent className="grid gap-6 xl:grid-cols-2">{visualSlides.map((slide) => <div key={slide.slug} className="min-h-[520px] overflow-auto rounded-md border border-border bg-card-background"><SlideRenderer slide={slide} mode="viewer" /></div>)}</CardContent></Card>
        {componentRenders.map((component) => <ComponentPair key={component.name} name={component.name} render={component.render} />)}
        <div className="pointer-events-none absolute left-[-10000px] top-0 w-[1320px] opacity-0" aria-hidden="true">{componentRenders.map((component) => auditWidths.flatMap((width) => (["sparse", "dense"] as Density[]).map((density) => <AuditFrame key={`${component.name}-${density}-${width}`} name={component.name} density={density} width={width}>{component.render(density)}</AuditFrame>)))}</div>
      </div>
    </PortalCmsLayout>
  );
}
