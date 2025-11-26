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
      <div className={`${className} text-center`}>
        <div className="overflow-hidden" style={{ minHeight: '1.2em' }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold">
            <span>ERP</span>
          </h1>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold">
          <EditableTranslation 
            translationKey="hero.rotating.suffix"
            fallbackText="for mobile & workshop car services."
          >
            <span>for mobile & workshop car services.</span>
          </EditableTranslation>
        </h1>
      </div>
    );
  }

  const currentTerm = terms[currentIndex];
  const termText = t(currentTerm.term_key, currentTerm.term_fallback);

  return (
    <div className={`${className} relative text-center`}>
      {/* Line 1: Rotating Term - Large, prominent */}
      <div className="overflow-hidden" style={{ minHeight: '1.2em' }}>
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold"
          aria-live="polite" 
          aria-atomic="true"
        >
          <span 
            className={`text-foreground inline-block ${
              isFading ? 'animate-slideOutUp' : 'animate-slideInUp'
            }`}
          >
            {termText}
          </span>
        </h1>
      </div>
      
      {/* Line 2: Static suffix */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold">
        <EditableTranslation 
          translationKey="hero.rotating.suffix"
          fallbackText="for mobile & workshop car services."
        >
          <span className="text-foreground">for mobile & workshop car services.</span>
        </EditableTranslation>
        
        {/* Pause button - hidden on mobile, inline on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause rotation' : 'Resume rotation'}
          className="opacity-60 hover:opacity-100 transition-opacity hidden sm:inline-flex ml-2"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </h1>
      
      {/* Pause button for mobile - shown below text */}
      <div className="sm:hidden mt-3 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause rotation' : 'Resume rotation'}
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
