import { AlertTriangle, X, CheckCircle2, Zap, Users, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

const painPoints = [
  {
    icon: Package,
    problem: "Tire sales can't be automated",
    disconnected: "Manual cross-checking, delays, errors",
    ourApproach: "Fully integrated tire sales tied to inventory & quoting"
  },
  {
    icon: AlertTriangle,
    problem: "Poor recall logic",
    disconnected: "Static campaigns, low relevance",
    ourApproach: "Recall campaigns driven by capacity, utilization, and data"
  },
  {
    icon: X,
    problem: "Sync issues when booking changes",
    disconnected: "Broken flows, double bookings",
    ourApproach: "Real-time sync across booking, backend, shop"
  },
  {
    icon: AlertTriangle,
    problem: "Lane optimization breaks",
    disconnected: "Digital → analog friction upon arrival",
    ourApproach: "Seamless experience from booking to garage floor"
  },
  {
    icon: Users,
    problem: "Contactless visits are limited",
    disconnected: "Need in-person touchpoints",
    ourApproach: "Fully self-servicable UI with mobile + in-lane support"
  },
  {
    icon: Zap,
    problem: "Splitting across systems",
    disconnected: "Integration complexity + tech dependencies",
    ourApproach: "We own both booking and ERP — one roadmap, one source of truth"
  }
];

export default function PainSolutionTable() {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Why We Built This
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            An integrated system beats disconnected ERP every time
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">Problem</th>
                <th className="text-left p-4 font-semibold text-foreground">What Happens in Disconnected Systems</th>
                <th className="text-left p-4 font-semibold text-foreground">Our Approach</th>
              </tr>
            </thead>
            <tbody>
              {painPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-medium text-foreground">{point.problem}</span>
                      </div>
                    </td>
                    <td className="p-6 text-muted-foreground">{point.disconnected}</td>
                    <td className="p-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{point.ourApproach}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">{point.problem}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Disconnected Systems:</p>
                    <p className="text-sm text-foreground">{point.disconnected}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Our Approach:
                    </p>
                    <p className="text-sm text-foreground">{point.ourApproach}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
