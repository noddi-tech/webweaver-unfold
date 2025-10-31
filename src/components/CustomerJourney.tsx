import { MousePointer, Calendar, CheckCircle, MapPin, Wrench, Mail } from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function CustomerJourney() {
  const { t } = useAppTranslation();

  const journeySteps = [
    {
      icon: MousePointer,
      title: t('customer_journey.step_1.title', 'Customer discovers service'),
      description: t('customer_journey.step_1.description', 'Browse available services online or mobile')
    },
    {
      icon: Calendar,
      title: t('customer_journey.step_2.title', 'Books online'),
      description: t('customer_journey.step_2.description', 'Select service, time, and preferred location')
    },
    {
      icon: CheckCircle,
      title: t('customer_journey.step_3.title', 'Receives confirmation'),
      description: t('customer_journey.step_3.description', 'Instant booking confirmation and reminders')
    },
    {
      icon: MapPin,
      title: t('customer_journey.step_4.title', 'Arrives at shop'),
      description: t('customer_journey.step_4.description', 'Seamless check-in with lane optimization')
    },
    {
      icon: Wrench,
      title: t('customer_journey.step_5.title', 'Service completed'),
      description: t('customer_journey.step_5.description', 'Real-time updates and service documentation')
    },
    {
      icon: Mail,
      title: t('customer_journey.step_6.title', 'Follow-up/recall'),
      description: t('customer_journey.step_6.description', 'Automated recall campaigns and feedback')
    }
  ];
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="customer_journey.title">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {t('customer_journey.title', 'Customer Journey')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="customer_journey.subtitle">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('customer_journey.subtitle', 'From booking to service and follow-up — seamlessly connected')}
            </p>
          </EditableTranslation>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary opacity-20 -translate-y-1/2" />
          <div className="grid grid-cols-6 gap-4">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 relative z-10 shadow-lg hover-scale">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-8 bg-background rounded-full border-4 border-primary" />
                    <EditableTranslation translationKey={`customer_journey.step_${index + 1}.title`}>
                      <h3 className="font-semibold text-sm mb-2 mt-8 text-foreground">{step.title}</h3>
                    </EditableTranslation>
                    <EditableTranslation translationKey={`customer_journey.step_${index + 1}.description`}>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </EditableTranslation>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet Vertical Timeline */}
        <div className="lg:hidden space-y-6">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-4 items-start">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1 h-6 bg-gradient-primary opacity-20" />
                  )}
                </div>
                <div>
                  <EditableTranslation translationKey={`customer_journey.step_${index + 1}.title`}>
                    <h3 className="font-semibold mb-1 text-foreground">{step.title}</h3>
                  </EditableTranslation>
                  <EditableTranslation translationKey={`customer_journey.step_${index + 1}.description`}>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </EditableTranslation>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
