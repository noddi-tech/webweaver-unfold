import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Check, ArrowRight } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";
import { EditableIcon } from "@/components/EditableIcon";
import { EditableListIcon } from "@/components/EditableListIcon";

export default function WhyNavio() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  const beforeItems = [
    t('why_noddi.before.item_1', 'Multiple disconnected tools'),
    t('why_noddi.before.item_2', 'Manual data entry across systems'),
    t('why_noddi.before.item_3', 'Spreadsheet chaos'),
    t('why_noddi.before.item_4', 'Lost customer follow-ups')
  ];

  const afterItems = [
    t('why_noddi.after.item_1', 'One unified platform'),
    t('why_noddi.after.item_2', 'Automatic data synchronization'),
    t('why_noddi.after.item_3', 'Real-time operational visibility'),
    t('why_noddi.after.item_4', 'Automated customer engagement')
  ];

  return (
    <section ref={ref as any} className="pt-8 lg:pt-24 pb-24">
      <div className="container max-w-5xl px-4 sm:px-6 lg:px-8" key={refreshKey}>
        <div className="text-center mb-16">
          <EditableTranslation translationKey="why_noddi.title" onSave={() => setRefreshKey(prev => prev + 1)}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {t('why_noddi.title', 'Stop chasing problems. Start maximizing profits')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="why_noddi.subtitle" onSave={() => setRefreshKey(prev => prev + 1)}>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('why_noddi.subtitle', 'Most automotive service providers patch together 5+ tools. Navio replaces them all.')}
            </p>
          </EditableTranslation>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Before Card */}
          <EditableBackground
            elementId="why-noddi-before-card"
            defaultBackground="bg-card"
          >
            <Card 
              className={`border-2 border-destructive/20 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <EditableTranslation translationKey="why_noddi.before.title" onSave={() => setRefreshKey(prev => prev + 1)}>
                    <h3 className="text-2xl font-bold">{t('why_noddi.before.title', 'Before Navio')}</h3>
                  </EditableTranslation>
                </div>
                <ul className="space-y-4">
                  {beforeItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <EditableListIcon
                        elementId="why-noddi-before-list-icon"
                        icon={X}
                        defaultColor="text-destructive"
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                      />
                      <EditableTranslation translationKey={`why_noddi.before.item_${index + 1}`} onSave={() => setRefreshKey(prev => prev + 1)}>
                        <span>{item}</span>
                      </EditableTranslation>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </EditableBackground>

          {/* After Card */}
          <EditableBackground
            elementId="why-noddi-after-card"
            defaultBackground="bg-primary/5"
          >
            <Card 
              className={`border-2 border-primary/30 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <EditableTranslation translationKey="why_noddi.after.title" onSave={() => setRefreshKey(prev => prev + 1)}>
                    <h3 className="text-2xl font-bold">{t('why_noddi.after.title', 'With Navio')}</h3>
                  </EditableTranslation>
                </div>
                <ul className="space-y-4">
                  {afterItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <EditableListIcon
                        elementId="why-noddi-after-list-icon"
                        icon={Check}
                        defaultColor="text-success"
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                      />
                      <EditableTranslation translationKey={`why_noddi.after.item_${index + 1}`} onSave={() => setRefreshKey(prev => prev + 1)}>
                        <span className="font-medium">{item}</span>
                      </EditableTranslation>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </EditableBackground>
        </div>

        <div className="text-center">
          <LanguageLink to="/functions">
            <EditableTranslation translationKey="why_noddi.button_cta" onSave={() => setRefreshKey(prev => prev + 1)}>
              <Button size="lg" className="text-lg px-8 py-6 group">
                {t('why_noddi.button_cta', 'See How It Works')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </EditableTranslation>
          </LanguageLink>
        </div>
      </div>
    </section>
  );
}