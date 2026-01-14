import { useState, useEffect, useRef, useCallback } from 'react';

type HeaderColorMode = 'light' | 'dark'; // light = white text, dark = dark text

export function useHeaderColorMode(): HeaderColorMode {
  const [colorMode, setColorMode] = useState<HeaderColorMode>('dark');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastModeRef = useRef<HeaderColorMode>('dark');
  const debounceRef = useRef<number | null>(null);

  // Debounced setter to prevent rapid changes during fast scrolling
  const debouncedSetMode = useCallback((mode: HeaderColorMode) => {
    if (debounceRef.current) {
      cancelAnimationFrame(debounceRef.current);
    }
    debounceRef.current = requestAnimationFrame(() => {
      if (lastModeRef.current !== mode) {
        lastModeRef.current = mode;
        setColorMode(mode);
      }
    });
  }, []);

  useEffect(() => {
    // Direct scroll-based detection for immediate feedback
    const detectColorMode = () => {
      const sections = document.querySelectorAll('[data-header-color]');
      if (sections.length === 0) {
        debouncedSetMode('dark');
        return;
      }

      let topSection: Element | null = null;
      let topY = Infinity;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Section is intersecting with header area (top ~80px of viewport)
        if (rect.top < 80 && rect.bottom > 0) {
          if (rect.top < topY) {
            topY = rect.top;
            topSection = section;
          }
        }
      });

      if (topSection) {
        const mode = topSection.getAttribute('data-header-color') as HeaderColorMode;
        debouncedSetMode(mode || 'dark');
      }
    };

    const updateColorMode = () => {
      const sections = document.querySelectorAll('[data-header-color]');
      
      if (sections.length === 0) {
        debouncedSetMode('dark');
        return;
      }

      // Clean up previous observer
      observerRef.current?.disconnect();

      // Create observer with rootMargin to detect sections at header position
      observerRef.current = new IntersectionObserver(
        () => {
          // When intersection changes, re-detect based on current positions
          detectColorMode();
        },
        {
          // Only detect at the very top of viewport (where header is ~80px tall)
          rootMargin: '0px 0px -85% 0px',
          threshold: [0, 0.1, 0.5, 1]
        }
      );

      sections.forEach(section => {
        observerRef.current?.observe(section);
      });

      // Initial detection
      detectColorMode();
    };

    // Initial setup with small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateColorMode, 50);
    
    // Listen to scroll for immediate feedback
    const handleScroll = () => {
      detectColorMode();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Re-observe when DOM changes (for dynamic content / route changes)
    const mutationObserver = new MutationObserver(() => {
      // Debounce mutation callbacks
      clearTimeout(timeoutId);
      setTimeout(updateColorMode, 50);
    });
    
    mutationObserver.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-header-color']
    });

    return () => {
      clearTimeout(timeoutId);
      if (debounceRef.current) cancelAnimationFrame(debounceRef.current);
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedSetMode]);

  return colorMode;
}
