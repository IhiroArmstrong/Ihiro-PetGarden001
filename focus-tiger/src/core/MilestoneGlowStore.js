/**
 * Which long-horizon MilestoneGlow nodes have already played (once each).
 * Only-add; quiet days never revoke. No Day-N scoreboard copy.
 */

export const MILESTONE_GLOW_STORAGE_KEY = 'focus-tiger.milestone-glow.v1';

/** First product cut: consecutive practice streak days. */
export const MILESTONE_GLOW_STREAK_NODES = Object.freeze([
  { id: 'streak-7', streakDays: 7 },
  { id: 'streak-21', streakDays: 21 },
  { id: 'streak-100', streakDays: 100 }
]);

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {number} streakDays
 * @param {ReadonlySet<string> | Iterable<string>} playedIds
 * @returns {string | null} node id to play, or null
 */
export function resolveMilestoneGlowNodeId(streakDays, playedIds) {
  const streak = Math.floor(Number(streakDays));
  if (!Number.isFinite(streak) || streak <= 0) return null;
  const played =
    playedIds instanceof Set
      ? playedIds
      : new Set(playedIds ?? []);
  for (const node of MILESTONE_GLOW_STREAK_NODES) {
    if (streak < node.streakDays) continue;
    if (played.has(node.id)) continue;
    return node.id;
  }
  return null;
}

/**
 * Streak as if `todayKey` were already a practiced day (completion marks today later).
 * @param {Iterable<string>} dayKeys
 * @param {string} todayKey
 * @param {(keys: Iterable<string>, today: string) => number} countStreak
 */
export function projectedStreakIncludingToday(dayKeys, todayKey, countStreak) {
  const set = new Set(dayKeys);
  set.add(todayKey);
  return countStreak(set, todayKey);
}

export class MilestoneGlowStore {
  /**
   * @param {{ storage?: Storage | null, storageKey?: string, now?: () => Date }} [opts]
   */
  constructor(opts = {}) {
    this.storage =
      opts.storage === undefined ? getDefaultStorage() : opts.storage;
    this.storageKey = opts.storageKey ?? MILESTONE_GLOW_STORAGE_KEY;
    this.now = opts.now ?? (() => new Date());
    /** @type {{ played: string[] }} */
    this._memoryState = { played: [] };
  }

  /** @returns {Set<string>} */
  getPlayedIds() {
    return new Set(this._read().played);
  }

  /**
   * @param {string} nodeId
   * @returns {boolean} true if newly recorded
   */
  markPlayed(nodeId) {
    const id = String(nodeId || '');
    if (!id) return false;
    const played = this._read().played.slice();
    if (played.includes(id)) return false;
    played.push(id);
    this._write({ played });
    return true;
  }

  /**
   * @param {number} streakDays
   * @returns {string | null}
   */
  peekOffer(streakDays) {
    return resolveMilestoneGlowNodeId(streakDays, this.getPlayedIds());
  }

  /**
   * Peek + mark in one step (call when playback actually starts).
   * @param {number} streakDays
   * @returns {string | null}
   */
  claimOffer(streakDays) {
    const id = this.peekOffer(streakDays);
    if (!id) return null;
    this.markPlayed(id);
    return id;
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      if (parsed && Array.isArray(parsed.played)) {
        const played = parsed.played.filter((x) => typeof x === 'string' && x);
        this._memoryState = { played };
        return this._memoryState;
      }
    } catch {
      /* ignore */
    }
    return this._memoryState;
  }

  /** @param {{ played: string[] }} state */
  _write(state) {
    this._memoryState = { played: state.played.slice() };
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this._memoryState));
    } catch {
      /* ignore */
    }
  }
}
