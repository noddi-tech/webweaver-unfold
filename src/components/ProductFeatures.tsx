import { Calendar, Package, RefreshCw, TrendingUp, Zap, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Calendar,
    title: "Booking & Scheduling",
    bullets: [
      "Multi-channel booking",
      "Real-time availability",
      "Garage + mobile support"
    ],
    link: "#booking"
  },
  {
    icon: Package,
    title: "Tire Sales & Inventory Integration",
    bullets: [
      "Automated tire tracking",
      "Integrated quoting",
      "Real-time inventory sync"
    ],
    link: "#tire-sales"
  },
  {
    icon: RefreshCw,
    title: "Auto Recall & Re-engagement",
    bullets: [
      "Smart cohort filtering",
      "Data-driven campaigns",
      "77.9% acceptance rate"
    ],
    link: "#auto-recall"
  },
  {
    icon: TrendingUp,
    title: "Capacity / Lane Optimization",
    bullets: [
      "Resource optimization",
      "Utilization tracking",
      "Route planning"
    ],
    link: "#capacity"
  },
  {
    icon: Zap,
    title: "Real-time Sync & Data Flow",
    bullets: [
      "No sync delays",
      "Single source of truth",
      "Seamless integration"
    ],
    link: "#sync"
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    bullets: [
      "Comprehensive dashboards",
      "Performance metrics",
      "Business intelligence"
    ],
    link: "#analytics"
  }
];

export default function ProductFeatures() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Product Capabilities
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to run your automotive service business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover-scale hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <ul className="space-y-2 mb-4">
                    {feature.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="group" asChild>
                    <a href={feature.link}>
                      See more
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
