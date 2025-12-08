import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";

export default function ArchitectureDiagram() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const layers = [
    { key: 'layer_1' },
    { key: 'layer_2' },
    { key: 'layer_3' },
    { key: 'layer_4' },
  ];
  
  return (
    <section className="py-12 md:py-16 lg:py-section">
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
              <EditableCard
                elementIdPrefix={`architecture-diagram-layer-${index}`}
                defaultBackground="glass-card"
                defaultTextColor="foreground"
              >
                <Card>
                  <CardContent className="py-8 text-center">
                    <EditableTranslation translationKey={`architecture.diagram.${layer.key}.title`}>
                      <EditableCardTitle className="text-2xl font-bold mb-2">
                        {t(`architecture.diagram.${layer.key}.title`)}
                      </EditableCardTitle>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`architecture.diagram.${layer.key}.subtitle`}>
                      <EditableCardDescription className="text-sm">
                        {t(`architecture.diagram.${layer.key}.subtitle`)}
                      </EditableCardDescription>
                    </EditableTranslation>
                  </CardContent>
                </Card>
              </EditableCard>
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
