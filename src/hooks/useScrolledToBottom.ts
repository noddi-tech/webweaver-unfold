import { RefObject, useEffect, useState } from "react";

export function useScrolledToBottom(
  sentinelRef: RefObject<HTMLElement>
): boolean {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!sentinelRef.current || hasScrolled) return;

    const sentinel = sentinelRef.current;
    const scrollParent = sentinel.parentElement?.closest("[data-scroll-gate='true']");

    const checkScrollPosition = () => {
      if (!(scrollParent instanceof HTMLElement)) return;
      const remaining = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
      if (remaining <= 2) {
        setHasScrolled(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasScrolled(true);
        }
      },
      { threshold: 0.95 }
    );

    observer.observe(sentinel);
    scrollParent?.addEventListener("scroll", checkScrollPosition, { passive: true });
    checkScrollPosition();

    return () => {
      observer.disconnect();
      scrollParent?.removeEventListener("scroll", checkScrollPosition);
    };
  }, [sentinelRef, hasScrolled]);

  return hasScrolled;
}
