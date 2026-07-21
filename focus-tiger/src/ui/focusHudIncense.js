/**
 * Map session focusLevel → incense / halo CSS vars (metaphor first, numbers second).
 * @param {number} level 0..1
 * @returns {{ fill: number, smokeOpacity: number, ringOpacity: number }}
 */
export function focusLevelToIncenseVars(level) {
  const fill = Math.min(1, Math.max(0, Number(level) || 0));
  return {
    fill,
    smokeOpacity: 0.12 + fill * 0.58,
    ringOpacity: 0.18 + fill * 0.62
  };
}
