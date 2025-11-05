import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";

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
          <EditableTranslation translationKey="architecture.diagram.title">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('architecture.diagram.title', 'The Stack')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="architecture.diagram.subtitle">
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              {t('architecture.diagram.subtitle', 'A unified architecture. Everything shares the same data model.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {layers.map((layer, index) => (
            <div key={index} className="space-y-4">
              <EditableBackground
                elementId={`architecture-diagram-layer-${index}`}
                defaultBackground="glass-card"
                allowedBackgrounds={[
                  'bg-gradient-hero',
                  'bg-gradient-sunset',
                  'bg-gradient-warmth',
                  'bg-gradient-ocean',
                  'bg-gradient-fire',
                  'glass-card',
                  'liquid-glass',
                  'glass-prominent',
                  'bg-card',
                  'bg-background',
                  'bg-muted'
                ]}
              >
                <Card>
                  <CardContent className="py-8 text-center">
                    <EditableTranslation translationKey={`architecture.diagram.layer_${index + 1}.title`}>
                      <h3 className="text-2xl font-bold mb-2 text-foreground">{layer.title}</h3>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`architecture.diagram.layer_${index + 1}.subtitle`}>
                      <p className="text-sm text-muted-foreground">{layer.subtitle}</p>
                    </EditableTranslation>
                  </CardContent>
                </Card>
              </EditableBackground>
              {index < layers.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <EditableTranslation translationKey="architecture.diagram.footer_text">
            <p className="text-xl font-semibold text-foreground max-w-2xl mx-auto">
              {t('architecture.diagram.footer_text', 'No integrations to chase. No sync jobs to fix. Just one living system.')}
            </p>
          </EditableTranslation>
        </div>
      </div>
    </section>
  );
}
