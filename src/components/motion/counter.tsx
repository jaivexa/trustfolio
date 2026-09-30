"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";


/**
 * Counts up to `value` when scrolled into view. The final value is rendered on
 * the server (SEO, no-JS) and only reset to 0 if the counter starts off-screen,
 * so there is never a visible flash.
 */
export function Counter({
  value,
  suffix = "",
  duration = 1.4,
  locale = "en",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  locale?: string;
}) {
  const format = new Intl.NumberFormat(locale === "ta" ? "ta-IN" : "en-IN", { maximumFractionDigits: 1 });
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const armed = useRef(false);

  useEffect(() => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offscreen = rect.top > window.innerHeight || rect.bottom < 0;
    if (offscreen) {
      armed.current = true;
      setDisplay(0);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (!inView || !armed.current) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {format.format(display)}
      {suffix}
    </span>
  );
}
