import { MapPin, Palette, DollarSign, Rocket, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const onboardingSteps = [
  {
    icon: MapPin,
    title: "Draw service area",
    description: "Define your geographic coverage on the map"
  },
  {
    icon: Palette,
    title: "Configure brand/logo",
    description: "Upload your branding assets and customize the look"
  },
  {
    icon: DollarSign,
    title: "Upload price list",
    description: "Import your service pricing and packages"
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Enable automatic SEO and go live"
  }
];

const benefits = [
  "Expansion to new services/regions is plug-and-play",
  "Backend and frontend unified for rapid scaling",
  "No integration complexity or API dependencies",
  "Single configuration process for all services"
];

export default function RapidOnboarding() {
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Launch in Less Than 1 Day
            </h2>
            <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-primary shadow-lg animate-pulse">
              <Zap className="w-4 h-4 mr-1" />
              &lt; 24h
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Onboard new partners in any geography with plug-and-play simplicity
          </p>
        </div>

        {/* Onboarding Timeline */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative hover-scale">
                  <CardContent className="p-6 text-center">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits List */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground">Key Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border hover-scale">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-block px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-base font-medium text-primary">
              Scale globally without technical barriers — Noddi handles the complexity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
