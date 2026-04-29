import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FunnelLayout, type FunnelStage } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { FunnelConfig, PortalCustomerRow, SlideVisualProps } from "../types";

const stageLabel: Record<string, string> = {
  discovery: "Kartlegging",
  qualified: "Kvalifisert",
  "pre-pilot": "Før pilot",
  pilot: "Pilot",
  signed: "Signert",
  expanding: "Ekspansjon",
  Scale: "Skalering",
  Pilot: "Pilot",
  Qualified: "Kvalifisert",
};

export function FunnelVisual({ slide, config }: SlideVisualProps<FunnelConfig>) {
  const { data: customers = [] } = useQuery({
    queryKey: ["portal-customers-funnel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_customers")
        .select("id,slug,name,parent_brand,logo_url,status,funnel_stage,cities_live,customers_per_day,monthly_revenue_nok,testimonial_quote,testimonial_author,testimonial_role,display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as PortalCustomerRow[];
    },
  });

  const stages = useMemo<FunnelStage[]>(() => {
    if (config?.stages?.length) return config.stages;
    const grouped = new Map<string, PortalCustomerRow[]>();
    customers.forEach((customer) => {
      const key = customer.funnel_stage || deckText.stage;
      grouped.set(key, [...(grouped.get(key) ?? []), customer]);
    });
    const max = Math.max(...Array.from(grouped.values()).map((items) => items.length), 1);
    return Array.from(grouped.entries()).map(([stage, items]) => ({
      label: stageLabel[stage] ?? stage,
      value: `${items.length} ${deckText.customers}`,
      context: items.slice(0, 3).map((customer) => customer.name).join(" · ") || deckText.noData,
      widthPct: Math.max(28, (items.length / max) * 100),
    }));
  }, [config?.stages, customers]);

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      {stages.length ? <FunnelLayout title={slide.title ?? deckText.operatorPipeline} stages={stages} /> : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
