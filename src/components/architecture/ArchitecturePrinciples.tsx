import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, Cloud, Shield, Plug, Gauge } from "lucide-react";

const principles = [
  {
    icon: Database,
    headline: "Everything speaks the same language.",
    subtext: "One schema for customers, bookings, and tires.",
  },
  {
    icon: Zap,
    headline: "The system reacts before you can.",
    subtext: "Real-time automation on every action.",
  },
  {
    icon: Cloud,
    headline: "Built for cities, not just garages.",
    subtext: "Regional deployments, multi-tenant by default.",
  },
  {
    icon: Shield,
    headline: "Privacy isn't a feature — it's architecture.",
    subtext: "Encryption, roles, audit trails.",
  },
  {
    icon: Plug,
    headline: "Open by default.",
    subtext: "REST + GraphQL endpoints for anything external.",
  },
  {
    icon: Gauge,
    headline: "Fast. Always.",
    subtext: "99.9% uptime and sub-second load speeds.",
  },
];

export default function ArchitecturePrinciples() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Core Principles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How Noddi is built to scale, secure, and perform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{principle.headline}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{principle.subtext}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
