import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Package, Bell, Map, Workflow, PieChart, Building2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";

export default function FunctionCards() {
  const [openCards, setOpenCards] = useState<number[]>([]);
  const { h2, body } = useTypography();
  const { t } = useAppTranslation();

  const functions = [
    {
      icon: Calendar,
      title: t('function_cards.function_1.title', 'Booking Flow'),
      headline: t('function_cards.function_1.headline', 'One minute from address to confirmed slot.'),
      description: t('function_cards.function_1.description', 'No fluff — just speed and clarity.'),
      features: [
        t('function_cards.function_1.feature_1', 'Smart time-slot planning'),
        t('function_cards.function_1.feature_2', 'Automatic reminders'),
        t('function_cards.function_1.feature_3', 'Multichannel (web, mobile, in-garage)'),
      ],
    },
    {
      icon: Package,
      title: t('function_cards.function_2.title', 'Tire Sales & Inventory'),
      headline: t('function_cards.function_2.headline', 'Knows your stock, margin, and timing — and sells accordingly.'),
      description: t('function_cards.function_2.description', 'Connected from warehouse to wheel.'),
      features: [
        t('function_cards.function_2.feature_1', 'Real-time inventory sync'),
        t('function_cards.function_2.feature_2', 'Margin-aware recommendations'),
        t('function_cards.function_2.feature_3', 'Laser scanner integration'),
      ],
    },
    {
      icon: Bell,
      title: t('function_cards.function_3.title', 'Auto Recall Engine'),
      headline: t('function_cards.function_3.headline', 'Reminds like a human, responds like software.'),
      description: t('function_cards.function_3.description', '77.9% acceptance rate. Automation that feels personal.'),
      features: [
        t('function_cards.function_3.feature_1', 'AI-powered timing'),
        t('function_cards.function_3.feature_2', 'SMS + email automation'),
        t('function_cards.function_3.feature_3', 'Seasonal campaign logic'),
      ],
    },
    {
      icon: Map,
      title: t('function_cards.function_4.title', 'Capacity & Route Optimization'),
      headline: t('function_cards.function_4.headline', 'Always on time, always utilized.'),
      description: t('function_cards.function_4.description', 'AI plans daily schedules based on location, staff, and load.'),
      features: [
        t('function_cards.function_4.feature_1', 'Route optimization'),
        t('function_cards.function_4.feature_2', 'Lane balancing for garages'),
        t('function_cards.function_4.feature_3', 'Real-time rescheduling'),
      ],
    },
    {
      icon: Workflow,
      title: t('function_cards.function_5.title', 'Workflow Automation'),
      headline: t('function_cards.function_5.headline', 'Rules you set once, results you see always.'),
      description: t('function_cards.function_5.description', 'No sync meetings required.'),
      features: [
        t('function_cards.function_5.feature_1', 'Automated storage handling'),
        t('function_cards.function_5.feature_2', 'Service completion triggers'),
        t('function_cards.function_5.feature_3', 'Overage and follow-up logic'),
      ],
    },
    {
      icon: PieChart,
      title: t('function_cards.function_6.title', 'Reporting & Insights'),
      headline: t('function_cards.function_6.headline', "Data that's actually useful."),
      description: t('function_cards.function_6.description', 'Clear dashboards for revenue, capacity, and performance.'),
      features: [
        t('function_cards.function_6.feature_1', 'Real-time dashboards'),
        t('function_cards.function_6.feature_2', 'Drill-down by service'),
        t('function_cards.function_6.feature_3', 'Export & API-ready'),
      ],
    },
    {
      icon: Building2,
      title: t('function_cards.function_7.title', 'B2B & Fleet Portal'),
      headline: t('function_cards.function_7.headline', 'For partners that manage fleets.'),
      description: t('function_cards.function_7.description', 'Centralized fleet bookings, reports, and permissions.'),
      features: [
        t('function_cards.function_7.feature_1', 'Multi-vehicle management'),
        t('function_cards.function_7.feature_2', 'API integrations'),
        t('function_cards.function_7.feature_3', 'Secure access control'),
      ],
    },
  ];

  const toggleCard = (index: number) => {
    setOpenCards(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="function_cards.title">
            <h2 className={`${h2} mb-4 text-foreground`}>
              {t('function_cards.title', 'Functions That Talk to Each Other')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="function_cards.subtitle">
            <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
              {t('function_cards.subtitle', 'Every module shares the same data model. No syncing. No waiting.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {functions.map((func, index) => {
            const Icon = func.icon;
            const isOpen = openCards.includes(index);

            return (
              <Collapsible key={index} open={isOpen} onOpenChange={() => toggleCard(index)}>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <EditableTranslation translationKey={`function_cards.function_${index + 1}.title`}>
                              <CardTitle className="text-xl mb-2">{func.title}</CardTitle>
                            </EditableTranslation>
                            <EditableTranslation translationKey={`function_cards.function_${index + 1}.headline`}>
                              <CardDescription className="text-base font-medium text-foreground">
                                {func.headline}
                              </CardDescription>
                            </EditableTranslation>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition-transform ${
                            isOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <EditableTranslation translationKey={`function_cards.function_${index + 1}.description`}>
                        <p className="text-sm text-muted-foreground mb-4">
                          {func.description}
                        </p>
                      </EditableTranslation>
                      <ul className="space-y-2">
                        {func.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center text-sm text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                            <EditableTranslation translationKey={`function_cards.function_${index + 1}.feature_${fIndex + 1}`}>
                              <span>{feature}</span>
                            </EditableTranslation>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
