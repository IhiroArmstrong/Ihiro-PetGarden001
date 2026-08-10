/**
 * Confide to Yin · route ids (classify output).
 * `safety_redirect` is NOT an emotion bucket — priority layer only.
 */

export const CONFIDE_ROUTE = Object.freeze({
  SAFETY_REDIRECT: 'safety_redirect',
  ANXIOUS: 'anxious',
  TIRED: 'tired',
  STUCK: 'stuck',
  SAD: 'sad',
  SCATTERED: 'scattered',
  FALLBACK: 'fallback'
});

/** Emotion buckets only (excludes safety + fallback). */
export const CONFIDE_EMOTION_BUCKETS = Object.freeze([
  CONFIDE_ROUTE.ANXIOUS,
  CONFIDE_ROUTE.TIRED,
  CONFIDE_ROUTE.STUCK,
  CONFIDE_ROUTE.SAD,
  CONFIDE_ROUTE.SCATTERED
]);

/**
 * Explicit multi-hit priority (highest first). Not fuzzy scoring.
 * @type {readonly string[]}
 */
export const CONFIDE_EMOTION_PRIORITY = Object.freeze([
  CONFIDE_ROUTE.ANXIOUS,
  CONFIDE_ROUTE.STUCK,
  CONFIDE_ROUTE.SAD,
  CONFIDE_ROUTE.TIRED,
  CONFIDE_ROUTE.SCATTERED
]);
