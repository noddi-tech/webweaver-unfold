import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { LogosConfig, PortalCustomerRow, SlideVisualProps } from "../types";

export function LogosVisual({ slide, config }: SlideVisualProps<LogosConfig>) {
  const { data: customers = [] } = useQuery({
    queryKey: ["portal-customers-logos"],
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
      {customers.length ? (
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex min-h-24 items-center justify-center rounded-xl bg-card-surface p-5">
              {customer.logo_url ? <img src={customer.logo_url} alt={`${customer.name} logo`} className="max-h-16 max-w-full object-contain" loading="lazy" /> : <span className="text-center text-lg font-semibold text-foreground">{customer.name}</span>}
            </div>
          ))}
        </div>
      ) : <PreparedPlaceholder />}
      {config?.caption ? <p className="mt-5 text-center text-sm text-muted-foreground">{config.caption}</p> : null}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
