import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";

const cases = [
  {
    title: "Nordic Fleet Partner",
    before: "Three disconnected systems.",
    after: "Full automation. 20% fewer support tickets, 35% faster bookings.",
  },
  {
    title: "Dealer Group",
    before: "Manual reminders.",
    after: "Auto recall campaigns with 77.9% acceptance rate.",
  },
  {
    title: "Regional Service Chain",
    before: "Route planning by spreadsheet.",
    after: "AI-powered optimization. 25% more daily capacity.",
  },
];

export default function CaseStudies() {
  const { h2, body } = useTypography();
  
  return (
    <section className="py-section bg-surface">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            Partners in Action
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            Before and after. Short stories, big impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {cases.map((caseStudy, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Before</p>
                    <p className="text-base text-foreground">{caseStudy.before}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">After</p>
                    <p className="text-base text-foreground">{caseStudy.after}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
            When everything connects, customers come back.
          </p>
        </div>
      </div>
    </section>
  );
}
