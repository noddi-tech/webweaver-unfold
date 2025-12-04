import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageLink } from "@/components/LanguageLink";
import { ArrowRight, icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EditableTranslation } from "@/components/EditableTranslation";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { EditableButton } from "@/components/EditableButton";
import { AlternatingContentSection } from "@/components/AlternatingContentSection";
import { EditableKeyBenefit } from "@/components/EditableKeyBenefit";
import { EditableImage } from "@/components/EditableImage";
import { EditableBackground } from "@/components/EditableBackground";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface KeyBenefit {
  id: string;
  heading: string;
  description: string;
  imageUrl: string;
}

interface Solution {
  id: string;
  title: string;
  slug: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  hero_cta_text: string | null;
  hero_cta_url: string | null;
  description_heading: string | null;
  description_text: string | null;
  key_benefits: KeyBenefit[];
  footer_heading: string | null;
  footer_text: string | null;
  footer_cta_text: string | null;
  footer_cta_url: string | null;
}

// Convert slug format (tire-services) to translation key format (tire_services)
const slugToKey = (slug: string) => slug.replace(/-/g, '_');

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useAppTranslation();
  const { allowedBackgrounds } = useAllowedBackgrounds();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Button styling state
  const [footerCtaBgColor, setFooterCtaBgColor] = useState('primary');
  const [footerCtaIcon, setFooterCtaIcon] = useState('');
  const [footerCtaTextColor, setFooterCtaTextColor] = useState('white');
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroDisplayType, setHeroDisplayType] = useState<'image' | 'carousel'>('image');

  // Get the translation key from slug
  const slugKey = slug ? slugToKey(slug) : '';

  useEffect(() => {
    const loadSolution = async () => {
      if (!slug) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (error) {
        console.error("Error loading solution:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setSolution({
          ...data,
          key_benefits: Array.isArray(data.key_benefits) 
            ? data.key_benefits.map((kb: any, idx: number) => ({
                id: String(idx),
                heading: kb.heading || "",
                description: kb.text || kb.description || "",
                imageUrl: kb.imageUrl || kb.image_url || ""
              }))
            : []
        });
        
        // Initialize button styling state
        setFooterCtaBgColor(data.footer_cta_bg_color || 'primary');
        setFooterCtaIcon(data.footer_cta_icon || '');
        setFooterCtaTextColor(data.footer_cta_text_color || 'white');
        
        // Load hero media settings
        loadHeroMediaSettings();
      }
      setLoading(false);
    };

    loadSolution();
  }, [slug, refreshKey]);

  const loadHeroMediaSettings = async () => {
    if (!slug) return;
    
    try {
      const { data: settings } = await supabase
        .from('image_carousel_settings')
        .select('*')
        .eq('location_id', `solution-hero-${slug}`)
        .maybeSingle();

      if (settings) {
        setHeroDisplayType(settings.display_type as 'image' | 'carousel');
        
        if (settings.display_type === 'image' && settings.image_url) {
          setHeroImageUrl(settings.image_url);
        }
      }
    } catch (error) {
      console.error('Error loading hero media settings:', error);
    }
  };

  const handleContentSave = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleButtonSave = async (textField: string, urlField: string, text: string, url: string) => {
    if (!solution) return;
    
    try {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          [textField]: text,
          [urlField]: url 
        })
        .eq('id', solution.id);

      if (error) throw error;
      
      // Update local state directly to preserve component state
      setSolution(prev => prev ? {
        ...prev,
        [textField]: text,
        [urlField]: url
      } : null);
    } catch (error) {
      console.error('Error saving button:', error);
    }
  };

  const handleImageSave = async (field: string, newUrl: string) => {
    if (!solution) return;
    
    try {
      const { error } = await supabase
        .from('solutions')
        .update({ [field]: newUrl })
        .eq('id', solution.id);

      if (error) throw error;
      
      // Refresh the solution data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleKeyBenefitImageSave = async (benefitIndex: number, newUrl: string) => {
    if (!solution) return;

    try {
      const benefits = [...solution.key_benefits] as any[];
      if (benefits[benefitIndex]) {
        benefits[benefitIndex].imageUrl = newUrl;
        // Also update image_url if it exists
        if ('image_url' in benefits[benefitIndex]) {
          benefits[benefitIndex].image_url = newUrl;
        }

        const { error } = await supabase
          .from('solutions')
          .update({ key_benefits: benefits })
          .eq('id', solution.id);

        if (error) throw error;
        
        // Refresh the solution data
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving benefit image:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">{t('solutions.page.loading', 'Loading solution...')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {t('solutions.page.not_found_title', 'Solution Not Found')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('solutions.page.not_found_text', "The solution you're looking for doesn't exist.")}
          </p>
          <Button asChild>
            <LanguageLink to="/solutions">{t('solutions.page.view_all', 'View All Solutions')}</LanguageLink>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Dynamic icon component for button
  const DynamicIcon = ({ name }: { name: string }) => {
    const IconComponent = (icons as Record<string, any>)[name];
    return IconComponent ? <IconComponent className="ml-2 h-4 w-4" /> : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-6 pt-24 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LanguageLink to="/">{t('nav.home', 'Home')}</LanguageLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LanguageLink to="/solutions">{t('nav.solutions', 'Solutions')}</LanguageLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t(`solutions.${slugKey}.title`, solution.title)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Hero Section */}
      {solution.hero_title && (
        <section className="pt-8 pb-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {solution.hero_subtitle && (
                  <EditableTranslation
                    translationKey={`solutions.${slugKey}.hero_subtitle`}
                    fallbackText={solution.hero_subtitle}
                  >
                    <p className="text-primary font-semibold mb-4 text-lg">
                      {t(`solutions.${slugKey}.hero_subtitle`, solution.hero_subtitle)}
                    </p>
                  </EditableTranslation>
                )}
                <EditableTranslation
                  translationKey={`solutions.${slugKey}.hero_title`}
                  fallbackText={solution.hero_title}
                >
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                    {t(`solutions.${slugKey}.hero_title`, solution.hero_title)}
                  </h1>
                </EditableTranslation>
                {solution.hero_description && (
                  <EditableTranslation
                    translationKey={`solutions.${slugKey}.hero_description`}
                    fallbackText={solution.hero_description}
                  >
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                      {t(`solutions.${slugKey}.hero_description`, solution.hero_description)}
                    </p>
                  </EditableTranslation>
                )}
                {solution.hero_cta_text && solution.hero_cta_url && (
                  <EditableButton
                    buttonText={t(`solutions.${slugKey}.hero_cta_text`, solution.hero_cta_text)}
                    buttonUrl={solution.hero_cta_url}
                    onSave={(text, url) => handleButtonSave('hero_cta_text', 'hero_cta_url', text, url)}
                  >
                    <Button size="lg" className="text-lg px-8" asChild>
                      <LanguageLink to={solution.hero_cta_url}>
                        {t(`solutions.${slugKey}.hero_cta_text`, solution.hero_cta_text)}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </LanguageLink>
                    </Button>
                  </EditableButton>
                )}
              </div>
              <EditableUniversalMedia
                locationId={`solution-hero-${slug}`}
                onSave={() => {
                  loadHeroMediaSettings();
                  setRefreshKey(prev => prev + 1);
                }}
                placeholder="Add hero image or carousel"
              >
                {heroDisplayType === 'image' && heroImageUrl && (
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={heroImageUrl} 
                      alt={t(`solutions.${slugKey}.hero_title`, solution.hero_title || '')}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </EditableUniversalMedia>
            </div>
          </div>
        </section>
      )}

      {/* Key Benefits Section */}
      {solution.key_benefits && solution.key_benefits.length > 0 && (
        <AlternatingContentSection
          items={solution.key_benefits}
          showContinuousAccentBar={true}
          accentBarGradient="--gradient-warmth"
          sectionTitle={
            solution.description_heading && (
              <EditableTranslation
                translationKey={`solutions.${slugKey}.description_heading`}
                fallbackText={solution.description_heading}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                  {t(`solutions.${slugKey}.description_heading`, solution.description_heading)}
                </h2>
              </EditableTranslation>
            )
          }
          sectionDescription={
            solution.description_text && (
              <EditableTranslation
                translationKey={`solutions.${slugKey}.description_text`}
                fallbackText={solution.description_text}
              >
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {t(`solutions.${slugKey}.description_text`, solution.description_text)}
                </p>
              </EditableTranslation>
            )
          }
          enableScrollReveal={true}
          sectionSpacing="2xl"
          maxWidth="6xl"
          sectionBackground="none"
          cardOptions={{
            alternateLayout: true,
            cardStyle: 'transparent',
            borderRadius: 'xl',
            padding: 'none',
            imageAspectRatio: '1/1',
          }}
          renderCardHeading={(item, index) => (
            <EditableKeyBenefit
              solutionId={solution.id}
              benefitIndex={index}
              field="heading"
              onSave={handleContentSave}
            >
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {item.heading}
              </h3>
            </EditableKeyBenefit>
          )}
          renderCardDescription={(item, index) => (
            <EditableKeyBenefit
              solutionId={solution.id}
              benefitIndex={index}
              field="description"
              onSave={handleContentSave}
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </EditableKeyBenefit>
          )}
          renderCardImage={(item, index) => (
            <EditableImage
              imageUrl={item.imageUrl || null}
              onSave={(newUrl) => handleKeyBenefitImageSave(index, newUrl)}
              altText={item.heading}
              placeholder="Add benefit image"
              aspectRatio="4/3"
            >
              {item.imageUrl && (
                <img 
                  src={item.imageUrl}
                  alt={item.heading}
                  className="w-full h-full object-cover"
                />
              )}
            </EditableImage>
          )}
        />
      )}

      {/* Solution Footer / CTA Section */}
      {solution.footer_heading && (
        <section className="py-section">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <EditableBackground
              elementId={`solution-footer-cta-${slug}`}
              defaultBackground="bg-gradient-hero"
              allowedBackgrounds={allowedBackgrounds}
            >
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-12 md:p-16 text-center">
                <EditableTranslation
                  translationKey={`solutions.${slugKey}.footer_heading`}
                  fallbackText={solution.footer_heading}
                >
                  <h3 className="text-4xl md:text-5xl font-bold mb-6">
                    {t(`solutions.${slugKey}.footer_heading`, solution.footer_heading)}
                  </h3>
                </EditableTranslation>
                {solution.footer_text && (
                  <EditableTranslation
                    translationKey={`solutions.${slugKey}.footer_text`}
                    fallbackText={solution.footer_text}
                  >
                    <p className="text-xl mb-10 opacity-95 leading-relaxed">
                      {t(`solutions.${slugKey}.footer_text`, solution.footer_text)}
                    </p>
                  </EditableTranslation>
                )}
                {solution.footer_cta_text && solution.footer_cta_url && (
                  <EditableButton
                    buttonText={t(`solutions.${slugKey}.footer_cta_text`, solution.footer_cta_text)}
                    buttonUrl={solution.footer_cta_url}
                    buttonBgColor={footerCtaBgColor}
                    buttonIcon={footerCtaIcon}
                    buttonTextColor={footerCtaTextColor}
                    onSave={async (text, url) => {
                      await handleButtonSave('footer_cta_text', 'footer_cta_url', text, url);
                    }}
                    onBgColorChange={async (color) => {
                      setFooterCtaBgColor(color);
                      const { error } = await supabase
                        .from('solutions')
                        .update({ footer_cta_bg_color: color })
                        .eq('id', solution.id);
                      if (error) {
                        console.error('Error updating button bg color:', error);
                        toast.error('Failed to update button color');
                      }
                    }}
                    onIconChange={async (icon) => {
                      setFooterCtaIcon(icon);
                      const { error } = await supabase
                        .from('solutions')
                        .update({ footer_cta_icon: icon })
                        .eq('id', solution.id);
                      if (error) {
                        console.error('Error updating button icon:', error);
                        toast.error('Failed to update button icon');
                      }
                    }}
                    onTextColorChange={async (color) => {
                      setFooterCtaTextColor(color);
                      const { error } = await supabase
                        .from('solutions')
                        .update({ footer_cta_text_color: color })
                        .eq('id', solution.id);
                      if (error) {
                        console.error('Error updating button text color:', error);
                        toast.error('Failed to update button text color');
                      }
                    }}
                  >
                    <Button 
                      size="lg" 
                      className="text-lg px-8"
                      style={{
                        backgroundColor: `hsl(var(--${footerCtaBgColor}))`,
                        color: footerCtaTextColor === 'white' ? 'white' : `hsl(var(--${footerCtaTextColor}))`
                      }}
                      asChild
                    >
                      <LanguageLink to={solution.footer_cta_url}>
                        {t(`solutions.${slugKey}.footer_cta_text`, solution.footer_cta_text)}
                        {footerCtaIcon ? <DynamicIcon name={footerCtaIcon} /> : <ArrowRight className="ml-2 h-4 w-4" />}
                      </LanguageLink>
                    </Button>
                  </EditableButton>
                )}
              </div>
            </EditableBackground>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default SolutionDetail;