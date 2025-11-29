import { useState, useEffect } from 'react';
import { useRotatingTerms } from '@/hooks/useRotatingTerms';
import { useAppTranslation } from '@/hooks/useAppTranslation';
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
      </h1>
    </div>
  );
}
