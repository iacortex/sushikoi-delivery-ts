import { useEffect, useRef, useState } from 'react';

/** Ticker que aumenta cada X ms (útil para cronómetros) */
export function useTicker(intervalMs = 1000) {
  const [tick, setTick] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    ref.current = window.setInterval(() => setTick(t => t + 1), intervalMs);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [intervalMs]);

  return tick;
}
