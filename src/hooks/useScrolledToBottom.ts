import { RefObject, useEffect, useState } from "react";

export function useScrolledToBottom(
  sentinelRef: RefObject<HTMLElement>
): boolean {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!sentinelRef.current || hasScrolled) return;

    const sentinel = sentinelRef.current;
    const scrollParent = sentinel.parentElement?.closest("[data-scroll-gate='true']");
    const markScrolled = () => {
      if (import.meta.env.DEV) {
        console.log("[NDA] scrolled to bottom — checkbox now enabled", {
          via: "observer-or-scroll",
        });
      }
      setHasScrolled(true);
    };

    const checkScrollPosition = () => {
      if (!(scrollParent instanceof HTMLElement)) return;
      const remaining = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
      if (remaining <= 2) {
        markScrolled();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          markScrolled();
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
