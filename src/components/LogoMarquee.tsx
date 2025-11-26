import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Logo {
  src: string;
  alt: string;
}

export function LogoMarquee() {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    // Try to load from images table with section 'logo-marquee'
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
      // Fallback placeholder logos
      setLogos([
        { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+1', alt: 'Partner 1' },
        { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+2', alt: 'Partner 2' },
        { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+3', alt: 'Partner 3' },
        { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+4', alt: 'Partner 4' },
        { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+5', alt: 'Partner 5' },
        { src: 'https://via.placeholder.com/120x40/000000/FFFFFF?text=Logo+6', alt: 'Partner 6' },
      ]);
    }
  };

  // Ensure we have enough logos to fill a full viewport-wide strip
  const baseLogos = logos.length > 0 ? logos : [];
  const stripLogos = baseLogos.length >= 6
    ? baseLogos
    : baseLogos.length > 0
      ? Array.from({ length: Math.ceil(6 / baseLogos.length) }, () => baseLogos)
          .flat()
          .slice(0, 6)
      : baseLogos;

  const Strip = ({ prefix }: { prefix: string }) => (
    <div className="flex flex-none min-w-full items-center justify-around gap-14">
      {stripLogos.map((logo, i) => (
        <div key={`${prefix}-${i}`} className="flex-shrink-0">
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-6 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section 
      className="w-full overflow-hidden py-8"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12.5%, black 87.5%, transparent 100%)'
      }}
    >
      <div className="flex animate-marquee will-change-transform">
        {/* First strip */}
        <Strip prefix="a" />
        {/* Duplicate strip for seamless loop */}
        <Strip prefix="b" />
      </div>
    </section>
  );
}
