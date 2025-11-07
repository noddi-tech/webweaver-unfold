import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageLink } from "@/components/LanguageLink";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EditableSolutionText } from "@/components/EditableSolutionText";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { EditableButton } from "@/components/EditableButton";
import { KeyBenefitItem } from "@/components/KeyBenefitItem";
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

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroDisplayType, setHeroDisplayType] = useState<'image' | 'carousel'>('image');

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
      
      // Refresh the solution data
      setRefreshKey(prev => prev + 1);
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
          <p className="text-muted-foreground">Loading solution...</p>
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
          <h1 className="text-4xl font-bold mb-4 text-foreground">Solution Not Found</h1>
          <p className="text-muted-foreground mb-8">The solution you're looking for doesn't exist.</p>
          <Button asChild>
            <LanguageLink to="/solutions">View All Solutions</LanguageLink>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-6 pt-24 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LanguageLink to="/">Home</LanguageLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LanguageLink to="/solutions">Solutions</LanguageLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{solution.title}</BreadcrumbPage>
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
                  <EditableSolutionText 
                    solutionId={solution.id} 
                    field="hero_subtitle"
                    onSave={handleContentSave}
                  >
                    <p className="text-primary font-semibold mb-4 text-lg">
                      {solution.hero_subtitle}
                    </p>
                  </EditableSolutionText>
                )}
                <EditableSolutionText 
                  solutionId={solution.id} 
                  field="hero_title"
                  onSave={handleContentSave}
                >
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                    {solution.hero_title}
                  </h1>
                </EditableSolutionText>
                {solution.hero_description && (
                  <EditableSolutionText 
                    solutionId={solution.id} 
                    field="hero_description"
                    onSave={handleContentSave}
                  >
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                      {solution.hero_description}
                    </p>
                  </EditableSolutionText>
                )}
                {solution.hero_cta_text && solution.hero_cta_url && (
                  <EditableButton
                    buttonText={solution.hero_cta_text}
                    buttonUrl={solution.hero_cta_url}
                    onSave={(text, url) => handleButtonSave('hero_cta_text', 'hero_cta_url', text, url)}
                  >
                    <Button size="lg" className="text-lg px-8" asChild>
                      <LanguageLink to={solution.hero_cta_url}>
                        {solution.hero_cta_text}
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
                      alt={solution.hero_title || ''}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </EditableUniversalMedia>
            </div>
          </div>
        </section>
      )}

      {/* Description Section */}
      {solution.description_heading && (
        <section className="py-20 px-6 bg-muted/20">
          <div className="container mx-auto max-w-4xl text-center">
            <EditableSolutionText 
              solutionId={solution.id} 
              field="description_heading"
              onSave={handleContentSave}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {solution.description_heading}
              </h2>
            </EditableSolutionText>
            {solution.description_text && (
              <EditableSolutionText 
                solutionId={solution.id} 
                field="description_text"
                onSave={handleContentSave}
              >
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {solution.description_text}
                </p>
              </EditableSolutionText>
            )}
          </div>
        </section>
      )}

      {/* Key Benefits Section */}
      {solution.key_benefits && solution.key_benefits.length > 0 && (
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-7xl space-y-24">
            {solution.key_benefits.map((benefit, index) => (
              <KeyBenefitItem
                key={benefit.id}
                benefit={benefit}
                solutionId={solution.id}
                benefitIndex={index}
                onContentSave={handleContentSave}
                onImageSave={handleKeyBenefitImageSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* Solution Footer / CTA Section */}
      {solution.footer_heading && (
        <section className="py-20 px-6 bg-gradient-primary">
          <div className="container mx-auto max-w-4xl text-center">
            <EditableSolutionText 
              solutionId={solution.id} 
              field="footer_heading"
              onSave={handleContentSave}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
                {solution.footer_heading}
              </h3>
            </EditableSolutionText>
            {solution.footer_text && (
              <EditableSolutionText 
                solutionId={solution.id} 
                field="footer_text"
                onSave={handleContentSave}
              >
                <p className="text-xl text-primary-foreground/90 mb-8">
                  {solution.footer_text}
                </p>
              </EditableSolutionText>
            )}
            {solution.footer_cta_text && solution.footer_cta_url && (
              <EditableButton
                buttonText={solution.footer_cta_text}
                buttonUrl={solution.footer_cta_url}
                onSave={(text, url) => handleButtonSave('footer_cta_text', 'footer_cta_url', text, url)}
              >
                <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                  <LanguageLink to={solution.footer_cta_url}>
                    {solution.footer_cta_text}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </LanguageLink>
                </Button>
              </EditableButton>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default SolutionDetail;
