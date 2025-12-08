import { Card, CardContent } from "@/components/ui/card";
import { Database, ScanLine, CreditCard, FileText } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";

export default function IntegrationOverview() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const integrations = [
    { icon: Database, key: 'tire_databases' },
    { icon: ScanLine, key: 'laser_scanners' },
    { icon: CreditCard, key: 'payment_gateways' },
    { icon: FileText, key: 'crm_erp' },
  ];
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="architecture.integrations.title">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('architecture.integrations.title', 'Connected where it counts.')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="architecture.integrations.subtitle">
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              {t('architecture.integrations.subtitle', 'Tire databases, scanners, payments, CRMs — all in one flow.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            
            return (
              <EditableCard
                key={index}
                elementIdPrefix={`architecture-integration-${index}`}
                defaultBackground="glass-card"
                defaultTextColor="foreground"
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex justify-center mb-4">
                      <EditableCardIcon icon={Icon} size="lg" containerClassName="rounded-full" />
                    </div>
                    <EditableTranslation translationKey={`architecture.integrations.${integration.key}.name`}>
                      <EditableCardTitle className="text-lg font-bold mb-2">
                        {t(`architecture.integrations.${integration.key}.name`)}
                      </EditableCardTitle>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`architecture.integrations.${integration.key}.description`}>
                      <EditableCardDescription className="text-sm">
                        {t(`architecture.integrations.${integration.key}.description`)}
                      </EditableCardDescription>
                    </EditableTranslation>
                  </CardContent>
                </Card>
              </EditableCard>
            );
          })}
        </div>

        <div className="text-center">
          <EditableTranslation translationKey="architecture.integrations.footer">
            <p className="text-base text-muted-foreground">
              {t('architecture.integrations.footer', 'Integration optional. Everything works out-of-the-box.')}
            </p>
          </EditableTranslation>
        </div>
      </div>
    </section>
  );
}
