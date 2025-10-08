import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Package, Bell, Map, Workflow, PieChart, Building2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTypography } from "@/hooks/useTypography";

const functions = [
  {
    icon: Calendar,
    title: "Booking Flow",
    headline: "One minute from address to confirmed slot.",
    description: "No fluff — just speed and clarity.",
    features: [
      "Smart time-slot planning",
      "Automatic reminders",
      "Multichannel (web, mobile, in-garage)",
    ],
  },
  {
    icon: Package,
    title: "Tire Sales & Inventory",
    headline: "Knows your stock, margin, and timing — and sells accordingly.",
    description: "Connected from warehouse to wheel.",
    features: [
      "Real-time inventory sync",
      "Margin-aware recommendations",
      "Laser scanner integration",
    ],
  },
  {
    icon: Bell,
    title: "Auto Recall Engine",
    headline: "Reminds like a human, responds like software.",
    description: "77.9% acceptance rate. Automation that feels personal.",
    features: [
      "AI-powered timing",
      "SMS + email automation",
      "Seasonal campaign logic",
    ],
  },
  {
    icon: Map,
    title: "Capacity & Route Optimization",
    headline: "Always on time, always utilized.",
    description: "AI plans daily schedules based on location, staff, and load.",
    features: [
      "Route optimization",
      "Lane balancing for garages",
      "Real-time rescheduling",
    ],
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    headline: "Rules you set once, results you see always.",
    description: "No sync meetings required.",
    features: [
      "Automated storage handling",
      "Service completion triggers",
      "Overage and follow-up logic",
    ],
  },
  {
    icon: PieChart,
    title: "Reporting & Insights",
    headline: "Data that's actually useful.",
    description: "Clear dashboards for revenue, capacity, and performance.",
    features: [
      "Real-time dashboards",
      "Drill-down by service",
      "Export & API-ready",
    ],
  },
  {
    icon: Building2,
    title: "B2B & Fleet Portal",
    headline: "For partners that manage fleets.",
    description: "Centralized fleet bookings, reports, and permissions.",
    features: [
      "Multi-vehicle management",
      "API integrations",
      "Secure access control",
    ],
  },
];

export default function FunctionCards() {
  const [openCards, setOpenCards] = useState<number[]>([]);
  const { h2, body } = useTypography();

  const toggleCard = (index: number) => {
    setOpenCards(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            Functions That Talk to Each Other
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            Every module shares the same data model. No syncing. No waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {functions.map((func, index) => {
            const Icon = func.icon;
            const isOpen = openCards.includes(index);

            return (
              <Collapsible key={index} open={isOpen} onOpenChange={() => toggleCard(index)}>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{func.title}</CardTitle>
                            <CardDescription className="text-base font-medium text-foreground">
                              {func.headline}
                            </CardDescription>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition-transform ${
                            isOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {func.description}
                      </p>
                      <ul className="space-y-2">
                        {func.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center text-sm text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
