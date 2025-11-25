import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Sparkles, Target, Users } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import noddiLocationScreen from "@/assets/noddi-location-screen.png";
import tiamatLocationScreen from "@/assets/tiamat-location-screen.png";
import hurtigrutaLocationScreen from "@/assets/hurtigruta-location-screen.png";
import { useState, useEffect, useRef } from "react";
import { Counter } from "@/components/ui/counter";
import { useTypography } from "@/hooks/useTypography";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { LockedText } from "@/components/LockedText";
import { EditableUniversalMedia } from "@/components/EditableUniversalMedia";
import { EditableBackground } from "@/components/EditableBackground";
import { EditableIcon } from "@/components/EditableIcon";
import { useAllowedBackgrounds } from "@/hooks/useAllowedBackgrounds";
import { supabase } from "@/integrations/supabase/client";
import { LogoMarquee } from "@/components/LogoMarquee";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { OptimizedImage } from "@/components/OptimizedImage";

const Hero = () => {
  const { t } = useAppTranslation();
  const { h1, body } = useTypography();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [mediaKey, setMediaKey] = useState(0);
  const { allowedBackgrounds } = useAllowedBackgrounds();
  
  const [isLoading, setIsLoading] = useState(true);
  const [mediaSettings, setMediaSettings] = useState({
    displayType: 'carousel' as 'image' | 'carousel',
    imageUrl: '',
    imageAlt: '',
    autoplayDelay: 5000,
    showNavigation: true,
    showDots: true,
    fitMode: 'contain' as 'contain' | 'cover',
    aspectRatio: 'auto',
  });
  const [carouselImages, setCarouselImages] = useState<any[]>([]);

  const fallbackImages = [
    { url: noddiLocationScreen, alt: "Noddi location screen" },
    { url: tiamatLocationScreen, alt: "Tiamat location screen" },
    { url: hurtigrutaLocationScreen, alt: "Hurtigruta location screen" },
  ];

  useEffect(() => {
    loadMediaSettings();
  }, []);

  const loadMediaSettings = async () => {
    setIsLoading(true);
    try {
      const { data: settings, error } = await supabase
        .from('image_carousel_settings')
        .select('*')
        .eq('location_id', 'homepage-hero')
        .maybeSingle();

      if (!error && settings) {
        setMediaSettings({
          displayType: settings.display_type as 'image' | 'carousel',
          imageUrl: settings.image_url || '',
          imageAlt: settings.image_alt || '',
          autoplayDelay: 5000,
          showNavigation: true,
          showDots: true,
          fitMode: (settings.fit_mode as 'contain' | 'cover') || 'contain',
          aspectRatio: settings.aspect_ratio || 'auto',
        });

        if (settings.display_type === 'carousel' && settings.carousel_config_id) {
          const { data: carouselConfig } = await supabase
            .from('carousel_configs')
            .select('*')
            .eq('id', settings.carousel_config_id)
            .single();

          if (carouselConfig?.images) {
            const images = Array.isArray(carouselConfig.images) ? carouselConfig.images : [];
            setCarouselImages(images.length > 0 ? images : fallbackImages);
          }
        }
        
        setMediaKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSave = () => {
    loadMediaSettings();
  };

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  // Container is always fixed at 2:1 aspect ratio
  const containerClasses = 'w-full aspect-[2/1] max-h-[500px]';
  // Only fitMode is dynamic based on database settings
  const fitModeClass = mediaSettings.fitMode === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <section className="pt-32 pb-12 px-4 sm:px-8 lg:px-12">
      {/* Card-encapsulated gradient section */}
      <div className="rounded-3xl overflow-hidden relative">
        {/* Gradient background inside card */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, white 0%, white 10%, hsl(266 85% 58% / 0.15) 30%, hsl(321 59% 85% / 0.5) 55%, hsl(266 85% 58% / 0.85) 100%)'
          }}
        />

        {/* Content constrained to container */}
        <div className="container max-w-container px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="flex flex-col items-center text-center gap-12">
          {/* Text Content */}
          <div className="space-y-8">
            <EditableTranslation translationKey="hero.title">
              <h1 className={`${h1} text-foreground text-center`}>{t('hero.title', 'One platform. Every function.')}</h1>
            </EditableTranslation>

            <EditableTranslation translationKey="hero.subtitle">
              <p className={`${body} text-muted-foreground text-center`}>{t('hero.subtitle', 'Booking to billing. Built for automotive services.')}</p>
            </EditableTranslation>


            {/* CTA Button */}
            <div className="flex justify-center">
              <LanguageLink to="/contact">
                <EditableTranslation translationKey="hero.cta">
                  <Button size="lg" className="text-lg px-8 py-4 group shadow-lg">
                    {t('hero.cta', 'Get a Demo')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </EditableTranslation>
              </LanguageLink>
            </div>
          </div>

          {/* Logo Marquee */}
          <div className="w-full mt-16">
            <LogoMarquee />
          </div>

          {/* Product Image with USP Section */}
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <EditableUniversalMedia
              locationId="homepage-hero"
              onSave={handleMediaSave}
              placeholder="Add hero image or carousel"
            >
              {(mediaSettings.displayType === 'carousel' && carouselImages.length > 0) || 
               (mediaSettings.displayType === 'image' && mediaSettings.imageUrl) ? (
                <div className="w-full space-y-12">
                  {/* Image/Carousel section with shadow for depth */}
                  <div className="w-full bg-background rounded-xl overflow-hidden shadow-2xl">
                    {mediaSettings.displayType === 'carousel' && carouselImages.length > 0 ? (
                      <Carousel
                        key={`hero-carousel-${mediaKey}`}
                        setApi={setApi}
                        opts={{ align: "center", loop: true }}
                        plugins={[Autoplay({ delay: mediaSettings.autoplayDelay || 5000, stopOnInteraction: false })]}
                        className="w-full"
                      >
                        <CarouselContent>
                          {carouselImages.map((image, index) => (
                            <CarouselItem key={`hero-slide-${index}`}>
                  <div className={containerClasses}>
                                <OptimizedImage
                                  src={image.url}
                                  alt={image.alt || `Hero slide ${index + 1}`}
                                  className={`w-full h-full ${fitModeClass}`}
                                  width={1920}
                                  height={1080}
                                  quality={95}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {mediaSettings.showNavigation && (
                          <>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                          </>
                        )}
                      </Carousel>
                    ) : (
                      <div className={containerClasses}>
                        <OptimizedImage
                          src={mediaSettings.imageUrl || ''}
                          alt={mediaSettings.imageAlt || 'Hero image'}
                          className={`w-full h-full ${fitModeClass}`}
                          width={1920}
                          height={1080}
                          quality={95}
                        />
                      </div>
                    )}
                    {mediaSettings.showDots && mediaSettings.displayType === 'carousel' && carouselImages.length > 1 && (
                      <div className="flex justify-center gap-2 mt-6 pb-4">
                        {carouselImages.map((_, index) => (
                          <button
                            key={`hero-dot-${index}`}
                            onClick={() => api?.scrollTo(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              current === index ? "bg-primary w-8" : "bg-primary/30 hover:bg-primary/50"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* USP section - directly on page gradient */}
                  <div className="py-12 px-4 md:px-8 relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 rounded-full" style={{ 
                        background: 'radial-gradient(circle, hsl(var(--vibrant-purple) / 0.25) 0%, transparent 70%)'
                      }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                      {/* NPS Badge - First USP Item */}
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.2)' }}>
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white mb-2">
                            Net Promoter Score <Counter end={90} prefix="~" />
                          </h3>
                          <EditableTranslation translationKey="hero.metrics.nps" fallbackText="from end customers">
                            <p className="text-sm text-white/80">from end customers</p>
                          </EditableTranslation>
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.2)' }}>
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <EditableTranslation translationKey="hero.feature1.title" fallbackText="Discover freely">
                            <h3 className="font-semibold text-lg text-white mb-2">Discover freely</h3>
                          </EditableTranslation>
                          <EditableTranslation translationKey="hero.feature1.description" fallbackText="Get instant notifications for every interaction">
                            <p className="text-sm text-white/80">Get instant notifications for every interaction</p>
                          </EditableTranslation>
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.2)' }}>
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <EditableTranslation translationKey="hero.feature2.title" fallbackText="Understand behavior">
                            <h3 className="font-semibold text-lg text-white mb-2">Understand behavior</h3>
                          </EditableTranslation>
                          <EditableTranslation translationKey="hero.feature2.description" fallbackText="Track user journeys and engagement patterns">
                            <p className="text-sm text-white/80">Track user journeys and engagement patterns</p>
                          </EditableTranslation>
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--background) / 0.2)' }}>
                          <Target className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <EditableTranslation translationKey="hero.feature3.title" fallbackText="Act with confidence">
                            <h3 className="font-semibold text-lg text-white mb-2">Act with confidence</h3>
                          </EditableTranslation>
                          <EditableTranslation translationKey="hero.feature3.description" fallbackText="Make data-driven decisions that drive growth">
                            <p className="text-sm text-white/80">Make data-driven decisions that drive growth</p>
                          </EditableTranslation>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex justify-center mt-12">
                      <LanguageLink to="/contact">
                        <Button size="lg" className="text-lg px-8 py-4 group shadow-lg bg-white text-primary hover:bg-white/90">
                          <EditableTranslation translationKey="hero.cta" fallbackText="Get a Demo">
                            <span>Get a Demo</span>
                          </EditableTranslation>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </LanguageLink>
                    </div>
                  </div>
                </div>
              ) : null}
            </EditableUniversalMedia>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default Hero;
