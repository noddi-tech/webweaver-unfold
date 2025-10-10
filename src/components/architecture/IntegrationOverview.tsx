import { Card, CardContent } from "@/components/ui/card";
import { Database, ScanLine, CreditCard, FileText } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";

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
          <h2 className={`${h2} mb-4 text-foreground`}>
            {t('architecture.integrations.title', 'Connected where it counts.')}
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            {t('architecture.integrations.subtitle', 'Tire databases, scanners, payments, CRMs — all in one flow.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <Card key={index} className="glass-card text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-base text-muted-foreground">
            {t('architecture.integrations.footer', 'Integration optional. Everything works out-of-the-box.')}
          </p>
        </div>
      </div>
    </section>
  );
}
