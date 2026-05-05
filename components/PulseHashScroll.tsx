"use client";

import { useLayoutEffect } from "react";

const TARGET_ID = "pulse-recent-videos";
const HASH = "#videos";

export function PulseHashScroll() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== HASH) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 48;

    function tick() {
      if (cancelled) return;
      const el = document.getElementById(TARGET_ID);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
