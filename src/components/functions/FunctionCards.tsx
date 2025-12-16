import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    { icon: Calendar, key: 'function_1' },
    { icon: Package, key: 'function_2' },
    { icon: Bell, key: 'function_3' },
    { icon: Map, key: 'function_4' },
    { icon: Workflow, key: 'function_5' },
    { icon: PieChart, key: 'function_6' },
    { icon: Building2, key: 'function_7' },
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
                <Card className="transition-all duration-300 bg-card border shadow-sm">
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <EditableTranslation translationKey={`function_cards.${func.key}.title`}>
                              <h3 className="text-xl font-semibold mb-2 text-foreground">
                                {t(`function_cards.${func.key}.title`)}
                              </h3>
                            </EditableTranslation>
                            <EditableTranslation translationKey={`function_cards.${func.key}.headline`}>
                              <p className="text-base font-medium text-foreground">
                                {t(`function_cards.${func.key}.headline`)}
                              </p>
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
                      <EditableTranslation translationKey={`function_cards.${func.key}.description`}>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t(`function_cards.${func.key}.description`)}
                        </p>
                      </EditableTranslation>
                      <ul className="space-y-2">
                        {[1, 2, 3].map((fIndex) => (
                          <li key={fIndex} className="flex items-center text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                            <EditableTranslation translationKey={`function_cards.${func.key}.feature_${fIndex}`}>
                              <span className="text-muted-foreground">{t(`function_cards.${func.key}.feature_${fIndex}`)}</span>
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
