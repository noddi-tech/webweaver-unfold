import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, icons } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableBackground } from "@/components/EditableBackground";
import { EditableButton } from "@/components/EditableButton";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";
import { supabase } from "@/integrations/supabase/client";
import { resolveTextColor } from "@/lib/textColorUtils";

interface ButtonSettings {
  text: string;
  url: string;
  bgColor: string;
  icon: string;
  textColor: string;
}

export default function FinalCTA() {
  const { t } = useAppTranslation();
  const { allowedBackgrounds } = useAllowedBackgrounds();
  
  // Button settings state
  const [primaryButton, setPrimaryButton] = useState<ButtonSettings>({
    text: t('final_cta.button_primary', 'Book a Demo'),
    url: '/contact',
    bgColor: 'primary',
    icon: '',
    textColor: 'primary-foreground',
  });
  
  const [secondaryButton, setSecondaryButton] = useState<ButtonSettings>({
    text: t('final_cta.button_secondary', 'See Technical Overview'),
    url: '/architecture',
    bgColor: 'transparent',
    icon: '',
    textColor: 'white',
  });

  // Load button settings from database
  useEffect(() => {
    const loadButtonSettings = async () => {
      const { data } = await supabase
        .from('text_content')
        .select('element_id, content, button_url, button_bg_color, button_icon, color_token')
        .in('element_id', ['final-cta-button-primary', 'final-cta-button-secondary']);

      data?.forEach((item) => {
        if (item.element_id === 'final-cta-button-primary') {
          setPrimaryButton({
            text: item.content || t('final_cta.button_primary', 'Book a Demo'),
            url: item.button_url || '/contact',
            bgColor: item.button_bg_color || 'primary',
            icon: item.button_icon || '',
            textColor: item.color_token || 'primary-foreground',
          });
        } else if (item.element_id === 'final-cta-button-secondary') {
          setSecondaryButton({
            text: item.content || t('final_cta.button_secondary', 'See Technical Overview'),
            url: item.button_url || '/architecture',
            bgColor: item.button_bg_color || 'transparent',
            icon: item.button_icon || '',
            textColor: item.color_token || 'white',
          });
        }
      });
    };

    loadButtonSettings();
  }, [t]);

  // Save button settings to database
  const saveButtonSettings = async (elementId: string, settings: ButtonSettings) => {
    await supabase
      .from('text_content')
      .upsert({
        element_id: elementId,
        content: settings.text,
        button_url: settings.url,
        button_bg_color: settings.bgColor,
        button_icon: settings.icon,
        color_token: settings.textColor,
        element_type: 'button',
        section: 'final-cta',
        page_location: 'homepage',
      }, { onConflict: 'element_id' });
  };

  // Dynamic icon component
  const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (icons as Record<string, any>)[name];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  // Get button styles
  const getButtonStyle = (settings: ButtonSettings) => {
    const isGradient = settings.bgColor.startsWith('gradient-') || settings.bgColor.startsWith('glass-');
    const isTransparent = settings.bgColor === 'transparent';
    
    return {
      backgroundColor: isGradient || isTransparent ? undefined : `hsl(var(--${settings.bgColor}))`,
      backgroundImage: isGradient ? `var(--${settings.bgColor})` : undefined,
      color: resolveTextColor(settings.textColor),
    };
  };

  return (
    <section className="py-12 md:py-16 lg:py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <EditableBackground
          elementId="final-cta-section"
          defaultBackground="bg-gradient-hero"
          allowedBackgrounds={allowedBackgrounds}
        >
          <div className="relative overflow-hidden rounded-2xl p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-primary opacity-10" />
            <div className="relative z-10">
              <EditableTranslation translationKey="final_cta.title">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {t('final_cta.title', "Let's build your digital workshop")}
                </h2>
              </EditableTranslation>
              <EditableTranslation translationKey="final_cta.subtitle">
                <p className="text-xl max-w-2xl mx-auto mb-8">
                  {t('final_cta.subtitle', 'Schedule a personalized demo or see how your specific use case can be automated with Navio')}
                </p>
              </EditableTranslation>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <EditableButton
                  buttonText={primaryButton.text}
                  buttonUrl={primaryButton.url}
                  buttonBgColor={primaryButton.bgColor}
                  buttonIcon={primaryButton.icon}
                  buttonTextColor={primaryButton.textColor}
                  onSave={(text, url) => {
                    const newSettings = { ...primaryButton, text, url };
                    setPrimaryButton(newSettings);
                    saveButtonSettings('final-cta-button-primary', newSettings);
                  }}
                  onBgColorChange={(bgColor) => {
                    const newSettings = { ...primaryButton, bgColor };
                    setPrimaryButton(newSettings);
                    saveButtonSettings('final-cta-button-primary', newSettings);
                  }}
                  onIconChange={(icon) => {
                    const newSettings = { ...primaryButton, icon };
                    setPrimaryButton(newSettings);
                    saveButtonSettings('final-cta-button-primary', newSettings);
                  }}
                  onTextColorChange={(textColor) => {
                    const newSettings = { ...primaryButton, textColor };
                    setPrimaryButton(newSettings);
                    saveButtonSettings('final-cta-button-primary', newSettings);
                  }}
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 group" 
                    style={getButtonStyle(primaryButton)}
                    asChild
                  >
                    <LanguageLink to={primaryButton.url}>
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{primaryButton.text}</span>
                      {primaryButton.icon ? (
                        <DynamicIcon name={primaryButton.icon} className="w-5 h-5 ml-2" />
                      ) : (
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      )}
                    </LanguageLink>
                  </Button>
                </EditableButton>
                
                <EditableButton
                  buttonText={secondaryButton.text}
                  buttonUrl={secondaryButton.url}
                  buttonBgColor={secondaryButton.bgColor}
                  buttonIcon={secondaryButton.icon}
                  buttonTextColor={secondaryButton.textColor}
                  onSave={(text, url) => {
                    const newSettings = { ...secondaryButton, text, url };
                    setSecondaryButton(newSettings);
                    saveButtonSettings('final-cta-button-secondary', newSettings);
                  }}
                  onBgColorChange={(bgColor) => {
                    const newSettings = { ...secondaryButton, bgColor };
                    setSecondaryButton(newSettings);
                    saveButtonSettings('final-cta-button-secondary', newSettings);
                  }}
                  onIconChange={(icon) => {
                    const newSettings = { ...secondaryButton, icon };
                    setSecondaryButton(newSettings);
                    saveButtonSettings('final-cta-button-secondary', newSettings);
                  }}
                  onTextColorChange={(textColor) => {
                    const newSettings = { ...secondaryButton, textColor };
                    setSecondaryButton(newSettings);
                    saveButtonSettings('final-cta-button-secondary', newSettings);
                  }}
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-white/30 hover:bg-white/10" 
                    style={getButtonStyle(secondaryButton)}
                    asChild
                  >
                    <LanguageLink to={secondaryButton.url}>
                      <span>{secondaryButton.text}</span>
                      {secondaryButton.icon && (
                        <DynamicIcon name={secondaryButton.icon} className="w-5 h-5 ml-2" />
                      )}
                    </LanguageLink>
                  </Button>
                </EditableButton>
              </div>
              <EditableTranslation translationKey="final_cta.footer_text">
                <p className="mt-8 text-sm opacity-70">
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
