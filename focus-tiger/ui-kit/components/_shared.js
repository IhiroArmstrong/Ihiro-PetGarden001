/**
 * Shared celebrate-mode helper for Focus Tiger UI Kit.
 * Celebrate lasts ≤ 1.2s, then returns to calm.
 */

export const CELEBRATE_MS = 1200;

/**
 * @param {HTMLElement} el
 * @param {() => void} [onCalm]
 * @returns {() => void} clear handle
 */
export function scheduleCelebrateReset(el, onCalm) {
  const prev = el.__ftCelebrateTimer;
  if (prev) clearTimeout(prev);
  const id = setTimeout(() => {
    el.__ftCelebrateTimer = null;
    if (el.getAttribute("mode") === "celebrate") {
      el.setAttribute("mode", "calm");
    }
    if (typeof onCalm === "function") onCalm();
  }, CELEBRATE_MS);
  el.__ftCelebrateTimer = id;
  return () => clearTimeout(id);
}

/** Tiny Yin silhouette placeholder (data URI SVG). */
export const YIN_SILHOUETTE_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="54" rx="18" ry="6" fill="%23B5623A" opacity="0.55"/>
    <path d="M20 46c2-14 8-24 12-28 4 4 10 14 12 28" fill="%23E4E1DB" stroke="%232E2B28" stroke-width="1.2"/>
    <circle cx="32" cy="22" r="10" fill="%23E8A05A" stroke="%232E2B28" stroke-width="1.2"/>
    <circle cx="32" cy="18" r="1.4" fill="%23D64545"/>
    <path d="M24 20c2 2 4 2 6 0M34 20c2 2 4 2 6 0" stroke="%232E2B28" stroke-width="1" stroke-linecap="round"/>
    <path d="M22 14l-4-6M42 14l4-6" stroke="%232E2B28" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`
)}`;
