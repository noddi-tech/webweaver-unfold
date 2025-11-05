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
      
      // Calculate how far through the section we've scrolled
      // Start counting when section enters viewport, end when it leaves
      const scrollStart = -rect.height + windowHeight;
      const scrollEnd = windowHeight;
      const scrollRange = scrollEnd - scrollStart;
      const scrollPosition = scrollEnd - rect.top;
      
      // Progress from 0 to 1
      const progress = Math.max(0, Math.min(1, scrollPosition / scrollRange));
      setSectionProgress(progress);

      // Calculate active card index
      const cardStep = 1 / totalCards;
      const newActiveIndex = Math.min(
        Math.floor(progress / cardStep),
        totalCards - 1
      );
      setActiveCardIndex(newActiveIndex);

      // Calculate states for all cards
      const newCardStates = Array.from({ length: totalCards }, (_, index) => {
        const cardStart = index * cardStep;
        const cardEnd = (index + 1) * cardStep;
        
        if (progress < cardStart) {
          // Card hasn't appeared yet - hidden below
          return { opacity: 0, translateY: 20 };
        } else if (progress >= cardStart && progress < cardEnd) {
          // Card is active - fully visible
          return { opacity: 1, translateY: 0 };
        } else if (index === newActiveIndex + 1) {
          // Next card after active - slightly visible
          return { opacity: 0.585, translateY: 8.28 };
        } else {
          // Card has passed - hidden above
          return { opacity: 0, translateY: 20 };
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
