import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface Logo {
  src: string;
  alt: string;
}

export function LogoMarquee() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useAppTranslation();

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    setIsLoading(true);
    try {
      const { data: imageData } = await supabase
        .from('images')
        .select('file_url, alt, title')
        .eq('section', 'logo-marquee')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (imageData && imageData.length > 0) {
        setLogos(imageData.map(img => ({
          src: img.file_url,
          alt: img.alt || img.title
        })));
      } else {
        setLogos([
          { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+1', alt: 'Partner 1' },
          { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+2', alt: 'Partner 2' },
          { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+3', alt: 'Partner 3' },
          { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+4', alt: 'Partner 4' },
          { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+5', alt: 'Partner 5' },
          { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+6', alt: 'Partner 6' },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const baseLogos = logos.length > 0 ? logos : [];
  const useStaticDisplay = baseLogos.length > 0 && baseLogos.length <= 4;

  // For marquee: ensure enough logos to fill strip
  const stripLogos = baseLogos.length >= 6
    ? baseLogos
    : baseLogos.length > 0
      ? Array.from({ length: Math.ceil(6 / baseLogos.length) }, () => baseLogos)
          .flat()
          .slice(0, 6)
      : baseLogos;

  const Strip = ({ prefix }: { prefix: string }) => (
    <div className="flex shrink-0 items-center gap-14">
      {stripLogos.map((logo, i) => (
        <div key={`${prefix}-${i}`} className="flex-shrink-0">
          <img
            src={logo.src}
            alt={logo.alt}
            loading="lazy"
            decoding="async"
            className={cn(
              "h-8 transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />
        </div>
      ))}
    </div>
  );

  // "Trusted by" label
  const TrustedLabel = () => (
    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-center mb-4">
      {t('hero.trusted_by', 'Trusted by leading Nordic service providers')}
    </p>
  );

  // Static display for ≤4 logos
  if (useStaticDisplay) {
    return (
      <section className="w-full py-8">
        <TrustedLabel />
        {isLoading ? (
          <div className="flex justify-center gap-14 px-8">
            {baseLogos.map((_, i) => (
              <div key={i} className="h-8 w-28 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-10 sm:gap-14 px-8">
            {baseLogos.map((logo, i) => (
              <div key={i} className="flex-shrink-0">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-8"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Scrolling marquee for 5+ logos
  return (
    <section 
      className="w-full overflow-hidden py-8"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%)'
      }}
    >
      <TrustedLabel />
      
      {/* Skeleton while loading */}
      {isLoading && (
        <div className="flex justify-around gap-14 px-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-28 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      )}
      
      <div className={cn(
        "flex gap-14 animate-marquee transition-opacity duration-300",
        isLoading ? "opacity-0 absolute" : "opacity-100"
      )}>
        <Strip prefix="a" />
        <Strip prefix="b" />
      </div>
    </section>
  );
}
