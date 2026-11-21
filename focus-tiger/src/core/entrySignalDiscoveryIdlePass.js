/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * L4 · 冷落让位：同一赢家连续 3 次 Idle 进入仍为可见脉冲且宿主未点 → resting。
 * @see docs/task-briefs/task-entry-signal-ledger.md §8.2
 */

export const DISCOVERY_IDLE_PASS_STORAGE_KEY =
  'focus-tiger.hints-discovery-idle.v1';

const RESTING_AFTER_IDLE_PASSES = 3;

/**
 * @param {unknown} raw
 * @returns {{ winnerId: string | null, streak: number, lastVisitGen: number }}
 */
export function normalizeDiscoveryIdlePass(raw) {
  if (!raw || typeof raw !== 'object') {
    return { winnerId: null, streak: 0, lastVisitGen: -1 };
  }
  const winnerId =
    typeof raw.winnerId === 'string' && raw.winnerId ? raw.winnerId : null;
  const streak =
    typeof raw.streak === 'number' && raw.streak >= 0 ? Math.floor(raw.streak) : 0;
  const lastVisitGen =
    typeof raw.lastVisitGen === 'number' ? Math.floor(raw.lastVisitGen) : -1;
  return { winnerId, streak, lastVisitGen };
}

/**
 * @param {() => unknown} [read]
 * @param {(value: { winnerId: string | null, streak: number, lastVisitGen: number }) => void} [write]
 */
export function createDiscoveryIdlePassTracker(
  read = () => {
    try {
      return JSON.parse(
        localStorage.getItem(DISCOVERY_IDLE_PASS_STORAGE_KEY) || '{}'
      );
    } catch {
      return {};
    }
  },
  write = (value) => {
    try {
      localStorage.setItem(
        DISCOVERY_IDLE_PASS_STORAGE_KEY,
        JSON.stringify(value)
      );
    } catch {
      /* ignore */
    }
  }
) {
  let cache = normalizeDiscoveryIdlePass(read());

  return {
    clear() {
      cache = { winnerId: null, streak: 0, lastVisitGen: -1 };
      write(cache);
    },
    getSnapshot() {
      return { ...cache };
    },
    /**
     * Once per Idle visit generation: bump streak for the same visible winner.
     * @param {string | null} winnerId
     * @param {number} idleVisitGen
     * @returns {number} streak after this visit (0 if not counted)
     */
    noteIdleVisit(winnerId, idleVisitGen) {
      if (!winnerId || idleVisitGen < 0) {
        cache = { winnerId: null, streak: 0, lastVisitGen: idleVisitGen };
        write(cache);
        return 0;
      }
      if (cache.lastVisitGen === idleVisitGen) return cache.streak;

      let streak = 1;
      if (cache.winnerId === winnerId) {
        streak = cache.streak + 1;
      }
      cache = { winnerId, streak, lastVisitGen: idleVisitGen };
      write(cache);
      return streak;
    },
    restingThreshold() {
      return RESTING_AFTER_IDLE_PASSES;
    },
    shouldMarkResting(streak) {
      return streak >= RESTING_AFTER_IDLE_PASSES;
    }
  };
}