import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Workflow, Handshake, Layout } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";
import { EditableIcon } from "@/components/EditableIcon";

export default function ProductOverview() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const { allowedBackgrounds } = useAllowedBackgrounds();

  const products = [
    {
      icon: Handshake,
      title: t('product_overview.solutions.title', "Solutions"),
      description: t('product_overview.solutions.description', "Built for automotive networks, tire hotels, and multi-location chains"),
      link: "/solutions",
      color: "secondary"
    },
    {
      icon: Workflow,
      title: t('product_overview.features.title', "Features"),
      description: t('product_overview.features.description', "See every capability—from booking to invoicing—in one platform"),
      link: "/features",
      color: "primary"
    },
    {
      icon: Layout,
      title: t('product_overview.architecture.title', "Architecture"),
      description: t('product_overview.architecture.description', "Understand the technology behind Noddi's unified system"),
      link: "/architecture",
      color: "accent"
    }
  ];

  return (
    <section ref={ref as any} className="py-section">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8" key={refreshKey}>
        <div className="text-center mb-16">
          <EditableTranslation translationKey="product_overview.title" onSave={() => setRefreshKey(prev => prev + 1)}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('product_overview.title', 'One platform. Every function.')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="product_overview.subtitle" onSave={() => setRefreshKey(prev => prev + 1)}>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              {t('product_overview.subtitle', 'Explore how Noddi unifies your entire operation')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <LanguageLink 
                key={index} 
                to={product.link}
                className={`h-full group transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <EditableBackground
                  elementId={`product-overview-card-${index}`}
                  defaultBackground="bg-card"
                  allowedBackgrounds={allowedBackgrounds}
                  className="h-full"
                >
                  <Card className="h-full hover-scale border-2 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-8">
                      <EditableIcon
                        elementId={`product-overview-icon-${index}`}
                        icon={Icon}
                        defaultBackground="bg-gradient-primary"
                        size="lg"
                        className="mb-1 group-hover:shadow-xl transition-shadow"
                      />
                        <EditableTranslation 
                        translationKey={`product_overview.${product.link.slice(1)}.title`} 
                        onSave={() => setRefreshKey(prev => prev + 1)}
                        fallbackText={product.title}
                      >
                        <h3 className="text-2xl font-bold mb-4 mt-6 transition-colors">
                          {product.title}
                        </h3>
                      </EditableTranslation>
                      <EditableTranslation 
                        translationKey={`product_overview.${product.link.slice(1)}.description`} 
                        onSave={() => setRefreshKey(prev => prev + 1)}
                        fallbackText={product.description}
                      >
                        <p className="leading-relaxed">
                          {product.description}
                        </p>
                      </EditableTranslation>
                    </CardContent>
                  </Card>
                </EditableBackground>
              </LanguageLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
