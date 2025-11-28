import { useEffect, useState, useRef, RefObject } from 'react';

interface CardState {
  opacity: number;
  translateY: number;
  scale: number;
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
  const [cardStates, setCardStates] = useState<CardState[]>(
    Array(totalCards).fill({ opacity: 1, translateY: 0, scale: 1 })
  );
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

      // Calculate states for all cards - keep all visible
      const newCardStates = Array.from({ length: totalCards }, (_, index) => {
        const cardStart = index * cardStep;
        const cardEnd = (index + 1) * cardStep;
        
        if (progress < cardStart) {
          // Future cards - visible but dimmed, positioned below
          const distanceFromActive = (cardStart - progress) / cardStep;
          return { 
            opacity: Math.max(0.3, 1 - distanceFromActive * 0.4), 
            translateY: Math.min(20, distanceFromActive * 15),
            scale: 0.98
          };
        } else if (progress >= cardStart && progress < cardEnd) {
          // Active card - full visibility with emphasis
          return { 
            opacity: 1, 
            translateY: 0,
            scale: 1.02
          };
        } else {
          // Passed cards - visible but dimmed, positioned above
          const distanceFromActive = (progress - cardEnd) / cardStep;
          return { 
            opacity: Math.max(0.4, 1 - distanceFromActive * 0.3), 
            translateY: -Math.min(10, distanceFromActive * 8),
            scale: 0.99
          };
        }
      });

      setCardStates(newCardStates);
    };

    // Check for reduced motion preference and mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 1280; // Match xl: breakpoint for sticky sidebar layout
    
    if (prefersReducedMotion || isMobile) {
      // If reduced motion or mobile, show all cards without animation
      setCardStates(Array(totalCards).fill({ opacity: 1, translateY: 0, scale: 1 }));
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
