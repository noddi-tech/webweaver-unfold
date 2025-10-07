import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Award, Target } from "lucide-react";
import { Counter } from "@/components/ui/counter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const metrics = [
  {
    icon: Award,
    value: 90,
    suffix: "",
    prefix: "~",
    label: "NPS Score",
    context: "Industry-leading customer satisfaction"
  },
  {
    icon: TrendingUp,
    value: 20000,
    suffix: "+",
    prefix: "",
    label: "Bookings Completed",
    context: "Proven at scale"
  },
  {
    icon: Users,
    value: 50,
    suffix: "+",
    prefix: "",
    label: "Active Locations",
    context: "Across Scandinavia"
  },
  {
    icon: Target,
    value: 95,
    suffix: "%",
    prefix: "",
    label: "Automation Rate",
    context: "Manual tasks eliminated"
  }
];

export default function ProofMetricsHomepage() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref as any} className="py-20 md:py-28">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Built for production. Proven in practice.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Numbers that matter—from real operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={index}
                className={`hover-scale transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                    <Counter 
                      end={metric.value} 
                      suffix={metric.suffix}
                      prefix={metric.prefix}
                    />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-2">
                    {metric.label}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.context}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/partners">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group">
              See Customer Stories
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
