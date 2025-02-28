import { useCallback, useEffect, useRef, type RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const isAtBottomRef = useRef(true);
  const requestAnimationFrameIdRef = useRef<number | null>(null);
  const threshold = 30;

  const checkIfAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Consider "at bottom" if within 30px of the bottom
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    isAtBottomRef.current = atBottom;
  }, []);

  // Debounced scroll handler using requestAnimationFrame for performance
  const handleScroll = useCallback(() => {
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current);
    }

    requestAnimationFrameIdRef.current = requestAnimationFrame(() => {
      checkIfAtBottom();
      requestAnimationFrameIdRef.current = null;
    });
  }, [checkIfAtBottom]);

  // Set up scroll event listener to track if user is at bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkIfAtBottom();

    // Listen for scroll events with debouncing
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current);
      }
      container.removeEventListener("scroll", handleScroll);
    };
  }, [checkIfAtBottom, handleScroll]);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        // Use ref instead of state to avoid render cycles during rapid updates
        if (isAtBottomRef.current) {
          // Schedule scrolling in the next animation frame for better performance
          requestAnimationFrame(() => {
            end.scrollIntoView({ behavior: "instant", block: "end" });
          });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
