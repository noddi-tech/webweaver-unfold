import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { X, Check, ArrowRight } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableCard } from "@/components/EditableCard";
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
    <section ref={ref as any} className="py-8 md:py-12 lg:py-16" data-header-color="dark">
      <div className="container max-w-5xl px-4 sm:px-6 lg:px-8" key={refreshKey}>
        <div className="text-center mb-8 md:mb-12">
          <EditableTranslation translationKey="why_noddi.eyebrow" onSave={() => setRefreshKey(prev => prev + 1)}>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('why_noddi.eyebrow', 'WHY NAVIO')}
            </span>
          </EditableTranslation>
          <EditableTranslation translationKey="why_noddi.title" onSave={() => setRefreshKey(prev => prev + 1)}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground mt-3">
              {t('why_noddi.title', 'Before Navio vs. with Navio')}
            </h2>
          </EditableTranslation>
        </div>

        <div className="relative grid lg:grid-cols-2 gap-6 mb-8">
          {/* Floating VS Badge - Desktop */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm items-center justify-center shadow-lg border-4 border-background">
            VS
          </div>

          {/* Mobile VS Badge */}
          <div className="flex lg:hidden w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-xs items-center justify-center shadow-md mx-auto -my-3 relative z-10 border-4 border-background">
            VS
          </div>

          {/* Before Card — muted, flat, unappealing */}
          <EditableCard
            elementIdPrefix="why-noddi-before-card"
            defaultBackground="bg-muted/50"
            defaultTextColor="muted-foreground"
            className={`border border-border/50 transition-all duration-700 order-first ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <CardContent className="p-8">
              <div className="mb-6">
                <EditableTranslation translationKey="why_noddi.before.title" onSave={() => setRefreshKey(prev => prev + 1)}>
                  <h3 className="text-2xl font-bold text-muted-foreground">{t('why_noddi.before.title', 'Without Navio')}</h3>
                </EditableTranslation>
              </div>
              <ul className="space-y-4">
                {beforeItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <EditableListIcon
                      elementId="why-noddi-before-list-icon"
                      icon={X}
                      defaultColor="text-destructive/60"
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                    />
                    <EditableTranslation translationKey={`why_noddi.before.item_${index + 1}`} onSave={() => setRefreshKey(prev => prev + 1)}>
                      <span className="text-muted-foreground/80">{item}</span>
                    </EditableTranslation>
                  </li>
                ))}
              </ul>
            </CardContent>
          </EditableCard>

          {/* After Card — the clear winner */}
          <EditableCard
            elementIdPrefix="why-noddi-after-card"
            defaultBackground="bg-card"
            defaultTextColor="foreground"
            className={`relative overflow-hidden border-2 border-primary shadow-lg lg:scale-105 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Decorative gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <CardContent className="p-8 relative z-[1]">
              <div className="mb-6">
                <EditableTranslation translationKey="why_noddi.after.title" onSave={() => setRefreshKey(prev => prev + 1)}>
                  <h3 className="text-2xl font-bold text-primary">{t('why_noddi.after.title', 'With Navio')}</h3>
                </EditableTranslation>
              </div>
              <ul className="space-y-4">
                {afterItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <EditableListIcon
                      elementId="why-noddi-after-list-icon"
                      icon={Check}
                      defaultColor="text-primary"
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                    />
                    <EditableTranslation translationKey={`why_noddi.after.item_${index + 1}`} onSave={() => setRefreshKey(prev => prev + 1)}>
                      <span className="font-medium text-foreground">{item}</span>
                    </EditableTranslation>
                  </li>
                ))}
              </ul>
            </CardContent>
          </EditableCard>
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
