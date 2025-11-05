import { useEffect, useState, useRef, RefObject } from 'react';

interface CardState {
  opacity: number;
  translateY: number;
}

interface ScrollProgressReturn {
  activeCardIndex: number;
  cardStates: CardState[];
  sectionProgress: number;
}

export function useScrollProgress(
  sectionRef: RefObject<HTMLElement>,
  totalCards: number
): ScrollProgressReturn {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [sectionProgress, setSectionProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Only animate when section is in viewport
      if (rect.top > windowHeight || rect.bottom < 0) {
        return;
      }
      
      // Calculate scroll position relative to section top
      const scrollStart = 0;
      const scrollEnd = rect.height - windowHeight;
      const scrollPosition = -rect.top;
      
      // Progress from 0 to 1
      const progress = Math.max(0, Math.min(1, scrollPosition / scrollEnd));
      setSectionProgress(progress);

      // Calculate active card index with smoother transitions
      const cardStep = 1 / totalCards;
      const newActiveIndex = Math.min(
        Math.floor(progress / cardStep),
        totalCards - 1
      );
      setActiveCardIndex(newActiveIndex);

      // Calculate states for all cards with improved logic
      const newCardStates = Array.from({ length: totalCards }, (_, index) => {
        const cardStart = index * cardStep;
        const cardEnd = (index + 1) * cardStep;
        const cardMid = cardStart + cardStep / 2;
        
        if (progress < cardStart - 0.1) {
          // Card is far in the future - hidden below
          return { opacity: 0, translateY: 30 };
        } else if (progress < cardStart) {
          // Card is approaching - fade in
          const fadeProgress = (progress - (cardStart - 0.1)) / 0.1;
          return { opacity: fadeProgress * 0.6, translateY: 30 - fadeProgress * 22 };
        } else if (progress >= cardStart && progress < cardEnd) {
          // Card is active - fully visible
          const activeProgress = (progress - cardStart) / cardStep;
          return { opacity: 1, translateY: 0 };
        } else if (progress < cardEnd + 0.05) {
          // Card just passed - slight fade
          return { opacity: 0.6, translateY: -5 };
        } else {
          // Card has passed - hidden above
          return { opacity: 0, translateY: -20 };
        }
      });

      setCardStates(newCardStates);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If reduced motion, show all cards without animation
      setCardStates(Array(totalCards).fill({ opacity: 1, translateY: 0 }));
      return;
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sectionRef, totalCards]);

  return {
    activeCardIndex,
    cardStates,
    sectionProgress,
  };
}
