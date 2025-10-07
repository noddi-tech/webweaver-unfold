import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";

const layers = [
  {
    title: "Frontend",
    subtitle: "Booking + Admin UI",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Unified API Layer",
    subtitle: "Single source of truth",
    color: "bg-secondary/10 text-secondary-foreground",
  },
  {
    title: "Backend Services",
    subtitle: "Booking, Capacity, Recall, Analytics",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    title: "External Integrations",
    subtitle: "Tire DBs, Scanners, Payments, ERP",
    color: "bg-muted text-muted-foreground",
  },
];

export default function ArchitectureDiagram() {
  return (
    <section className="py-20">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            The Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A unified architecture. Everything shares the same data model.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {layers.map((layer, index) => (
            <div key={index} className="space-y-4">
              <Card className={layer.color}>
                <CardContent className="py-8 text-center">
                  <h3 className="text-2xl font-bold mb-2">{layer.title}</h3>
                  <p className="text-sm">{layer.subtitle}</p>
                </CardContent>
              </Card>
              {index < layers.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-xl font-semibold text-foreground max-w-2xl mx-auto">
            No integrations to chase. No sync jobs to fix. Just one living system.
          </p>
        </div>
      </div>
    </section>
  );
}
