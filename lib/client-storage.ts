"use client";

import type { VideoAnalysis } from "@/lib/types";

const KEY = (id: string) => `castboard:analysis:${id}`;

export function saveAnalysisToClient(videoId: string, analysis: VideoAnalysis) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY(videoId), JSON.stringify(analysis));
  } catch {
    /* quota */
  }
}

export function loadAnalysisFromClient(videoId: string): VideoAnalysis | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY(videoId));
    if (!raw) return null;
    return JSON.parse(raw) as VideoAnalysis;
  } catch {
    return null;
  }
}
