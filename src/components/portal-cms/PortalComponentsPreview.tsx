import type React from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PortalCmsLayout } from "./PortalCmsLayout";
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

const fallbackCustomers: CustomerRow[] = [
  { id: "hurtigruta", slug: "hurtigruta-carglass", name: "Hurtigruta Carglass", parent_brand: "Hurtigruta", logo_url: null, status: "Live expansion", funnel_stage: "Scale", cities_live: 8, total_addressable_cities: 28, customers_per_day: 42, monthly_revenue_nok: 1350000, pilot_started_at: null, contract_signed_at: null, case_study_md: null, testimonial_quote: "Navio gives us a scalable mobile service layer without rebuilding dispatch from scratch.", testimonial_author: "Operations lead", testimonial_role: "Hurtigruta Carglass", display_order: 1, is_published: true },
  { id: "dekkpartner", slug: "dekkpartner", name: "Dekkpartner", parent_brand: "Tire service network", logo_url: null, status: "Pilot", funnel_stage: "Pilot", cities_live: 3, total_addressable_cities: 18, customers_per_day: 18, monthly_revenue_nok: 420000, pilot_started_at: null, contract_signed_at: null, case_study_md: null, testimonial_quote: null, testimonial_author: null, testimonial_role: null, display_order: 2, is_published: true },
  { id: "fleetcare", slug: "fleetcare", name: "FleetCare Norge", parent_brand: "Fleet operator", logo_url: null, status: "Qualified", funnel_stage: "Qualified", cities_live: 0, total_addressable_cities: 12, customers_per_day: null, monthly_revenue_nok: null, pilot_started_at: null, contract_signed_at: null, case_study_md: null, testimonial_quote: null, testimonial_author: null, testimonial_role: null, display_order: 3, is_published: true },
];

const fallbackRound: RoundRow = { id: "round", round_label: "NOK 10–20M seed extension", round_size_min_nok: 10000000, round_size_max_nok: 20000000, valuation_min_nok: null, valuation_max_nok: null, total_raised_to_date_nok: 22000000, target_close_date: "2026-06-30", use_of_funds: [{ label: "Commercial expansion", pct: 45 }, { label: "Product automation", pct: 35 }, { label: "Operations", pct: 20 }], is_active: true, updated_at: new Date().toISOString() };

function PreviewFrame({ name, density, children }: { name: string; density: Density; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-border bg-background">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="outline">{density}</Badge>
        </div>
        <CardDescription>Investor deck component preview using Navio-specific sample content.</CardDescription>
      </CardHeader>
      <CardContent className="bg-background p-6">
        <div className="min-h-[620px] overflow-auto rounded-md border border-border bg-background p-8">{children}</div>
      </CardContent>
    </Card>
  );
}

function ComponentPair({ name, render }: { name: string; render: (density: Density) => React.ReactNode }) {
  return <section className="grid gap-6 xl:grid-cols-2"><PreviewFrame name={name} density="sparse">{render("sparse")}</PreviewFrame><PreviewFrame name={name} density="dense">{render("dense")}</PreviewFrame></section>;
}

export function PortalComponentsPreview() {
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
    const roundLabel = round.round_size_min_nok && round.round_size_max_nok ? `NOK ${round.round_size_min_nok / 1_000_000}–${round.round_size_max_nok / 1_000_000}M` : "NOK 10–20M";
    const metrics: MetricItem[] = [
      { label: "Round target", value: roundLabel, context: "Seed extension to scale mobile car and tire service operators", accent: "purple" },
      { label: "Raised to date", value: `NOK ${Math.round((round.total_raised_to_date_nok ?? 22000000) / 1_000_000)}M`, context: "Prior capital converted into live operating proof", accent: "green" },
      { label: "Spotlight customer", value: spotlight.name, context: spotlight.parent_brand ?? "Mobile service operator", accent: "orange" },
      { label: "Expansion deadline", value: "30 June 2026", context: "Target close date for seed extension execution", accent: "teal" },
    ];
    const logos: LogoItem[] = customers.map((customer) => ({ name: customer.name, logoUrl: customer.logo_url, label: customer.parent_brand ?? "Service operator", status: customer.status ?? customer.funnel_stage ?? "Active" }));
    const pairs: TextPair[] = [
      { label: "Operator pain", title: "Demand is local, capacity is fragmented", description: "Mobile car and tire services need dense routing, seasonal capacity planning, and customer-grade booking in one workflow.", metric: "Built for city-by-city replication" },
      { label: "Navio response", title: "A vertical operating system for mobile service", description: "Navio combines booking, dispatch, service execution, and partner orchestration into a repeatable operating layer.", metric: "One playbook across operators" },
      { label: "Investor implication", title: "Replication beats bespoke implementation", description: "The same engine can support Carglass-style glass service, tire change networks, and fleet maintenance operators.", metric: "Higher density, lower launch friction" },
    ];
    const timeline: TimelineItem[] = [
      { date: "2024", title: "Foot-in-door", description: "Launch with trusted mobile service operators and prove operational quality.", metric: "First live cities" },
      { date: "2025", title: "Customer value engine", description: "Convert pilots into repeatable revenue and richer route density.", metric: "Hurtigruta Carglass spotlight" },
      { date: "2026", title: "Vertical replication", description: "Expand from glass into tire and fleet maintenance operators.", metric: roundLabel },
      { date: "Next", title: "Category platform", description: "Become the orchestration layer for mobile automotive service in the Nordics.", metric: "Multi-vertical" },
    ];
    const steps: ProcessStep[] = [
      { title: "Capture", description: "Customer request enters a branded booking flow with service, vehicle, and location data.", metric: "Higher conversion" },
      { title: "Plan", description: "Navio matches demand to technicians, routes, seasons, and SLA windows.", metric: "Less dispatch drag" },
      { title: "Execute", description: "Technicians run the job on mobile workflows with customer updates.", metric: "Field-ready" },
      { title: "Learn", description: "Every job improves density, operator planning, and expansion economics.", metric: "Compounding data" },
    ];
    const chartPoints: ChartPoint[] = [
      { label: "Q1", value: 1.2 }, { label: "Q2", value: 2.4 }, { label: "Q3", value: 4.1 }, { label: "Q4", value: 7.5 }, { label: "Q5", value: 12.8 }, { label: "Q6", value: 20.0 },
    ];
    const funnel: FunnelStage[] = [
      { label: "Qualified mobile service operators across glass, tire, and fleet", value: "18", context: "Car glass, tire, fleet service", widthPct: 100 },
      { label: "Pilot / commercial design with city-specific launch planning", value: "7", context: "Route density and SLA modeling", widthPct: 72 },
      { label: "Live or expansion-ready operators", value: "3", context: "Operational proof in market", widthPct: 48 },
      { label: "Scale candidate", value: "Hurtigruta Carglass", context: "Lighthouse customer", widthPct: 28 },
    ];
    const columns: ComparisonColumn[] = [{ key: "generic", label: "Generic booking" }, { key: "agency", label: "Custom agency build" }, { key: "navio", label: "Navio" }];
    const rows: ComparisonRow[] = [
      { label: "Mobile operations", values: { generic: "Appointment capture only", agency: "Expensive bespoke workflows", navio: "Native route, crew, and job orchestration" }, emphasisKey: "navio" },
      { label: "Vertical replication", values: { generic: "Low", agency: "Slow", navio: "Reusable across car glass, tire, and fleet service" }, emphasisKey: "navio" },
      { label: "Operator economics", values: { generic: "No operating leverage", agency: "Services-heavy", navio: "Density improves with every city" }, emphasisKey: "navio" },
    ];
    const people: Person[] = [
      { name: "Joachim Navio", role: "Founder / CEO", bio: "Builds the commercial and operator playbook for mobile automotive service categories.", metric: "Operator-first execution" },
      { name: "Navio Product Lead", role: "Product", bio: "Turns field workflows into repeatable software primitives for booking, planning, and execution.", metric: "Vertical OS architecture" },
    ];
    return { spotlight, metrics, logos, pairs, timeline, steps, chartPoints, funnel, columns, rows, people };
  }, [data]);

  return (
    <PortalCmsLayout title="Deck component preview" description="Quality gate for the investor-grade slide component library before renderer refactor.">
      <div className="space-y-10">
        <ComponentPair name="Hero" render={(density) => <Hero density={density} variant={density === "sparse" ? "gradient" : "minimal"} eyebrow="Navio investor deck" title="The operating system for mobile car service" subtitle="Navio helps car glass, tire, and fleet service operators turn fragmented mobile demand into repeatable, city-by-city operating leverage." metrics={samples.metrics} kicker="NOK 10–20M seed extension" />} />
        <ComponentPair name="StatCallout" render={(density) => <StatCallout density={density} label="Round" value="NOK 10–20M" context="Capital to scale the customer value engine already proven with Hurtigruta Carglass." supporting="Funds go toward commercial expansion, product automation, and operator onboarding capacity." />} />
        <ComponentPair name="StatGrid" render={(density) => <StatGrid density={density} title="Proof points investors should retain" subtitle="Dense enough for IC discussion, restrained enough for the deck narrative." metrics={[...samples.metrics, { label: "Live city expansion", value: "8 cities, up from 2", context: "Current footprint for the spotlight customer" }]} />} />
        <ComponentPair name="LogoGrid" render={(density) => <LogoGrid density={density} title="Operator ecosystem" caption="Sample uses live portal customers where available, with Navio-relevant fallback operators." logos={samples.logos} />} />
        <ComponentPair name="QuoteBlock" render={(density) => <QuoteBlock density={density} quote={samples.spotlight.testimonial_quote ?? "Navio gives us a scalable mobile service layer without rebuilding dispatch from scratch."} author={samples.spotlight.testimonial_author ?? "Operations lead"} role={samples.spotlight.testimonial_role ?? "Hurtigruta Carglass"} company={samples.spotlight.name} />} />
        <ComponentPair name="ComparisonTable" render={(density) => <ComparisonTable density={density} title="Why Navio is structurally different" columns={samples.columns} rows={samples.rows} />} />
        <ComponentPair name="Timeline" render={(density) => <Timeline density={density} title="Narrative arc" items={samples.timeline} />} />
        <ComponentPair name="ProcessFlow" render={(density) => <ProcessFlow density={density} title="Customer value engine" steps={samples.steps} />} />
        <ComponentPair name="ProblemSolutionGrid" render={(density) => <ProblemSolutionGrid density={density} title="From operator pain to repeatable software" pairs={samples.pairs} />} />
        <ComponentPair name="AnnotatedChart" render={(density) => <AnnotatedChart density={density} title="Illustrative ARR glide path" valueLabel="ARR NOK M" points={samples.chartPoints} annotations={[{ label: "Commercial proof with Hurtigruta Carglass", description: "Repeatable operator value validated before broader vertical replication.", pointLabel: "Q3", align: "right" }, { label: "Round accelerates replication", description: "NOK 10–20M funds expansion by 30 June 2026.", pointLabel: "Q5", align: "left" }]} />} />
        <ComponentPair name="FunnelLayout" render={(density) => <FunnelLayout density={density} title="Operator pipeline" stages={samples.funnel} />} />
        <ComponentPair name="CustomerSpotlight" render={(density) => <CustomerSpotlight density={density} customer={samples.spotlight.name} parentBrand={samples.spotlight.parent_brand ?? undefined} summary="A lighthouse customer showing that mobile automotive service can be orchestrated as a repeatable software-enabled operating model." quote={samples.spotlight.testimonial_quote ?? undefined} author={samples.spotlight.testimonial_author ?? undefined} logoUrl={samples.spotlight.logo_url} metrics={[{ label: "Cities live", value: "8 cities, up from 2" }, { label: "Customers/day", value: `${samples.spotlight.customers_per_day ?? 42}` }, { label: "Monthly revenue", value: `NOK ${Math.round((samples.spotlight.monthly_revenue_nok ?? 1350000) / 100000) / 10}M` }]} />} />
        <ComponentPair name="SectionDivider" render={(density) => <SectionDivider density={density} eyebrow="Section" title="Vertical replicability" subtitle="The same operational primitives apply across mobile car glass, tire service, and fleet maintenance." metric={{ label: "Target round", value: "NOK 10–20M" }} variant={density === "sparse" ? "gradient" : "minimal"} />} />
        <ComponentPair name="CitationFooter" render={(density) => <div className="flex h-full flex-col justify-end"><CitationFooter density={density} note="Preview sources" sources={["portal_customers", "portal_round_terms", "Navio investor context"]} /></div>} />
        <ComponentPair name="PersonCard" render={(density) => <div className="deck-auto-grid-compact gap-4">{samples.people.map((person) => <PersonCard key={person.name} density={density} person={person} />)}</div>} />
        <ComponentPair name="CategoryCard" render={(density) => <div className="deck-auto-grid gap-4"><CategoryCard density={density} label="Vertical 01" title="Car glass" description="Mobile glass replacement operators need booking, routing, field execution, and customer updates in one operating layer." status="Live proof" metric="Hurtigruta Carglass" /><CategoryCard density={density} label="Vertical 02" title="Tire service" description="Seasonal demand spikes make routing density and capacity planning especially valuable." status="Replication target" metric="NOK 10–20M round" /><CategoryCard density={density} label="Vertical 03" title="Fleet maintenance" description="Recurring B2B demand creates a path to predictable utilization across city clusters." status="Expansion option" metric="Operator audience" /></div>} />
      </div>
    </PortalCmsLayout>
  );
}
