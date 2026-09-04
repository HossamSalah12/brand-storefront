"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates from 0 to the target number over ~800ms. For non-numeric
 * values (already-formatted strings like "1,250 ج.م"), renders as-is
 * with no animation — count-up only makes sense for plain integers.
 */
export function CountUp({ value }: { value: string | number }) {
  const numeric = typeof value === "number" ? value : Number(value);
  const isPlainNumber = typeof value === "number" || /^\d+$/.test(String(value));
  const [display, setDisplay] = useState(isPlainNumber ? 0 : value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isPlainNumber) {
      setDisplay(value);
      return;
    }

    let frame: number;
    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric, isPlainNumber]);

  return <span ref={ref}>{display}</span>;
}
