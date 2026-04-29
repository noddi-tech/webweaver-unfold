import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder, SlideHeader } from "../SlideRenderer";
import type { CustomerSpotlightConfig, PortalCustomerRow, SlideVisualProps } from "../types";

const formatNok = (value: number | null) => value == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);

export function CustomerSpotlightVisual({ slide, config }: SlideVisualProps<CustomerSpotlightConfig>) {
  const { data: customer } = useQuery({
    queryKey: ["portal-customer-spotlight", config?.customer_slug],
    enabled: Boolean(config?.customer_slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_customers")
        .select("id,slug,name,parent_brand,logo_url,status,funnel_stage,cities_live,customers_per_day,monthly_revenue_nok,testimonial_quote,testimonial_author,testimonial_role,display_order")
        .eq("is_published", true)
        .eq("slug", config?.customer_slug || "")
        .maybeSingle();
      if (error) throw error;
      return data as PortalCustomerRow | null;
    },
  });

  return (
    <section className="h-full overflow-y-auto p-6 sm:p-10">
      <SlideHeader slide={slide} />
      {customer ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div className="rounded-xl bg-card-surface p-8">
            {customer.logo_url ? <img src={customer.logo_url} alt={`${customer.name} logo`} className="mb-6 max-h-32 max-w-full object-contain" loading="lazy" /> : <h3 className="mb-6 text-3xl font-bold text-foreground">{customer.name}</h3>}
            {customer.status ? <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">{customer.status}</span> : null}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div><p className="text-xs text-muted-foreground">Cities live</p><p className="text-2xl font-bold text-foreground">{customer.cities_live ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Customers/day</p><p className="text-2xl font-bold text-foreground">{customer.customers_per_day ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Monthly revenue</p><p className="text-xl font-bold text-foreground">{formatNok(customer.monthly_revenue_nok)}</p></div>
            </div>
          </div>
          <blockquote className="rounded-xl border-l-4 border-primary bg-background p-6">
            <p className="text-2xl italic leading-relaxed text-foreground">{customer.testimonial_quote || "Customer proof is being prepared."}</p>
            {customer.testimonial_author ? <footer className="mt-5 text-sm text-muted-foreground">{customer.testimonial_author}{customer.testimonial_role ? ` · ${customer.testimonial_role}` : ""}</footer> : null}
          </blockquote>
        </div>
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
