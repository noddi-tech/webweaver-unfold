import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface Logo {
  src: string;
  alt: string;
}

interface LogoMarqueeProps {
  /** CMS images.section filter (default: 'logo-marquee') */
  section?: string;
  /** Translation key for the label above logos */
  labelKey?: string;
  /** Fallback text for the label */
  labelFallback?: string;
  /** Extra classes on the outer section */
  className?: string;
  /** Render logos in grayscale, full-color on hover */
  grayscale?: boolean;
  /** Pause the marquee animation on hover */
  pauseOnHover?: boolean;
  /** Compact padding (py-4 instead of py-8) */
  compact?: boolean;
}

export function LogoMarquee({
  section = 'logo-marquee',
  labelKey = 'hero.trusted_by',
  labelFallback = 'Trusted by leading service providers',
  className,
  grayscale = false,
  pauseOnHover = false,
  compact = false,
}: LogoMarqueeProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useAppTranslation();

  useEffect(() => {
    loadLogos();
  }, [section]);

  const loadLogos = async () => {
    setIsLoading(true);
    try {
      const { data: imageData } = await supabase
        .from('images')
        .select('file_url, alt, title')
        .eq('section', section)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (imageData && imageData.length > 0) {
        setLogos(imageData.map(img => ({
          src: img.file_url,
          alt: img.alt || img.title
        })));
      } else {
        setLogos([]);
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

  const imgClasses = cn(
    "h-8 transition-all duration-300",
    isLoading ? "opacity-0" : "opacity-100",
    grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
  );

  const Strip = ({ prefix }: { prefix: string }) => (
    <div className="flex shrink-0 items-center gap-14">
      {stripLogos.map((logo, i) => (
        <div key={`${prefix}-${i}`} className="flex-shrink-0">
          <img
            src={logo.src}
            alt={logo.alt}
            loading="lazy"
            decoding="async"
            className={imgClasses}
          />
        </div>
      ))}
    </div>
  );

  const TrustedLabel = () => (
    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-center mb-4">
      {t(labelKey, labelFallback)}
    </p>
  );

  const sectionPadding = compact ? 'py-4 md:py-5' : 'py-8';

  // Static display for ≤4 logos
  if (useStaticDisplay) {
    return (
      <section className={cn("w-full", sectionPadding, className)}>
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
                  className={cn("h-8", grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300")}
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
      className={cn("w-full overflow-hidden", sectionPadding, pauseOnHover && "group", className)}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%)'
      }}
    >
      <TrustedLabel />
      
      {isLoading && (
        <div className="flex justify-around gap-14 px-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-28 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      )}
      
      <div className={cn(
        "flex gap-14 animate-marquee transition-opacity duration-300",
        isLoading ? "opacity-0 absolute" : "opacity-100",
        pauseOnHover && "group-hover:[animation-play-state:paused]"
      )}>
        <Strip prefix="a" />
        <Strip prefix="b" />
      </div>
    </section>
  );
}
