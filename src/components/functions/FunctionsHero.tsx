import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { supabase } from "@/integrations/supabase/client";
import coreLoopIllustration from "@/assets/core-loop-illustration.png";

export default function FunctionsHero() {
  const { h1, h2, body } = useTypography();
  const { t } = useAppTranslation();
  const [imageUrl, setImageUrl] = useState<string>(coreLoopIllustration);

  const loadMediaSettings = async () => {
    const { data: settings } = await supabase
      .from('image_carousel_settings')
      .select('image_url')
      .eq('location_id', 'functions-core-loop')
      .maybeSingle();
    
    if (settings?.image_url) {
      setImageUrl(settings.image_url);
    }
  };

  useEffect(() => {
    loadMediaSettings();
  }, []);
  
  return (
    <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        {/* Hero Text Content */}
        <div className="text-center max-w-4xl mx-auto">
          <EditableTranslation translationKey="functions_hero.h1">
            <h1 className={`${h1} mb-6 text-foreground`}>
              {t('functions_hero.h1', 'Every function. One platform.')}
            </h1>
          </EditableTranslation>
          <EditableTranslation translationKey="functions_hero.subtitle">
            <p className={`${body} text-muted-foreground mb-8`}>
              {t('functions_hero.subtitle', 'From booking to billing, everything connects — automatically.')}
            </p>
          </EditableTranslation>
        </div>

        {/* Core Loop Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          {/* 1. Illustration FIRST */}
          <div className="flex justify-center">
            <div className="w-full max-w-6xl px-0 sm:px-4 lg:px-8">
              <EditableUniversalMedia
                locationId="functions-core-loop"
                onSave={loadMediaSettings}
                placeholder="Click to upload Core Loop illustration"
              >
                <img 
                  src={imageUrl}
                  alt="The Core Loop: 1. Book - customer picks time, 2. Plan - routes auto-optimize, 3. Execute - technicians get workflows, 4. Analyze - data flows to insights, 5. Re-engage - customers return"
                  className="w-full h-auto rounded-lg sm:rounded-xl"
                />
              </EditableUniversalMedia>
            </div>
          </div>

          {/* 2. The Core Loop heading + subtitle */}
          <div className="text-center mt-8 sm:mt-12">
            <EditableTranslation translationKey="core_loop.title">
              <h2 className={`${h2} mb-3 text-foreground`}>
                {t('core_loop.title', 'The Core Loop')}
              </h2>
            </EditableTranslation>
            <EditableTranslation translationKey="core_loop.subtitle">
              <p className={`${body} text-muted-foreground max-w-2xl mx-auto`}>
                {t('core_loop.subtitle', 'Every step feeds the next. No gaps. No manual handoffs.')}
              </p>
            </EditableTranslation>
          </div>

          {/* 3. CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button size="lg" className="text-lg px-8 py-6 group" asChild>
              <LanguageLink to="/contact">
                <EditableTranslation translationKey="functions_hero.button_primary">
                  <span>{t('functions_hero.button_primary', 'Book a demo')}</span>
                </EditableTranslation>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </LanguageLink>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <LanguageLink to="/architecture">
                <Eye className="w-5 h-5 mr-2" />
                <EditableTranslation translationKey="functions_hero.button_secondary">
                  <span>{t('functions_hero.button_secondary', 'See how the system thinks')}</span>
                </EditableTranslation>
              </LanguageLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
