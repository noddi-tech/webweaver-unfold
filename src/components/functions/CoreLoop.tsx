import { Calendar, Zap, Wrench, BarChart3, RefreshCcw } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function CoreLoop() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const steps = [
    {
      icon: Calendar,
      title: t('core_loop.step_1.title', 'Book.'),
      description: t('core_loop.step_1.description', 'The customer picks a time — Navio handles the rest.'),
    },
    {
      icon: Zap,
      title: t('core_loop.step_2.title', 'Plan.'),
      description: t('core_loop.step_2.description', 'Routes and lanes auto-optimize in real time.'),
    },
    {
      icon: Wrench,
      title: t('core_loop.step_3.title', 'Execute.'),
      description: t('core_loop.step_3.description', 'Technicians get clear, connected workflows.'),
    },
    {
      icon: BarChart3,
      title: t('core_loop.step_4.title', 'Analyze.'),
      description: t('core_loop.step_4.description', 'Data flows instantly into insights.'),
    },
    {
      icon: RefreshCcw,
      title: t('core_loop.step_5.title', 'Re-engage.'),
      description: t('core_loop.step_5.description', 'Customers return before they even think to.'),
    },
  ];
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="core_loop.title">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('core_loop.title', 'The Core Loop')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="core_loop.subtitle">
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              {t('core_loop.subtitle', 'Every step feeds the next. No gaps. No manual handoffs.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <EditableTranslation translationKey={`core_loop.step_${index + 1}.title`}>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {step.title}
                  </h3>
                </EditableTranslation>
                <EditableTranslation translationKey={`core_loop.step_${index + 1}.description`}>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </EditableTranslation>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <EditableTranslation translationKey="core_loop.footer_text">
            <p className="text-xl font-semibold text-foreground">
              {t('core_loop.footer_text', "It's not automation. It's orchestration.")}
            </p>
          </EditableTranslation>
        </div>
      </div>
    </section>
  );
}
