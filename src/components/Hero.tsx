import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LanguageLink } from "@/components/LanguageLink";
import navioLocationScreen from "@/assets/navio-location-screen.png";
import tiamatLocationScreen from "@/assets/tiamat-location-screen.png";
import hurtigrutaLocationScreen from "@/assets/hurtigruta-location-screen.png";
import { useState, useEffect, useRef } from "react";
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
import { RotatingHeadline } from "@/components/RotatingHeadline";
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
  const [translationKey, setTranslationKey] = useState(0);
  
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
    { url: navioLocationScreen, alt: "Navio location screen" },
    { url: tiamatLocationScreen, alt: "Tiamat location screen" },
    { url: hurtigrutaLocationScreen, alt: "Hurtigruta location screen" },
  ];

  useEffect(() => {
    loadMediaSettings();
  }, []);

  useEffect(() => {
    const handleTranslationUpdate = () => {
      setTranslationKey(prev => prev + 1);
    };
    window.addEventListener('translation-updated', handleTranslationUpdate);
    return () => window.removeEventListener('translation-updated', handleTranslationUpdate);
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

  // Container fills parent, fitMode is dynamic based on database settings
  const containerClasses = 'w-full h-full';
  const fitModeClass = mediaSettings.fitMode === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <section className="pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 px-2.5">
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
        <div className="container max-w-container px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col items-center text-center gap-6 sm:gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <RotatingHeadline 
              className={`${h1} text-foreground text-center`}
              rotationInterval={4000}
            />

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
            <div className="w-full mt-4 sm:mt-6">
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
                  <div className="w-full bg-transparent rounded-xl overflow-hidden aspect-[2/1] max-h-[500px]">
                    {mediaSettings.displayType === 'carousel' && carouselImages.length > 0 ? (
                      <Carousel
                        key={`hero-carousel-${mediaKey}`}
                        setApi={setApi}
                        opts={{ align: "center", loop: true }}
                        plugins={[Autoplay({ delay: mediaSettings.autoplayDelay || 5000, stopOnInteraction: false })]}
                        className="w-full h-full"
                      >
                        <CarouselContent>
                          {carouselImages.map((image, index) => (
                            <CarouselItem key={`hero-slide-${index}`} className="h-full">
                  <div className={`${containerClasses} rounded-xl overflow-hidden`}>
                                <OptimizedImage
                                  src={image.url}
                                  alt={image.alt || `Hero slide ${index + 1}`}
                                  className={`w-full h-full ${fitModeClass} rounded-xl`}
                                  containerClassName="h-full"
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
                      <div className={`${containerClasses} rounded-xl overflow-hidden`}>
                        <OptimizedImage
                          src={mediaSettings.imageUrl || ''}
                          alt={mediaSettings.imageAlt || 'Hero image'}
                          className={`w-full h-full ${fitModeClass} rounded-xl`}
                          containerClassName="h-full"
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
                  <div className="py-4 sm:py-6 lg:py-8 px-2 sm:px-4 md:px-6 relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 rounded-full" style={{ 
                        background: 'radial-gradient(circle, hsl(var(--vibrant-purple) / 0.25) 0%, transparent 70%)'
                      }} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
                      {/* Capacity USP */}
                      <div className="flex flex-col items-center text-center space-y-2">
                        <CheckCircle2 className="w-5 h-5 text-foreground" />
                        <div>
                          <EditableTranslation translationKey="hero.usp1.title" fallbackText="Capacity opens itself. Teams stay in flow.">
                            <h3 className="font-semibold text-white mb-1 text-sm sm:text-base lg:text-lg">Capacity opens itself. Teams stay in flow.</h3>
                          </EditableTranslation>
                          <EditableTranslation translationKey="hero.usp1.description" fallbackText="Automatic slotting and crew scheduling — no more bottlenecks.">
                            <p className="text-sm text-white/70">Automatic slotting and crew scheduling — no more bottlenecks.</p>
                          </EditableTranslation>
                        </div>
                      </div>

                      {/* Schedules USP */}
                      <div className="flex flex-col items-center text-center space-y-2">
                        <CheckCircle2 className="w-5 h-5 text-foreground" />
                        <div>
                          <EditableTranslation translationKey="hero.usp2.title" fallbackText="Schedules adapt. Every job starts on time.">
                            <h3 className="font-semibold text-white mb-1 text-sm sm:text-base lg:text-lg">Schedules adapt. Every job starts on time.</h3>
                          </EditableTranslation>
                          <EditableTranslation translationKey="hero.usp2.description" fallbackText="Intelligent planning and live re-sequencing for mobile and garage services.">
                            <p className="text-sm text-white/70">Intelligent planning and live re-sequencing for mobile and garage services.</p>
                          </EditableTranslation>
                        </div>
                      </div>

                      {/* Customers USP */}
                      <div className="flex flex-col items-center text-center space-y-2">
                        <CheckCircle2 className="w-5 h-5 text-foreground" />
                        <div>
                          <EditableTranslation translationKey="hero.usp3.title" fallbackText="Customers in control. Loved by end users.">
                            <h3 className="font-semibold text-white mb-1 text-sm sm:text-base lg:text-lg">Customers in control. Loved by end users.</h3>
                          </EditableTranslation>
                          <EditableTranslation translationKey="hero.usp3.description" fallbackText="Self-service booking, inspection, payment transparency — NPS ≈ 90.">
                            <p className="text-sm text-white/70">Self-service booking, inspection, payment transparency — NPS ≈ 90.</p>
                          </EditableTranslation>
                        </div>
                      </div>
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
