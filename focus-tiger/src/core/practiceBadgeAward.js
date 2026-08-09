/**
 * Shared practice-level → badge target count (Tip / Sanctuary / free).
 *
 * score = practiceDayCount + floor(lifetimeMinutes / 60)
 * target = min + floor(score / 3), clamped to [min, max]
 *
 * Paid paths (Tea / Sanctuary): requirePractice=false → no practice still yields `min`.
 * Free path: requirePractice=true → no practice yields 0 (first badge after practice).
 */

/**
 * @param {{ practiceDayCount?: number, lifetimeMinutes?: number }} summary
 * @param {{ min: number, max: number, requirePractice?: boolean }} opts
 * @returns {number}
 */
export function computePracticeBadgeTargetCount(summary = {}, opts) {
  const min = Math.max(0, Math.floor(Number(opts?.min) || 0));
  const max = Math.max(min, Math.floor(Number(opts?.max) || min));
  const requirePractice = opts?.requirePractice === true;
  const days = Math.max(0, Math.floor(Number(summary.practiceDayCount) || 0));
  const minutes = Math.max(0, Number(summary.lifetimeMinutes) || 0);
  const hasPractice = days > 0 || minutes > 0;
  if (!hasPractice) {
    return requirePractice ? 0 : min;
  }
  const score = days + Math.floor(minutes / 60);
  const raw = min + Math.floor(score / 3);
  return Math.min(max, Math.max(min, raw));
}

/**
 * Only-grow merge against a catalog prefix.
 *
 * @param {ReadonlyArray<{ id: string }>} catalog
 * @param {string[]} prevIds
 * @param {number} targetCount
 * @param {(raw: unknown) => string[]} normalizeIds
 * @returns {{ badgeIds: string[], newlyAddedIds: string[] }}
 */
export function mergeCatalogBadgeAwards(
  catalog,
  prevIds,
  targetCount,
  normalizeIds
) {
  const prev = normalizeIds(prevIds);
  const max = catalog.length;
  const target = Math.min(
    max,
    Math.max(0, Math.floor(Number(targetCount) || 0))
  );
  const n = Math.max(prev.length, target);
  if (n <= 0) {
    return { badgeIds: [], newlyAddedIds: [] };
  }
  const badgeIds = catalog.slice(0, n).map((b) => b.id);
  const prevSet = new Set(prev);
  const newlyAddedIds = badgeIds.filter((id) => !prevSet.has(id));
  return { badgeIds, newlyAddedIds };
}
