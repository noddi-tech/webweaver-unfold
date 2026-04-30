import { useQuery } from "@tanstack/react-query";
import { CustomerSpotlight, type MetricItem } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import { deckText } from "../i18n";
import type { CustomerSpotlightConfig, PortalCustomerRow, SlideVisualProps } from "../types";

const formatNok = (value: number | null) => value == null ? "—" : new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);

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

  const metrics: MetricItem[] = config?.metrics?.length ? config.metrics : [
    { label: deckText.citiesLive, value: customer?.cities_live == null ? "—" : `${customer.cities_live}` },
    { label: deckText.customersPerDay, value: customer?.customers_per_day == null ? "—" : `${customer.customers_per_day}` },
    { label: deckText.monthlyRevenue, value: formatNok(customer?.monthly_revenue_nok ?? null) },
  ];

  return (
    <section className="h-full overflow-hidden p-6 sm:p-10">
      {customer ? (
        <CustomerSpotlight
          customer={customer.name}
          parentBrand={customer.parent_brand ?? undefined}
          summary={slide.subtitle ?? customer.status ?? deckText.lighthouseCustomer}
          quote={customer.testimonial_quote ?? undefined}
          author={customer.testimonial_author ?? undefined}
          logoUrl={customer.logo_url}
          metrics={metrics}
        />
      ) : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
