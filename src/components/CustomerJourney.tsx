import { MousePointer, Calendar, CheckCircle, MapPin, Wrench, Mail } from "lucide-react";

const journeySteps = [
  {
    icon: MousePointer,
    title: "Customer discovers service",
    description: "Browse available services online or mobile"
  },
  {
    icon: Calendar,
    title: "Books online",
    description: "Select service, time, and preferred location"
  },
  {
    icon: CheckCircle,
    title: "Receives confirmation",
    description: "Instant booking confirmation and reminders"
  },
  {
    icon: MapPin,
    title: "Arrives at shop",
    description: "Seamless check-in with lane optimization"
  },
  {
    icon: Wrench,
    title: "Service completed",
    description: "Real-time updates and service documentation"
  },
  {
    icon: Mail,
    title: "Follow-up/recall",
    description: "Automated recall campaigns and feedback"
  }
];

export default function CustomerJourney() {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Customer Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From booking to service and follow-up — seamlessly connected
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary opacity-20 -translate-y-1/2" />
          <div className="grid grid-cols-6 gap-4">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 relative z-10 shadow-lg hover-scale">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-8 bg-background rounded-full border-4 border-primary" />
                    <h3 className="font-semibold text-sm mb-2 mt-8 text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet Vertical Timeline */}
        <div className="lg:hidden space-y-6">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-4 items-start">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1 h-6 bg-gradient-primary opacity-20" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking Funnel Visual */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">40% Conversion Rate</h3>
            <p className="text-muted-foreground">Industry-leading booking funnel performance</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 max-w-4xl mx-auto">
            <img 
              src="/src/assets/booking-funnel.png" 
              alt="6-step booking funnel showing 40% conversion rate" 
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
