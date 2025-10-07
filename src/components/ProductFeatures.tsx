import { Calendar, Package, RefreshCw, TrendingUp, Zap, BarChart3, GitBranch, Building2, ArrowRight, ScanLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Calendar,
    title: "Modern Booking Experience",
    bullets: [
      "One-minute funnel: address → car → services → timeslot → confirm",
      "Available on mobile and desktop",
      "Multi-channel booking support"
    ],
    link: "#booking"
  },
  {
    icon: Package,
    title: "Tire Sales & Inventory Integration",
    bullets: [
      "Automated tire tracking with storage logistics",
      "Laser scanner sensor data integration",
      "Auto-generated quotes based on inventory & margins"
    ],
    link: "#tire-sales"
  },
  {
    icon: RefreshCw,
    title: "Auto Recall & Re-engagement",
    bullets: [
      "Cohort-based recall campaigns",
      "Triggered by capacity and utilization data",
      "77.9% acceptance rate"
    ],
    link: "#auto-recall"
  },
  {
    icon: TrendingUp,
    title: "Capacity / Lane Optimization",
    bullets: [
      "Admins set service areas and worker competencies",
      "Dynamically allocates resources to maximize utilization",
      "Avoid overbooking with smart route planning"
    ],
    link: "#capacity"
  },
  {
    icon: Zap,
    title: "Real-time Sync & Data Flow",
    bullets: [
      "No sync delays or API issues",
      "Single source of truth across frontend & backend",
      "Seamless integration from booking to lane"
    ],
    link: "#sync"
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    bullets: [
      "Comprehensive dashboards",
      "Performance metrics and KPIs",
      "Business intelligence for decision-making"
    ],
    link: "#analytics"
  },
  {
    icon: GitBranch,
    title: "Workflow Automation",
    bullets: [
      "Backend event-condition-action engine",
      "Automates service completion, storage & inventory",
      "Recall triggers without manual intervention"
    ],
    link: "#workflow"
  },
  {
    icon: Building2,
    title: "B2B Portal & Fleet Management",
    bullets: [
      "Tailored portals for fleet customers",
      "Manage multiple vehicles and bookings",
      "API support for third-party fleet systems"
    ],
    link: "#fleet"
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
