import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { useRotatingTerms } from '@/hooks/useRotatingTerms';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button } from '@/components/ui/button';

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
      <h1 className={className}>
        <span className="block text-muted-foreground text-lg mb-2">
          for mobile & workshop car services.
        </span>
        <span className="block">One platform. Every function.</span>
      </h1>
    );
  }

  const currentTerm = terms[currentIndex];
  const termText = t(currentTerm.term_key, currentTerm.term_fallback);
  const descText = t(currentTerm.descriptor_key, currentTerm.descriptor_fallback);

  return (
    <div className={`${className} relative`}>
      <h1>
        <span className="block text-muted-foreground text-lg mb-2">
          for mobile & workshop car services.
        </span>
        <span 
          className="rotating-container block min-h-[8rem] relative"
          aria-live="polite"
          aria-atomic="true"
        >
          <span 
            className={`term block text-foreground transition-opacity duration-300 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {termText}
          </span>
          <span 
            className={`descriptor block text-muted-foreground text-lg mt-4 transition-opacity duration-300 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {descText}
          </span>
        </span>
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause rotation' : 'Resume rotation'}
        className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
    </div>
  );
}
