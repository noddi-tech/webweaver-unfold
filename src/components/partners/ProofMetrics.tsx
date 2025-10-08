import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Handshake, BarChart, Globe, Euro } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";

const metrics = [
  {
    icon: TrendingUp,
    headline: "~90 NPS.",
    context: "Three times the industry average.",
    comparison: "vs. 20-30 industry standard",
  },
  {
    icon: Users,
    headline: "20,000+ bookings.",
    context: "Zero sync issues.",
    comparison: "And growing",
  },
  {
    icon: Handshake,
    headline: "4 SaaS partners.",
    context: "1 shared platform.",
    comparison: "Active paying customers",
  },
  {
    icon: BarChart,
    headline: ">49% market growth YoY.",
    context: "In convenience services.",
    comparison: "Convenience services sector",
  },
  {
    icon: Globe,
    headline: "€65B addressable market.",
    context: "Global automotive services.",
    comparison: "Ready to scale",
  },
  {
    icon: Euro,
    headline: "Performance-based model.",
    context: "We grow when you grow.",
    comparison: "Pure SaaS pricing",
  },
];

export default function ProofMetrics() {
  const { h2, body } = useTypography();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            Real Numbers. Real Results.
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            Noddi powers operations across Europe with proven performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="glass-card text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    {metric.headline}
                  </h3>
                  <p className="text-base font-medium text-foreground mb-2">
                    {metric.context}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {metric.comparison}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
