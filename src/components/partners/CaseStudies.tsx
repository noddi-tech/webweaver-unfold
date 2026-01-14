import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableBackground } from "@/components/EditableBackground";

export default function CaseStudies() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const cases = [
    {
      title: t('case_studies.case_1.title', 'Nordic Fleet Partner'),
      before: t('case_studies.case_1.before', 'Three disconnected systems.'),
      after: t('case_studies.case_1.after', 'Full automation. 20% fewer support tickets, 35% faster bookings.'),
    },
    {
      title: t('case_studies.case_2.title', 'Dealer Group'),
      before: t('case_studies.case_2.before', 'Manual reminders.'),
      after: t('case_studies.case_2.after', 'Auto recall campaigns with 77.9% acceptance rate.'),
    },
    {
      title: t('case_studies.case_3.title', 'Regional Service Chain'),
      before: t('case_studies.case_3.before', 'Route planning by spreadsheet.'),
      after: t('case_studies.case_3.after', 'AI-powered optimization. 25% more daily capacity.'),
    },
  ];
  
  return (
    <section className="py-section" data-header-color="dark">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`${h2} mb-4 text-foreground`}>
            {t('case_studies.title', 'Partners in Action')}
          </h2>
          <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
            {t('case_studies.subtitle', 'Before and after. Short stories, big impact.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {cases.map((caseStudy, index) => (
            <EditableBackground
              key={index}
              elementId={`partners-case-${index}`}
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
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('case_studies.label_before', 'Before')}</p>
                      <p className="text-base text-foreground">{caseStudy.before}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('case_studies.label_after', 'After')}</p>
                      <p className="text-base text-foreground">{caseStudy.after}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </EditableBackground>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
            {t('case_studies.footer_text', 'When everything connects, customers come back.')}
          </p>
        </div>
      </div>
    </section>
  );
}
