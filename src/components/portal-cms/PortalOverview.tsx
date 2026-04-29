import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { PortalCmsLayout } from "./PortalCmsLayout";
import type { InvestorSummary } from "./types";

export function PortalOverview() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["portal-cms-overview"],
    queryFn: async () => {
      const [slides, publishedSlides, customers, publishedCustomers, financials, team, round, investors, pledges] = await Promise.all([
        supabase.from("portal_slides").select("id", { count: "exact", head: true }),
        supabase.from("portal_slides").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("portal_customers").select("id", { count: "exact", head: true }),
        supabase.from("portal_customers").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("portal_financial_projections").select("id", { count: "exact", head: true }),
        supabase.from("portal_team_members").select("id", { count: "exact", head: true }),
        supabase.from("portal_round_terms").select("is_active").eq("is_active", true).limit(1).maybeSingle(),
        supabase.from("investor_summary_for_cms").select("*") as unknown as Promise<{ data: InvestorSummary[] | null; error: Error | null }>,
        supabase.from("investor_pledges").select("id", { count: "exact", head: true }),
      ]);
      const error = [slides.error, publishedSlides.error, customers.error, publishedCustomers.error, financials.error, team.error, round.error, investors.error, pledges.error].find(Boolean);
      if (error) throw error;
      return {
        slides: slides.count ?? 0,
        publishedSlides: publishedSlides.count ?? 0,
        customers: customers.count ?? 0,
        publishedCustomers: publishedCustomers.count ?? 0,
        financials: financials.count ?? 0,
        team: team.count ?? 0,
        roundActive: !!round.data?.is_active,
        investors: investors.data?.length ?? 0,
        pledges: pledges.count ?? 0,
      };
    },
  });

  const origin = window.location.origin;
  const cards = [
    { title: "Slides", description: "Manage pitch deck slide content and visual configuration.", count: `${data?.publishedSlides ?? 0} of 16 published`, href: "/cms/portal/slides" },
    { title: "Customers", description: "Manage portal customer proof points, logos, and funnel status.", count: `${data?.publishedCustomers ?? 0} of 6 published`, href: "/cms/portal/customers" },
    { title: "Financial projections", description: "Manage ARR projections and actuals shown in the deck.", count: `${data?.financials ?? 0} entries`, href: "/cms/portal/financials" },
    { title: "Team members", description: "Manage the investor-facing team roster.", count: `${data?.team ?? 0} members`, href: "/cms/portal/team" },
    { title: "Round terms", description: "Manage current round size, valuation, close date, and use of funds.", count: data?.roundActive ? "Active" : "Draft", href: "/cms/portal/round" },
    { title: "Investor sessions", description: "Review investor engagement analytics and session details.", count: `${data?.investors ?? 0} sessions`, href: "/cms/investors" },
    { title: "Pledges", description: "Review indications of interest and pledge totals.", count: `${data?.pledges ?? 0} pledges`, href: "/cms/investors/pledges" },
  ];

  const copyInvestorLink = async () => {
    await navigator.clipboard.writeText(`${origin}/investor\nAccess code: NavioFunding2026`);
    toast({ title: "Investor link copied", description: "Includes access code helper text." });
  };

  return (
    <PortalCmsLayout title="Investor Portal" description="Manage investor portal content, round context, and read-only investor analytics.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} to={card.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle>{card.title}</CardTitle>
                  <Badge variant="outline">{isLoading ? "…" : card.count}</Badge>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter className="text-sm font-medium text-primary">Manage <ArrowRight className="ml-1 h-4 w-4" /></CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Open or share the investor experience.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => window.open("/investor", "_blank", "noopener,noreferrer")}><ExternalLink className="h-4 w-4" /> View live portal as investor</Button>
          <Button type="button" variant="outline" onClick={copyInvestorLink}><Copy className="h-4 w-4" /> Copy investor link</Button>
          {import.meta.env.DEV ? <Button type="button" variant="outline" onClick={() => window.open("/portal?dev_session=test", "_blank", "noopener,noreferrer")}><ExternalLink className="h-4 w-4" /> View portal as automation</Button> : null}
          <p className="w-full text-sm text-muted-foreground">Access code: NavioFunding2026</p>
        </CardContent>
      </Card>
    </PortalCmsLayout>
  );
}
