import { Card, CardContent } from "@/components/ui/card";
import { Workflow, Handshake, Layout } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const products = [
  {
    icon: Workflow,
    title: "Functions",
    description: "See every capability—from booking to invoicing—in one platform",
    link: "/functions",
    color: "primary"
  },
  {
    icon: Handshake,
    title: "Partners",
    description: "Built for automotive networks, tire hotels, and multi-location chains",
    link: "/partners",
    color: "secondary"
  },
  {
    icon: Layout,
    title: "Architecture",
    description: "Understand the technology behind Noddi's unified system",
    link: "/architecture",
    color: "accent"
  }
];

export default function ProductOverview() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref as any} className="py-section">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            One platform. Every function.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore how Noddi unifies your entire operation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <LanguageLink 
                key={index} 
                to={product.link}
                className={`group transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className="h-full hover-scale border-2 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              </LanguageLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
