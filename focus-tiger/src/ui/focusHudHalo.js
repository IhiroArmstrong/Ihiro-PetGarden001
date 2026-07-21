/**
 * Map session focusLevel → ring / core CSS vars (progress ring + breathing center light).
 * @param {number} level 0..1
 * @returns {{ fill: number, ringOpacity: number, coreOpacity: number }}
 */
export function focusLevelToHaloVars(level) {
  const fill = Math.min(1, Math.max(0, Number(level) || 0));
  return {
    fill,
    ringOpacity: 0.22 + fill * 0.58,
    coreOpacity: 0.28 + fill * 0.52
  };
}
