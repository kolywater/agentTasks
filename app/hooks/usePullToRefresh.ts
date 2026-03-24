import { useRef, useState, useEffect, useCallback, RefObject } from "react";

const THRESHOLD = 60; // px needed to trigger refresh
const MAX_PULL = 120; // cap pull distance

type State = "idle" | "pulling" | "refreshing";

export function usePullToRefresh(
  containerRef: RefObject<HTMLElement | null>,
  onRefresh: () => Promise<void>
) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stateRef = useRef<State>("idle");
  const startY = useRef(0);
  const startX = useRef(0);
  const directionDecided = useRef(false);
  const isVertical = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only activate when at the very top of the page
    if (window.scrollY > 0) return;
    if (stateRef.current === "refreshing") return;

    const touch = e.touches[0];
    startY.current = touch.clientY;
    startX.current = touch.clientX;
    directionDecided.current = false;
    isVertical.current = false;
    stateRef.current = "idle";
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (stateRef.current === "refreshing") return;

    const touch = e.touches[0];
    const dy = touch.clientY - startY.current;
    const dx = touch.clientX - startX.current;

    // Decide direction on first significant movement
    if (!directionDecided.current) {
      if (Math.abs(dy) > 5 || Math.abs(dx) > 5) {
        directionDecided.current = true;
        isVertical.current = Math.abs(dy) > Math.abs(dx);
      }
      return;
    }

    // Only handle vertical pull-down gestures
    if (!isVertical.current || dy <= 0) {
      // If was pulling and user pushed back up, reset
      if (stateRef.current === "pulling") {
        stateRef.current = "idle";
        setPullDistance(0);
      }
      return;
    }

    // Must be at scroll top
    if (window.scrollY > 0) return;

    // Prevent native scroll bounce during active pull
    e.preventDefault();

    stateRef.current = "pulling";
    const distance = Math.min(dy * 0.5, MAX_PULL); // dampen the pull
    setPullDistance(distance);
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (stateRef.current !== "pulling") return;

    if (pullDistance >= THRESHOLD) {
      stateRef.current = "refreshing";
      setIsRefreshing(true);
      setPullDistance(THRESHOLD * 0.6); // hold at a small offset during refresh

      try {
        await onRefresh();
      } finally {
        stateRef.current = "idle";
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      stateRef.current = "idle";
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use non-passive for touchmove so we can preventDefault
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing };
}
