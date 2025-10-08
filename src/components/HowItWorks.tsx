import React from "react";
import { Calendar, Zap, Smartphone, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    icon: Calendar,
    title: "Customer books service",
    description: "Online booking or in-garage entry",
    details: "Mobile + desktop support with one-minute funnel"
  },
  {
    icon: Zap,
    title: "Platform auto-plans routes & capacity",
    description: "Proprietary optimization algorithms",
    details: "Real-time resource allocation and workforce dispatch"
  },
  {
    icon: Smartphone,
    title: "Technicians execute with Noddi Worker app",
    description: "Native app for mobile + garage workflows",
    details: "Standardized inspection capture and tire sales"
  },
  {
    icon: RefreshCw,
    title: "System captures data → triggers actions",
    description: "Auto-recall campaigns, tire sales, inventory updates",
    details: "No manual follow-up needed—fully automated"
  }
];

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref as any} className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            How Noddi Powers Your Operations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From customer booking to back-office automation—all in one unified platform
          </p>
        </div>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-4 mb-12 items-stretch">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={index}>
                <div 
                  className={`h-full transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                <Card className="hover-scale h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div className="text-sm font-bold text-primary mb-2">Step {index + 1}</div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <p className="text-xs text-muted-foreground">{step.details}</p>
                  </CardContent>
                </Card>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: Vertical Flow */}
        <div className="lg:hidden space-y-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className={`relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className="hover-scale h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-primary mb-2">Step {index + 1}</div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <p className="text-xs text-muted-foreground">{step.details}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-8 bg-gradient-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Caption */}
        <div className="text-center">
          <div className="inline-block px-8 py-4 bg-primary/10 border-2 border-primary/20 rounded-xl">
            <p className="text-base md:text-lg font-semibold text-primary mb-1">
              It's not automation. It's orchestration.
            </p>
            <p className="text-sm text-primary/80 font-medium">
              One platform. Every function. Zero friction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
