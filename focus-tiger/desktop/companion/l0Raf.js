/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Sample requestAnimationFrame intervals in the renderer (Idle proxy).
 * @param {number} sampleMs
 */
export function rafSamplerSource(sampleMs) {
  const ms = Math.max(500, Number(sampleMs) || 2500);
  return `(() => new Promise((resolve) => {
    const intervals = [];
    let last = performance.now();
    const t0 = last;
    function tick(now) {
      intervals.push(now - last);
      last = now;
      if (now - t0 < ${ms}) requestAnimationFrame(tick);
      else resolve(intervals);
    }
    requestAnimationFrame(tick);
  }))()`;
}
