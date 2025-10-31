import { Button } from "@/components/ui/button";
import { ArrowRight, Award } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Hero = () => {
  const { t } = useAppTranslation();
  const { h1, body } = useTypography();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const plugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));
  
  // Media settings state
  const [displayType, setDisplayType] = useState<'image' | 'carousel'>('carousel');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [carouselImages, setCarouselImages] = useState<any[]>([]);
  const [carouselSettings, setCarouselSettings] = useState({
    autoplay: true,
    autoplay_delay: 3500,
    show_navigation: true,
    show_dots: true,
  });

  // Fallback images
  const fallbackImages = [
    {
      image: noddiLocationScreen,
      alt: "Noddi location selection screen showing saved addresses and search functionality",
      title: "Noddi",
    },
    {
      image: tiamatLocationScreen,
      alt: "Tiamat Dekk location selection screen with address delivery confirmation",
      title: "Tiamat Dekk",
    },
    {
      image: hurtigrutaLocationScreen,
      alt: "Hurtigruta Carglass location selection screen with address delivery options",
      title: "Hurtigruta Carglass",
    },
  ];

  useEffect(() => {
    loadMediaSettings();
  }, []);

  const loadMediaSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('image_carousel_settings')
        .select(`
          *,
          carousel_config:carousel_configs(*)
        `)
        .eq('location_id', 'homepage-hero')
        .maybeSingle();

      if (settings) {
        setDisplayType(settings.display_type as 'image' | 'carousel');
        
        if (settings.display_type === 'image') {
          setImageUrl(settings.image_url || '');
          setImageAlt(settings.image_alt || '');
        } else if (settings.carousel_config) {
          const config = settings.carousel_config as any;
          setCarouselSettings({
            autoplay: config.autoplay,
            autoplay_delay: config.autoplay_delay,
            show_navigation: config.show_navigation,
            show_dots: config.show_dots,
          });
          
          // Parse carousel images
          const images = Array.isArray(config.images) ? config.images : [];
          setCarouselImages(images.map((img: any) => ({
            // Convert /src/assets paths to actual imports
            image: img.url.includes('noddi-location-screen') ? noddiLocationScreen :
                   img.url.includes('tiamat-location-screen') ? tiamatLocationScreen :
                   img.url.includes('hurtigruta-location-screen') ? hurtigrutaLocationScreen :
                   img.url,
            alt: img.alt || '',
            title: img.title || '',
          })));
          
          // Update autoplay plugin delay
          if (plugin.current) {
            plugin.current = Autoplay({ 
              delay: config.autoplay_delay,
              stopOnInteraction: true 
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading media settings:', error);
    }
  };

  const bookingSteps = carouselImages.length > 0 ? carouselImages : fallbackImages;

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="py-section relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-[40%_60%] gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <EditableTranslation translationKey="hero.title">
              <h1 className={`${h1} text-foreground`}>{t('hero.title', 'One platform. Every function.')}</h1>
            </EditableTranslation>

            <EditableTranslation translationKey="hero.subtitle">
              <p className={`${body} text-muted-foreground`}>{t('hero.subtitle', 'Booking to billing. Built for automotive services.')}</p>
            </EditableTranslation>

            {/* Metrics Badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-card shadow-lg hover-scale">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <LockedText reason="Metric value - Update in code">
                    <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      NPS <Counter end={90} prefix="~" />
                    </div>
                  </LockedText>
                  <EditableTranslation translationKey="hero.metrics.nps">
                    <div className="text-xs text-muted-foreground">{t('hero.metrics.nps', 'Industry leading')}</div>
                  </EditableTranslation>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div>
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

          {/* Right Column - Booking Flow Carousel or Image */}
          <EditableUniversalMedia
            locationId="homepage-hero"
            onSave={loadMediaSettings}
            placeholder="Click to configure hero image/carousel"
          >
            {displayType === 'carousel' ? (
              <div className="relative max-w-[280px] mx-auto">
                <Carousel
                  setApi={setApi}
                  plugins={carouselSettings.autoplay ? [plugin.current] : []}
                  className="w-full"
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                >
                  <CarouselContent>
                    {bookingSteps.map((step, index) => (
                      <CarouselItem key={index}>
                        <div className="flex items-center">
                          <img
                            src={step.image}
                            alt={step.alt}
                            className="w-full h-auto object-contain transition-opacity duration-500"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {carouselSettings.show_navigation && (
                    <>
                      <CarouselPrevious className="-left-12" />
                      <CarouselNext className="-right-12" />
                    </>
                  )}
                </Carousel>

                {/* Navigation Dots */}
                {carouselSettings.show_dots && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: count }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === current - 1 ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                        aria-label={`Go to step ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative max-w-[280px] mx-auto">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="w-full h-auto object-contain rounded-2xl shadow-xl"
                />
              </div>
            )}
          </EditableUniversalMedia>
        </div>
      </div>
    </section>
  );
};

export default Hero;
