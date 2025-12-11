import { useState, useEffect } from "react";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { supabase } from "@/integrations/supabase/client";
import coreLoopIllustration from "@/assets/core-loop-illustration.png";

export default function CoreLoop() {
  const { h2, body } = useTypography();
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
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
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

        <div className="flex justify-center mb-12">
          <div className="w-full max-w-5xl">
            <EditableUniversalMedia
              locationId="functions-core-loop"
              onSave={loadMediaSettings}
              placeholder="Click to upload Core Loop illustration"
            >
              <img 
                src={imageUrl}
                alt="The Core Loop: 1. Book - customer picks time, 2. Plan - routes auto-optimize, 3. Execute - technicians get workflows, 4. Analyze - data flows to insights, 5. Re-engage - customers return"
                className="w-full rounded-lg"
              />
            </EditableUniversalMedia>
          </div>
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
