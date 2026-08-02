/**
 * Linear per-frame zoom for oneshot ritual sequences (camera push-in).
 * Frame index is 0-based; first frame → `from`, last frame → `to`.
 *
 * @param {number} frameIndex
 * @param {number} frameCount
 * @param {number} [from=1]
 * @param {number} [to=1]
 * @returns {number}
 */
export function playbackZoomAtIndex(
  frameIndex,
  frameCount,
  from = 1,
  to = 1
) {
  const start = Number(from);
  const end = Number(to);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  const n = Math.max(1, Math.floor(Number(frameCount)) || 1);
  const i = Math.min(Math.max(0, Math.floor(Number(frameIndex)) || 0), n - 1);
  if (n <= 1) return start;
  const t = i / (n - 1);
  return start + (end - start) * t;
}
