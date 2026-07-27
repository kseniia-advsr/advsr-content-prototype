import { useEffect, useRef } from "react";

/**
 * Fires `onGate` once, the first of: the reader scrolls the response to the
 * bottom, or `idleMs` passes with no scroll/mouse/keyboard activity —
 * whichever comes first. Unlike a fixed dwell timer, the idle clock resets on
 * any activity, so an engaged reader who's still scrolling and re-reading
 * doesn't get cut off at a fixed mark.
 */
export function useIdleOrScrollGate(active: boolean, onGate: () => void, idleMs = 90000) {
  const firedRef = useRef(false);
  const onGateRef = useRef(onGate);
  onGateRef.current = onGate;

  useEffect(() => {
    if (!active) return;
    firedRef.current = false;
    let timer: number;

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      onGateRef.current();
    };

    const resetIdleTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fire, idleMs);
    };

    const onScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      if (scrolledToBottom) {
        fire();
        return;
      }
      resetIdleTimer();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);
    resetIdleTimer();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, [active, idleMs]);
}
