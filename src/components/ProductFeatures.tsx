import { Calendar, Package, RefreshCw, TrendingUp, Zap, BarChart3, GitBranch, Building2, ArrowRight, ScanLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function ProductFeatures() {
  const { t } = useAppTranslation();

  const features = [
    {
      icon: Calendar,
      title: t('product_features.booking.title', "Modern Booking Experience"),
      bullets: [
        t('product_features.booking.bullet_1', "One-minute funnel: address → car → services → timeslot → confirm"),
        t('product_features.booking.bullet_2', "Available on mobile and desktop"),
        t('product_features.booking.bullet_3', "Multi-channel booking support")
      ],
      link: "#booking"
    },
    {
      icon: Package,
      title: t('product_features.tire_sales.title', "Tire Sales & Inventory Integration"),
      bullets: [
        t('product_features.tire_sales.bullet_1', "Automated tire tracking with storage logistics"),
        t('product_features.tire_sales.bullet_2', "Laser scanner sensor data integration"),
        t('product_features.tire_sales.bullet_3', "Auto-generated quotes based on inventory & margins")
      ],
      link: "#tire-sales"
    },
    {
      icon: RefreshCw,
      title: t('product_features.auto_recall.title', "Auto Recall & Re-engagement"),
      bullets: [
        t('product_features.auto_recall.bullet_1', "Cohort-based recall campaigns"),
        t('product_features.auto_recall.bullet_2', "Triggered by capacity and utilization data"),
        t('product_features.auto_recall.bullet_3', "77.9% acceptance rate")
      ],
      link: "#auto-recall"
    },
    {
      icon: TrendingUp,
      title: t('product_features.capacity.title', "Capacity / Lane Optimization"),
      bullets: [
        t('product_features.capacity.bullet_1', "Admins set service areas and worker competencies"),
        t('product_features.capacity.bullet_2', "Dynamically allocates resources to maximize utilization"),
        t('product_features.capacity.bullet_3', "Avoid overbooking with smart route planning")
      ],
      link: "#capacity"
    },
    {
      icon: Zap,
      title: t('product_features.sync.title', "Real-time Sync & Data Flow"),
      bullets: [
        t('product_features.sync.bullet_1', "No sync delays or API issues"),
        t('product_features.sync.bullet_2', "Single source of truth across frontend & backend"),
        t('product_features.sync.bullet_3', "Seamless integration from booking to lane")
      ],
      link: "#sync"
    },
    {
      icon: BarChart3,
      title: t('product_features.reporting.title', "Reporting & Analytics"),
      bullets: [
        t('product_features.reporting.bullet_1', "Comprehensive dashboards"),
        t('product_features.reporting.bullet_2', "Performance metrics and KPIs"),
        t('product_features.reporting.bullet_3', "Business intelligence for decision-making")
      ],
      link: "#analytics"
    },
    {
      icon: GitBranch,
      title: t('product_features.workflow.title', "Workflow Automation"),
      bullets: [
        t('product_features.workflow.bullet_1', "Backend event-condition-action engine"),
        t('product_features.workflow.bullet_2', "Automates service completion, storage & inventory"),
        t('product_features.workflow.bullet_3', "Recall triggers without manual intervention")
      ],
      link: "#workflow"
    },
    {
      icon: Building2,
      title: t('product_features.fleet.title', "B2B Portal & Fleet Management"),
      bullets: [
        t('product_features.fleet.bullet_1', "Tailored portals for fleet customers"),
        t('product_features.fleet.bullet_2', "Manage multiple vehicles and bookings"),
        t('product_features.fleet.bullet_3', "API support for third-party fleet systems")
      ],
      link: "#fleet"
    }
  ];

  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            {t('product_features.title', 'Product Capabilities')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('product_features.subtitle', 'Everything you need to run your automotive service business')}
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
                      {t('product_features.see_more', 'See more')}
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
