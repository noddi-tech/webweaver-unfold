import { RefObject, useEffect, useState } from "react";

export function useScrolledToBottom(
  sentinelRef: RefObject<HTMLElement>
): boolean {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!sentinelRef.current || hasScrolled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasScrolled(true);
        }
      },
      { threshold: 0.95 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sentinelRef, hasScrolled]);

  return hasScrolled;
}
