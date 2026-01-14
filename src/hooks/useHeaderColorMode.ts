import { useState, useEffect, useRef } from 'react';

type HeaderColorMode = 'light' | 'dark'; // light = white text, dark = dark text

export function useHeaderColorMode(): HeaderColorMode {
  const [colorMode, setColorMode] = useState<HeaderColorMode>('dark');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const updateColorMode = () => {
      // Find all sections with data-header-color attribute
      const sections = document.querySelectorAll('[data-header-color]');
      
      if (sections.length === 0) {
        // Default to dark mode (dark text) if no sections found
        setColorMode('dark');
        return;
      }

      // Clean up previous observer
      observerRef.current?.disconnect();

      // Create observer with rootMargin to detect sections at header position
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Find the topmost intersecting section (highest on page, closest to header)
          const intersecting = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => {
              const rectA = a.boundingClientRect;
              const rectB = b.boundingClientRect;
              return rectA.top - rectB.top;
            });

          if (intersecting.length > 0) {
            const topSection = intersecting[0].target;
            const mode = topSection.getAttribute('data-header-color') as HeaderColorMode;
            setColorMode(mode || 'dark');
          }
        },
        {
          // Only detect at the very top of viewport (where header is ~80px tall)
          rootMargin: '-0px 0px -85% 0px',
          threshold: 0
        }
      );

      sections.forEach(section => {
        observerRef.current?.observe(section);
      });
    };

    // Initial setup with small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateColorMode, 50);
    
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
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return colorMode;
}
