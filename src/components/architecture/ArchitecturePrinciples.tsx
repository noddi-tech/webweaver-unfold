import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Database, Zap, Cloud, Shield, Plug, Gauge } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";

export default function ArchitecturePrinciples() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const principleKeys = ['unified', 'reactive', 'scalable', 'secure', 'open', 'fast'];
  
  const principles = [
    { icon: Database, key: 'unified' },
    { icon: Zap, key: 'reactive' },
    { icon: Cloud, key: 'scalable' },
    { icon: Shield, key: 'secure' },
    { icon: Plug, key: 'open' },
    { icon: Gauge, key: 'fast' },
  ];
  
  return (
    <section className="py-12 md:py-16 lg:py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="architecture.principles.title">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('architecture.principles.title', 'Core Principles')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="architecture.principles.subtitle">
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              {t('architecture.principles.subtitle', 'How Navio is built to scale, secure, and perform.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            const key = principle.key;
            
            return (
              <EditableCard
                key={index}
                elementIdPrefix={`architecture-principle-${index}`}
                defaultBackground="glass-card"
                defaultTextColor="foreground"
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <EditableCardIcon icon={Icon} size="default" />
                    <EditableTranslation translationKey={`architecture.principles.${key}.title`}>
                      <EditableCardTitle className="text-xl">
                        {t(`architecture.principles.${key}.title`)}
                      </EditableCardTitle>
                    </EditableTranslation>
                  </CardHeader>
                  <CardContent>
                    <EditableTranslation translationKey={`architecture.principles.${key}.description`}>
                      <EditableCardDescription>
                        {t(`architecture.principles.${key}.description`)}
                      </EditableCardDescription>
                    </EditableTranslation>
                  </CardContent>
                </Card>
              </EditableCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
