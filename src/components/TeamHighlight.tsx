import { Award, Brain, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const expertise = [
  {
    icon: Brain,
    title: "AI & Route Planning",
    description: "Pioneers from Oda and delivery-tech startups"
  },
  {
    icon: TrendingUp,
    title: "B2B Sales",
    description: "Deep expertise in SaaS and enterprise sales"
  },
  {
    icon: Users,
    title: "Operations",
    description: "Proven track record in logistics and automation"
  }
];

export default function TeamHighlight() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Award className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Built by Route-Planning Pioneers
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            World-class team combining deep technical expertise with business acumen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {expertise.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="hover-scale">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Our founding team brings together experience from Oda, leading delivery-tech startups, and enterprise software companies—combining cutting-edge AI, logistics automation, and B2B expertise to transform automotive services.
          </p>
        </div>
      </div>
    </section>
  );
}
