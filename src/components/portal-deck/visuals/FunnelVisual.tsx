import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, SlideHeader } from "../SlideRenderer";
import type { PortalCustomerRow, SlideVisualProps, VisualConfig } from "../types";

const stages = ["discovery", "qualified", "pre-pilot", "pilot", "signed", "expanding"];

export function FunnelVisual({ slide }: SlideVisualProps<VisualConfig>) {
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

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[repeat(6,minmax(0,1fr))]">
        {stages.map((stage, index) => {
          const stageCustomers = customers.filter((customer) => customer.funnel_stage === stage);
          return (
            <div key={stage} className="relative rounded-xl border border-border bg-background/70 p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stage}</p>
              <div className="space-y-2">
                {stageCustomers.length ? stageCustomers.map((customer) => (
                  <article key={customer.id} className="rounded-lg bg-card-surface p-3">
                    <div className="flex items-center gap-2">
                      {customer.logo_url ? <img src={customer.logo_url} alt={`${customer.name} logo`} className="h-8 w-8 object-contain" loading="lazy" /> : null}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                        {customer.parent_brand ? <p className="text-xs text-muted-foreground">{customer.parent_brand}</p> : null}
                      </div>
                    </div>
                  </article>
                )) : <p className="py-8 text-center text-muted-foreground">—</p>}
              </div>
              {index < stages.length - 1 ? <ChevronRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground opacity-30 lg:block" /> : null}
            </div>
          );
        })}
      </div>
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
