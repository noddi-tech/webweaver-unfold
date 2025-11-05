import { Card, CardContent } from "@/components/ui/card";
import { Database, ScanLine, CreditCard, FileText } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";

export default function IntegrationOverview() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const integrations = [
    {
      icon: Database,
      name: t('architecture.integrations.tire_databases.name', 'Tire Databases'),
      description: t('architecture.integrations.tire_databases.description', 'Real-time inventory'),
    },
    {
      icon: ScanLine,
      name: t('architecture.integrations.laser_scanners.name', 'Laser Scanners'),
      description: t('architecture.integrations.laser_scanners.description', 'Instant tire depth'),
    },
    {
      icon: CreditCard,
      name: t('architecture.integrations.payment_gateways.name', 'Payment Gateways'),
      description: t('architecture.integrations.payment_gateways.description', 'Secure checkout'),
    },
    {
      icon: FileText,
      name: t('architecture.integrations.crm_erp.name', 'CRM / ERP Systems'),
      description: t('architecture.integrations.crm_erp.description', 'Data flow'),
    },
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
              <EditableBackground
                key={index}
                elementId={`architecture-integration-${index}`}
                defaultBackground="glass-card"
                allowedBackgrounds={[
                  'bg-card',
                  'glass-card',
                  'bg-gradient-ocean',
                  'bg-gradient-warmth'
                ]}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <EditableTranslation translationKey={`architecture.integrations.${['tire_databases', 'laser_scanners', 'payment_gateways', 'crm_erp'][index]}.name`}>
                      <h3 className="text-lg font-bold mb-2 text-foreground">
                        {integration.name}
                      </h3>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`architecture.integrations.${['tire_databases', 'laser_scanners', 'payment_gateways', 'crm_erp'][index]}.description`}>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </EditableTranslation>
                  </CardContent>
                </Card>
              </EditableBackground>
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
