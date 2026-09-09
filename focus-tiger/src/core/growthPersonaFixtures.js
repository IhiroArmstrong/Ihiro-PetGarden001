/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Persona fixtures — long-lived regression contract for growth fairness.
 *
 * Each persona seeds storage-shaped inputs and declares product-intent expectations.
 * Run via `npm run audit:growth-metrics` on every formula / registry change.
 *
 * Charter: `docs/GROWTH_METRICS_CHARTER.md` § Persona regression.
 */

/**
 * @typedef {{
 *   practiceDayCount: number,
 *   lifetimeMinutes: number,
 *   practiceDayEntries?: readonly { date: string, totalMinutes: number }[],
 *   todayKey?: string
 * }} GrowthPersonaSeed
 */

/**
 * @typedef {{
 *   score: number,
 *   mustardUnlocked: boolean,
 *   visibleBloomCount: number,
 *   freeBadgeCount: number,
 *   milestoneNodeId?: string | null,
 *   qaSeedStreakScore?: number
 * }} GrowthPersonaExpectations
 */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   intent: string,
 *   seed: GrowthPersonaSeed,
 *   expectations: GrowthPersonaExpectations
 * }} GrowthPersonaFixture
 */

/** Fixed today for streak personas (deterministic). */
export const GROWTH_PERSONA_TODAY_KEY = '2026-09-10';

/**
 * @type {readonly GrowthPersonaFixture[]}
 */
export const GROWTH_PERSONA_FIXTURES = Object.freeze([
  Object.freeze({
    id: 'steady-light',
    label: '坚持型轻练习者',
    intent: '每天 Honesty 5 分钟 ×21 天 — 应能开芥子印（奖励常回来）',
    seed: Object.freeze({
      practiceDayCount: 21,
      lifetimeMinutes: 21 * 5,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 22,
      mustardUnlocked: true,
      visibleBloomCount: 4,
      freeBadgeCount: 8
    })
  }),
  Object.freeze({
    id: 'single-binge',
    label: '单次爆肝型',
    intent: '一天坐 10 小时 — 不应单日接近芥子 unlock 线（防 binge 刷分）',
    seed: Object.freeze({
      practiceDayCount: 1,
      lifetimeMinutes: 600,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 4,
      mustardUnlocked: false,
      visibleBloomCount: 12,
      freeBadgeCount: 2
    })
  }),
  Object.freeze({
    id: 'single-binge-extreme',
    label: '极端单次爆肝型',
    intent: '一天 24 小时不间断 — 封顶后不得越过芥子 unlock 线',
    seed: Object.freeze({
      practiceDayCount: 1,
      lifetimeMinutes: 1440,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 4,
      mustardUnlocked: false,
      visibleBloomCount: 12,
      freeBadgeCount: 2
    })
  }),
  Object.freeze({
    id: 'deep-weekly',
    label: '深度冥想型',
    intent: '12 个练习日 × 每次 60 分钟 — 莲花开得快，score 也达标',
    seed: Object.freeze({
      practiceDayCount: 12,
      lifetimeMinutes: 12 * 60,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 24,
      mustardUnlocked: true,
      visibleBloomCount: 12,
      freeBadgeCount: 9
    })
  }),
  Object.freeze({
    id: 'rolling-veteran',
    label: '断续型老用户',
    intent: '窗口内 30 天 + 高终身分钟 — 分钟不倒退，池满 12 朵封顶',
    seed: Object.freeze({
      practiceDayCount: 30,
      lifetimeMinutes: 5000,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 113,
      mustardUnlocked: true,
      visibleBloomCount: 12,
      freeBadgeCount: 9
    })
  }),
  Object.freeze({
    id: 'qa-mustard-shortcut',
    label: 'QA · 芥子印正确播种',
    intent: 'qaSeedStreak=21（只写 practice-days）→ score=21，可测纪念印',
    seed: Object.freeze({
      practiceDayCount: 21,
      lifetimeMinutes: 0,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 21,
      mustardUnlocked: true,
      visibleBloomCount: 0,
      freeBadgeCount: 8,
      qaSeedStreakScore: 21
    })
  }),
  Object.freeze({
    id: 'qa-seed-streak-15-legacy',
    label: 'QA · 旧文档陷阱（Batch 2 后失效）',
    intent: 'qaSeedStreak=15 不写 lotus — score=15，不得再当芥子印捷径',
    seed: Object.freeze({
      practiceDayCount: 15,
      lifetimeMinutes: 0,
      todayKey: GROWTH_PERSONA_TODAY_KEY
    }),
    expectations: Object.freeze({
      score: 15,
      mustardUnlocked: false,
      visibleBloomCount: 0,
      freeBadgeCount: 6,
      qaSeedStreakScore: 15
    })
  }),
  Object.freeze({
    id: 'milestone-streak-7',
    label: '连续 7 天 · MilestoneGlow',
    intent: '6 个连续练习日 + 今日达标 → streak-7 节点可 claim',
    seed: Object.freeze({
      practiceDayCount: 6,
      lifetimeMinutes: 6 * 25,
      todayKey: GROWTH_PERSONA_TODAY_KEY,
      practiceDayEntries: Object.freeze([
        { date: '2026-09-04', totalMinutes: 25 },
        { date: '2026-09-05', totalMinutes: 25 },
        { date: '2026-09-06', totalMinutes: 25 },
        { date: '2026-09-07', totalMinutes: 25 },
        { date: '2026-09-08', totalMinutes: 25 },
        { date: '2026-09-09', totalMinutes: 25 }
      ])
    }),
    expectations: Object.freeze({
      score: 8,
      mustardUnlocked: false,
      visibleBloomCount: 5,
      freeBadgeCount: 3,
      milestoneNodeId: 'streak-7'
    })
  })
]);

/**
 * @param {string} personaId
 * @returns {GrowthPersonaFixture | undefined}
 */
export function getGrowthPersonaFixture(personaId) {
  return GROWTH_PERSONA_FIXTURES.find((p) => p.id === personaId);
}
