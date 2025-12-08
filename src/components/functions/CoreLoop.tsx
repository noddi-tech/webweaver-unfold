import { Calendar, Zap, Wrench, BarChart3, RefreshCcw } from "lucide-react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
import { EditableCardIcon } from "@/components/EditableCardIcon";
import { EditableCardTitle } from "@/components/EditableCardTitle";
import { EditableCardDescription } from "@/components/EditableCardDescription";

export default function CoreLoop() {
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const steps = [
    { icon: Calendar, key: 'step_1' },
    { icon: Zap, key: 'step_2' },
    { icon: Wrench, key: 'step_3' },
    { icon: BarChart3, key: 'step_4' },
    { icon: RefreshCcw, key: 'step_5' },
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
              <EditableCard
                key={index}
                elementIdPrefix={`core-loop-step-${index}`}
                defaultBackground="bg-transparent"
                defaultTextColor="foreground"
                className="text-center relative"
              >
                <div>
                  <div className="flex justify-center mb-4">
                    <EditableCardIcon icon={Icon} size="lg" containerClassName="rounded-full" />
                  </div>
                  <EditableTranslation translationKey={`core_loop.${step.key}.title`}>
                    <EditableCardTitle className="text-xl font-bold mb-2">
                      {t(`core_loop.${step.key}.title`)}
                    </EditableCardTitle>
                  </EditableTranslation>
                  <EditableTranslation translationKey={`core_loop.${step.key}.description`}>
                    <EditableCardDescription className="text-sm">
                      {t(`core_loop.${step.key}.description`)}
                    </EditableCardDescription>
                  </EditableTranslation>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </EditableCard>
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
