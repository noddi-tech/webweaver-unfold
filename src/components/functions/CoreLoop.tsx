import { Calendar, Zap, Wrench, BarChart3, RefreshCcw } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";

const steps = [
  {
    icon: Calendar,
    title: "Book.",
    description: "The customer picks a time — Noddi handles the rest.",
  },
  {
    icon: Zap,
    title: "Plan.",
    description: "Routes and lanes auto-optimize in real time.",
  },
  {
    icon: Wrench,
    title: "Execute.",
    description: "Technicians get clear, connected workflows.",
  },
  {
    icon: BarChart3,
    title: "Analyze.",
    description: "Data flows instantly into insights.",
  },
  {
    icon: RefreshCcw,
    title: "Re-engage.",
    description: "Customers return before they even think to.",
  },
];

export default function CoreLoop() {
  const { h2, body } = useTypography();
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            The Core Loop
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            Every step feeds the next. No gaps. No manual handoffs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
            It's not automation. It's orchestration.
          </p>
        </div>
      </div>
    </section>
  );
}
