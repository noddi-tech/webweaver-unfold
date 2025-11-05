import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";

export default function FinalCTA() {
  const { t } = useAppTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8" key={refreshKey}>
        <EditableBackground
          elementId="final-cta-section"
          defaultBackground="bg-gradient-hero"
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
          <div className="relative overflow-hidden rounded-2xl p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-primary opacity-10" />
            <div className="relative z-10">
              <EditableTranslation translationKey="final_cta.title" onSave={() => setRefreshKey(prev => prev + 1)}>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  {t('final_cta.title', "Let's build your digital workshop")}
                </h2>
              </EditableTranslation>
              <EditableTranslation translationKey="final_cta.subtitle" onSave={() => setRefreshKey(prev => prev + 1)}>
                <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                  {t('final_cta.subtitle', 'Schedule a personalized demo or see how your specific use case can be automated with Noddi')}
                </p>
              </EditableTranslation>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="text-lg px-8 py-6 group" asChild>
                  <LanguageLink to="/contact">
                    <Calendar className="w-5 h-5 mr-2" />
                    <EditableTranslation translationKey="final_cta.button_primary" onSave={() => setRefreshKey(prev => prev + 1)}>
                      <span>{t('final_cta.button_primary', 'Book a Demo')}</span>
                    </EditableTranslation>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </LanguageLink>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10" asChild>
                  <LanguageLink to="/architecture">
                    <EditableTranslation translationKey="final_cta.button_secondary" onSave={() => setRefreshKey(prev => prev + 1)}>
                      <span>{t('final_cta.button_secondary', 'See Technical Overview')}</span>
                    </EditableTranslation>
                  </LanguageLink>
                </Button>
              </div>
              <EditableTranslation translationKey="final_cta.footer_text" onSave={() => setRefreshKey(prev => prev + 1)}>
                <p className="mt-8 text-sm text-white/70">
                  {t('final_cta.footer_text', 'No credit card required • Free consultation • See results in 30 days')}
                </p>
              </EditableTranslation>
            </div>
          </div>
        </EditableBackground>
      </div>
    </section>
  );
}
