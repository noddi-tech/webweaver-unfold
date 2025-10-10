import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function ArchitectureDiagram() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const layers = [
    {
      title: t('architecture.diagram.layer_1.title', 'Frontend'),
      subtitle: t('architecture.diagram.layer_1.subtitle', 'Booking + Admin UI'),
    },
    {
      title: t('architecture.diagram.layer_2.title', 'Unified API Layer'),
      subtitle: t('architecture.diagram.layer_2.subtitle', 'Single source of truth'),
    },
    {
      title: t('architecture.diagram.layer_3.title', 'Backend Services'),
      subtitle: t('architecture.diagram.layer_3.subtitle', 'Booking, Capacity, Recall, Analytics'),
    },
    {
      title: t('architecture.diagram.layer_4.title', 'External Integrations'),
      subtitle: t('architecture.diagram.layer_4.subtitle', 'Tire DBs, Scanners, Payments, ERP'),
    },
  ];
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            {t('architecture.diagram.title', 'The Stack')}
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            {t('architecture.diagram.subtitle', 'A unified architecture. Everything shares the same data model.')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {layers.map((layer, index) => (
            <div key={index} className="space-y-4">
              <Card className="glass-card">
                <CardContent className="py-8 text-center">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{layer.title}</h3>
                  <p className="text-sm text-muted-foreground">{layer.subtitle}</p>
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
            {t('architecture.diagram.footer_text', 'No integrations to chase. No sync jobs to fix. Just one living system.')}
          </p>
        </div>
      </div>
    </section>
  );
}
