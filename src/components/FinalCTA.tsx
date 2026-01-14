import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Pencil, icons } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { UnifiedStyleModal } from "@/components/UnifiedStyleModal";
import { useEditMode } from "@/contexts/EditModeContext";
import { useSiteStyles } from "@/contexts/SiteStylesContext";
import { supabase } from "@/integrations/supabase/client";
import { resolveTextColor } from "@/lib/textColorUtils";
import { BackgroundTextColorProvider } from "@/contexts/BackgroundTextColorContext";

interface CTAData {
  background: string;
  titleColor: string;
  descriptionColor: string;
  footerColor: string;
  ctaText: string;
  ctaUrl: string;
  ctaBgColor: string;
  ctaTextColor: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  secondaryCtaBgColor: string;
  secondaryCtaTextColor: string;
  iconColor: string;
}

export default function FinalCTA() {
  const { t } = useAppTranslation();
  const { editMode } = useEditMode();
  const { backgroundStyles, textStyles, isLoaded: stylesLoaded, refreshBackgroundStyles } = useSiteStyles();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ctaData, setCtaData] = useState<CTAData>({
    background: 'bg-gradient-hero',
    titleColor: 'white',
    descriptionColor: 'white',
    footerColor: 'white',
    ctaText: t('final_cta.button_primary', 'Book a Demo'),
    ctaUrl: '/contact',
    ctaBgColor: 'primary',
    ctaTextColor: 'primary-foreground',
    secondaryCtaText: t('final_cta.button_secondary', 'See Technical Overview'),
    secondaryCtaUrl: '/architecture',
    secondaryCtaBgColor: 'transparent',
    secondaryCtaTextColor: 'white',
    iconColor: 'white',
  });

  // Load styles from database on mount and when context updates
  useEffect(() => {
    if (!stylesLoaded) return;
    
    const loadCtaData = () => {
      // Load from context (preloaded data)
      const bgData = backgroundStyles['final-cta-background'];
      const titleData = textStyles['final-cta-title'];
      const descData = textStyles['final-cta-description'];
      const footerData = textStyles['final-cta-footer'];
      const ctaData = textStyles['final-cta-cta'];
      const secondaryCtaData = textStyles['final-cta-secondary-cta'];
      const iconColorData = textStyles['final-cta-icon-color'];
      
      setCtaData(prev => ({
        ...prev,
        background: bgData?.background_class || 'bg-gradient-hero',
        titleColor: bgData?.text_color_class || titleData?.color_token || 'white',
        descriptionColor: descData?.color_token || 'white',
        footerColor: footerData?.color_token || 'white',
        ctaText: ctaData?.content || prev.ctaText,
        ctaUrl: ctaData?.button_url || '/contact',
        ctaBgColor: ctaData?.button_bg_color || 'primary',
        ctaTextColor: ctaData?.color_token || 'primary-foreground',
        secondaryCtaText: secondaryCtaData?.content || prev.secondaryCtaText,
        secondaryCtaUrl: secondaryCtaData?.button_url || '/architecture',
        secondaryCtaBgColor: secondaryCtaData?.button_bg_color || 'transparent',
        secondaryCtaTextColor: secondaryCtaData?.color_token || 'white',
        iconColor: iconColorData?.color_token || 'white',
      }));
    };
    
    loadCtaData();
  }, [stylesLoaded, backgroundStyles, textStyles, t]);

  // Also fetch directly from DB to ensure latest data
  useEffect(() => {
    const fetchFromDb = async () => {
      // Fetch background
      const { data: bgData } = await supabase
        .from('background_styles')
        .select('background_class, text_color_class')
        .eq('element_id', 'final-cta-background')
        .maybeSingle();
      
      // Fetch CTA buttons
      const { data: textData } = await supabase
        .from('text_content')
        .select('element_id, content, button_url, button_bg_color, color_token')
        .in('element_id', ['final-cta-cta', 'final-cta-secondary-cta', 'final-cta-icon-color']);
      
      if (bgData || textData) {
        setCtaData(prev => {
          const ctaItem = textData?.find(d => d.element_id === 'final-cta-cta');
          const secondaryCtaItem = textData?.find(d => d.element_id === 'final-cta-secondary-cta');
          const iconColorItem = textData?.find(d => d.element_id === 'final-cta-icon-color');
          
          return {
            ...prev,
            background: bgData?.background_class || prev.background,
            titleColor: bgData?.text_color_class || prev.titleColor,
            ctaText: ctaItem?.content || prev.ctaText,
            ctaUrl: ctaItem?.button_url || prev.ctaUrl,
            ctaBgColor: ctaItem?.button_bg_color || prev.ctaBgColor,
            ctaTextColor: ctaItem?.color_token || prev.ctaTextColor,
            secondaryCtaText: secondaryCtaItem?.content || prev.secondaryCtaText,
            secondaryCtaUrl: secondaryCtaItem?.button_url || prev.secondaryCtaUrl,
            secondaryCtaBgColor: secondaryCtaItem?.button_bg_color || prev.secondaryCtaBgColor,
            secondaryCtaTextColor: secondaryCtaItem?.color_token || prev.secondaryCtaTextColor,
            iconColor: iconColorItem?.color_token || prev.iconColor,
          };
        });
      }
    };
    
    fetchFromDb();
  }, []);

  // Get background styles as inline style object
  const getBackgroundStyle = () => {
    const bg = ctaData.background;
    if (!bg) return {};
    
    // Handle gradients
    if (bg.startsWith('bg-gradient-') || bg.startsWith('gradient-')) {
      const varName = bg.replace('bg-', '');
      return { backgroundImage: `var(--${varName})` };
    }
    // Handle glass effects
    if (bg.startsWith('bg-glass-') || bg.startsWith('glass-')) {
      const varName = bg.replace('bg-', '');
      return { backgroundImage: `var(--${varName})` };
    }
    // Handle solid colors
    if (bg.startsWith('bg-')) {
      const colorName = bg.replace('bg-', '');
      return { backgroundColor: `hsl(var(--${colorName}))` };
    }
    return {};
  };

  // Get button styles
  const getButtonStyle = (bgColor: string, textColor: string) => {
    const isGradient = bgColor.startsWith('gradient-') || bgColor.startsWith('glass-');
    const isTransparent = bgColor === 'transparent';
    
    return {
      backgroundColor: isGradient || isTransparent ? undefined : `hsl(var(--${bgColor}))`,
      backgroundImage: isGradient ? `var(--${bgColor})` : undefined,
      color: resolveTextColor(textColor),
    };
  };

  // Dynamic icon component
  const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (icons as Record<string, any>)[name];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const handleSave = async (data: any) => {
    setCtaData(prev => ({
      ...prev,
      background: data.background || prev.background,
      titleColor: data.titleColor || prev.titleColor,
      descriptionColor: data.descriptionColor || prev.descriptionColor,
      ctaText: data.ctaText || prev.ctaText,
      ctaUrl: data.ctaUrl || prev.ctaUrl,
      ctaBgColor: data.ctaBgColor || prev.ctaBgColor,
      ctaTextColor: data.ctaTextColor || prev.ctaTextColor,
      iconColor: data.iconColor || prev.iconColor,
    }));
    
    // Refresh context to get latest data
    await refreshBackgroundStyles();
  };

  return (
    <section className="py-12 md:py-16 lg:py-section" data-header-color="light">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div 
          className="relative overflow-hidden rounded-2xl p-12 md:p-16 text-center"
          style={getBackgroundStyle()}
          onMouseEnter={() => editMode && setIsHovered(true)}
          onMouseLeave={() => editMode && setIsHovered(false)}
        >
          {/* Edit Button - Only in Edit Mode on hover */}
          {editMode && isHovered && (
            <button
              className="absolute top-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-110 transition-transform z-20"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
          
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          
          <BackgroundTextColorProvider textColor={ctaData.titleColor}>
            <div className="relative z-10">
              <EditableTranslation translationKey="final_cta.title">
                <h2 
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: resolveTextColor(ctaData.titleColor) }}
                >
                  {t('final_cta.title', "Let's build your digital workshop")}
                </h2>
              </EditableTranslation>
              
              <EditableTranslation translationKey="final_cta.subtitle">
                <p 
                  className="text-xl max-w-2xl mx-auto mb-8"
                  style={{ color: resolveTextColor(ctaData.descriptionColor) }}
                >
                  {t('final_cta.subtitle', 'Schedule a personalized demo or see how your specific use case can be automated with Navio')}
                </p>
              </EditableTranslation>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 group" 
                  style={getButtonStyle(ctaData.ctaBgColor, ctaData.ctaTextColor)}
                  asChild
                >
                  <LanguageLink to={ctaData.ctaUrl}>
                    <Calendar className="w-5 h-5 mr-2" />
                    <EditableTranslation translationKey="final_cta.button_primary">
                      <span>{t('final_cta.button_primary', 'Book a Demo')}</span>
                    </EditableTranslation>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </LanguageLink>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-white/30 hover:bg-white/10" 
                  style={getButtonStyle(ctaData.secondaryCtaBgColor, ctaData.secondaryCtaTextColor)}
                  asChild
                >
                  <LanguageLink to={ctaData.secondaryCtaUrl}>
                    <EditableTranslation translationKey="final_cta.button_secondary">
                      <span>{t('final_cta.button_secondary', 'See Technical Overview')}</span>
                    </EditableTranslation>
                  </LanguageLink>
                </Button>
              </div>
              
              <EditableTranslation translationKey="final_cta.footer_text">
                <p 
                  className="mt-8 text-sm opacity-70"
                  style={{ color: resolveTextColor(ctaData.footerColor) }}
                >
                  {t('final_cta.footer_text', 'No credit card required • Free consultation • See results in 30 days')}
                </p>
              </EditableTranslation>
            </div>
          </BackgroundTextColorProvider>
        </div>
      </div>
      
      {/* Unified Style Modal */}
      <UnifiedStyleModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        elementIdPrefix="final-cta"
        initialData={{
          background: ctaData.background,
          titleColor: ctaData.titleColor,
          descriptionColor: ctaData.descriptionColor,
          ctaText: ctaData.ctaText,
          ctaUrl: ctaData.ctaUrl,
          ctaBgColor: ctaData.ctaBgColor,
          ctaTextColor: ctaData.ctaTextColor,
          iconColor: ctaData.iconColor,
        }}
        onSave={handleSave}
      />
    </section>
  );
}
