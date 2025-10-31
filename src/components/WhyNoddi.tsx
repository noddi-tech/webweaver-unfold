import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Check, ArrowRight } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function WhyNoddi() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { t } = useAppTranslation();

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
    <section ref={ref as any} className="py-section">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('why_noddi.title', 'Stop chasing problems. Start maximizing profits')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('why_noddi.subtitle', 'Most automotive service providers patch together 5+ tools. Noddi replaces them all.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Before Card */}
          <Card 
            className={`border-2 border-destructive/20 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{t('why_noddi.before.title', 'Before Noddi')}</h3>
              </div>
              <ul className="space-y-4">
                {beforeItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* After Card */}
          <Card 
            className={`border-2 border-primary/30 bg-primary/5 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{t('why_noddi.after.title', 'With Noddi')}</h3>
              </div>
              <ul className="space-y-4">
                {afterItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <LanguageLink to="/functions">
            <Button size="lg" className="text-lg px-8 py-6 group">
              {t('why_noddi.button_cta', 'See How It Works')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </LanguageLink>
        </div>
      </div>
    </section>
  );
}
