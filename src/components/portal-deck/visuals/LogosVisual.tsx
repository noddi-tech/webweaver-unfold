import { useQuery } from "@tanstack/react-query";
import { LogoGrid } from "../components";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownBody, PreparedPlaceholder } from "../SlideRenderer";
import type { LogosConfig, PortalCustomerRow, SlideVisualProps } from "../types";

export function LogosVisual({ slide, config }: SlideVisualProps<LogosConfig>) {
  const { data: customers = [] } = useQuery({
    queryKey: ["portal-customers-logos", config?.customer_slugs?.join("|")],
    queryFn: async () => {
      let query = supabase
        .from("portal_customers")
        .select("id,slug,name,parent_brand,logo_url,status,funnel_stage,cities_live,customers_per_day,monthly_revenue_nok,testimonial_quote,testimonial_author,testimonial_role,display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      if (config?.customer_slugs?.length) query = query.in("slug", config.customer_slugs);
      const { data, error } = await query;
      if (error) throw error;
      return data as PortalCustomerRow[];
    },
  });

  const logos = customers.map((customer) => ({ name: customer.name, logoUrl: customer.logo_url, label: customer.parent_brand ?? undefined, status: customer.status ?? customer.funnel_stage ?? undefined }));

  return (
    <section className="h-full overflow-hidden p-6 sm:p-10">
      {logos.length ? <LogoGrid title={config?.headline ?? slide.title ?? undefined} caption={config?.caption} logos={logos} /> : <PreparedPlaceholder />}
      <MarkdownBody body={slide.body_md} />
    </section>
  );
}
