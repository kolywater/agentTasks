import { useRef, useCallback, useEffect } from "react";

const ACTION_WIDTH = 140; // total width of revealed buttons (2 × 70px)
const THRESHOLD = 50; // minimum horizontal px to count as intentional swipe

// Module-level: tracks the close function of the currently-open row
let closeCurrentRow: (() => void) | null = null;

export function useSwipe(onOpen?: () => void) {
  const rowRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isOpen = useRef(false);
  const isSwiping = useRef(false);
  const isScrolling = useRef<boolean | null>(null); // null = undecided

  const setTranslate = useCallback((x: number, animate: boolean) => {
    const el = rowRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 0.25s ease-out" : "none";
    el.style.transform = `translateX(${x}px)`;
  }, []);

  const close = useCallback(() => {
    isOpen.current = false;
    setTranslate(0, true);
    if (closeCurrentRow === close) {
      closeCurrentRow = null;
    }
  }, [setTranslate]);

  const open = useCallback(() => {
    // Close any other open row first
    if (closeCurrentRow && closeCurrentRow !== close) {
      closeCurrentRow();
    }
    isOpen.current = true;
    closeCurrentRow = close;
    setTranslate(-ACTION_WIDTH, true);
    onOpen?.();
  }, [close, setTranslate, onOpen]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = isOpen.current ? -ACTION_WIDTH : 0;
    isSwiping.current = false;
    isScrolling.current = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Decide direction on first significant movement
    if (isScrolling.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isScrolling.current = Math.abs(dy) > Math.abs(dx);
      }
      return;
    }

    // If vertical scroll, bail out
    if (isScrolling.current) return;

    isSwiping.current = true;

    const base = isOpen.current ? -ACTION_WIDTH : 0;
    let newX = base + dx;
    // Clamp: don't go past action width, don't go right of origin
    newX = Math.max(-ACTION_WIDTH, Math.min(0, newX));
    setTranslate(newX, false);
  }, [setTranslate]);

  const onTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;

    const el = rowRef.current;
    if (!el) return;

    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    const finalX = matrix.m41;

    // Snap open if past halfway, otherwise snap closed
    if (finalX < -THRESHOLD) {
      open();
    } else {
      close();
    }

    isSwiping.current = false;
    isScrolling.current = null;
  }, [open, close]);

  // Close when tapping outside
  useEffect(() => {
    function handleTouchOutside(e: TouchEvent) {
      if (!isOpen.current) return;
      if (rowRef.current?.parentElement?.contains(e.target as Node)) return;
      close();
    }
    document.addEventListener("touchstart", handleTouchOutside, {
      passive: true,
    });
    return () => document.removeEventListener("touchstart", handleTouchOutside);
  }, [close]);

  return {
    rowRef,
    isOpen,
    close,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
