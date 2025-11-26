import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { useRotatingTerms } from '@/hooks/useRotatingTerms';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button } from '@/components/ui/button';
import { EditableTranslation } from '@/components/EditableTranslation';

interface RotatingHeadlineProps {
  className?: string;
  rotationInterval?: number;
}

export function RotatingHeadline({ 
  className = '', 
  rotationInterval = 4000 
}: RotatingHeadlineProps) {
  const { terms, loading } = useRotatingTerms();
  const { t } = useAppTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }
    
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPlaying(false);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Rotation logic
  useEffect(() => {
    if (!isPlaying || loading || terms.length === 0) return;

    const interval = setInterval(() => {
      setIsFading(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % terms.length);
        setIsFading(false);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [isPlaying, loading, terms.length, rotationInterval]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  if (loading || terms.length === 0) {
    return (
      <div className={className}>
        <h1 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl whitespace-nowrap">
          <span>ERP</span>
          <EditableTranslation 
            translationKey="hero.rotating.suffix"
            fallbackText="for mobile & workshop car services."
          >
            <span>for mobile & workshop car services.</span>
          </EditableTranslation>
        </h1>
        <div className="flex items-start justify-center gap-2 mt-4">
          <span className="text-muted-foreground text-xl">↳</span>
          <span className="text-muted-foreground text-lg">One platform. Every function.</span>
        </div>
      </div>
    );
  }

  const currentTerm = terms[currentIndex];
  const termText = t(currentTerm.term_key, currentTerm.term_fallback);
  const descText = t(currentTerm.descriptor_key, currentTerm.descriptor_fallback);

  return (
    <div className={`${className} relative`}>
      <h1 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl whitespace-nowrap">
        {/* Rotating Term - INLINE with the rest */}
        <span className="inline-flex overflow-hidden" aria-live="polite" aria-atomic="true">
          <span 
            className={`text-foreground inline-block ${
              isFading ? 'animate-slideOutUp' : 'animate-slideInUp'
            }`}
          >
            {termText}
          </span>
        </span>
        {/* Static suffix - same line */}
        <EditableTranslation 
          translationKey="hero.rotating.suffix"
          fallbackText="for mobile & workshop car services."
        >
          <span className="text-foreground">for mobile & workshop car services.</span>
        </EditableTranslation>
        
        {/* Pause button inline */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause rotation' : 'Resume rotation'}
          className="opacity-60 hover:opacity-100 transition-opacity ml-2"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </h1>
      
      {/* Descriptor with elbow arrow */}
      <div className="flex items-start justify-center gap-2 mt-4">
        {/* Constant elbow arrow */}
        <span className="text-muted-foreground text-xl">↳</span>
        
        {/* Rotating descriptor */}
        <span className="inline-flex overflow-hidden max-w-2xl">
          <span 
            className={`text-muted-foreground text-lg inline-block ${
              isFading ? 'animate-slideOutUp' : 'animate-slideInUp'
            }`}
          >
            {descText}
          </span>
        </span>
      </div>
    </div>
  );
}
