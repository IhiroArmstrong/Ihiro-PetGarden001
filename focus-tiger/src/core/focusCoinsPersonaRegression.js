/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Coins persona regression — daily income + calendar milestones from live ledger.
 *
 * Charter: `docs/task-briefs/task-yin-coin-daily-cap-economy.md` §4.
 */

import { COMPANION_MODE_ACROSS_TOOLS, COMPANION_MODE_STAY } from './FocusSession.js';
import {
  GRANT_KIND,
  TOTAL_DAILY_CAP,
  computeFocusCoinsGrant,
  emptyFocusCoinsDayState,
  emptyFocusCoinsSessionState,
  focusCoinsDayTotal
} from './focusCoinsLedger.js';

/**
 * @typedef {{
 *   kind: string,
 *   reachedTarget?: boolean,
 *   companionMode?: string,
 *   durationMinutes?: number,
 *   resetSession?: boolean
 * }} FocusCoinsPersonaGrantStep
 */

/**
 * @param {readonly FocusCoinsPersonaGrantStep[]} steps
 * @param {{ yesterdayPracticed?: boolean }} [opts]
 * @returns {{ total: number, hitsTotalCap: boolean, day: import('./focusCoinsLedger.js').FocusCoinsDayState }}
 */
export function simulateFocusCoinsPersonaDay(steps, opts = {}) {
  let day = emptyFocusCoinsDayState();
  let session = emptyFocusCoinsSessionState();
  let total = 0;

  for (const step of steps) {
    if (step.resetSession) {
      session = emptyFocusCoinsSessionState();
    }
    const result = computeFocusCoinsGrant(
      step,
      day,
      session,
      { yesterdayPracticed: opts.yesterdayPracticed === true }
    );
    day = result.nextDay;
    session = result.nextSession;
    total += result.points;
  }

  return {
    total,
    hitsTotalCap: focusCoinsDayTotal(day) >= TOTAL_DAILY_CAP,
    day
  };
}

/** Cheapest shop SKU (座右小碑) — see `task-yin-coin-daily-cap-economy.md` §4.2. */
export const FOCUS_COINS_FIRST_SKU_PRICE = 18;
export const FOCUS_COINS_FIRST_SKU_MIN_PRACTICE_DAYS = 3;
export const FOCUS_COINS_DRAWER_TOTAL_PRICE = 648;

/**
 * @param {number} targetCoins
 * @param {number} dailyIncomeD0
 * @param {number} dailyIncomeD
 * @returns {number}
 */
export function calendarDaysToEarnCoins(targetCoins, dailyIncomeD0, dailyIncomeD) {
  const target = Math.max(0, Math.floor(Number(targetCoins) || 0));
  const d0 = Math.max(0, Math.floor(Number(dailyIncomeD0) || 0));
  const d = Math.max(0, Math.floor(Number(dailyIncomeD) || 0));
  if (target <= 0) return 0;
  if (target <= d0) return 1;
  if (d <= 0) return Number.POSITIVE_INFINITY;
  return 1 + Math.ceil((target - d0) / d);
}

/**
 * @param {number} dailyIncomeD0
 * @param {number} dailyIncomeD
 * @returns {number}
 */
export function calendarDaysToFirstSku(dailyIncomeD0, dailyIncomeD) {
  return Math.max(
    calendarDaysToEarnCoins(
      FOCUS_COINS_FIRST_SKU_PRICE,
      dailyIncomeD0,
      dailyIncomeD
    ),
    FOCUS_COINS_FIRST_SKU_MIN_PRACTICE_DAYS
  );
}

/**
 * @typedef {{
 *   dailyIncomeD0: number,
 *   dailyIncomeD: number,
 *   hitsTotalCap: boolean,
 *   calendarDaysToFirstSku: number,
 *   calendarDaysToDrawer648: number
 * }} FocusCoinsPersonaExpectations
 */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   intent: string,
 *   domain: 'focus-coins',
 *   focusCoinsDayScript: { readonly steps: readonly FocusCoinsPersonaGrantStep[] },
 *   focusCoinsExpectations: FocusCoinsPersonaExpectations
 * }} FocusCoinsPersonaFixture
 */

const TIMED = (companionMode, durationMinutes) =>
  Object.freeze({
    kind: GRANT_KIND.TIMED,
    reachedTarget: true,
    companionMode,
    durationMinutes
  });

const SESSION_BREAK = Object.freeze({ kind: GRANT_KIND.INCOMPLETE, resetSession: true });

/**
 * @type {readonly FocusCoinsPersonaFixture[]}
 */
export const FOCUS_COINS_PERSONA_FIXTURES = Object.freeze([
  Object.freeze({
    id: 'light-stay-10',
    label: '轻量 Stay 10',
    intent:
      '1× Stay 10 + Arrive + Reflect — 约 3 日结缘最便宜清供；永远撞不到 48 封顶',
    domain: 'focus-coins',
    focusCoinsDayScript: Object.freeze({
      steps: Object.freeze([
        TIMED(COMPANION_MODE_STAY, 10),
        Object.freeze({ kind: GRANT_KIND.ARRIVE }),
        Object.freeze({ kind: GRANT_KIND.REFLECT })
      ])
    }),
    focusCoinsExpectations: Object.freeze({
      dailyIncomeD0: 6,
      dailyIncomeD: 9,
      hitsTotalCap: false,
      calendarDaysToFirstSku: 3,
      calendarDaysToDrawer648: 73
    })
  }),
  Object.freeze({
    id: 'medium-stay-25',
    label: '中等 Stay 25',
    intent:
      'Stay 25 + 仪式全套 + Breath 10m — 第一件清供卡练习日 3；撞不到 48',
    domain: 'focus-coins',
    focusCoinsDayScript: Object.freeze({
      steps: Object.freeze([
        TIMED(COMPANION_MODE_STAY, 25),
        Object.freeze({ kind: GRANT_KIND.ARRIVE }),
        Object.freeze({ kind: GRANT_KIND.REFLECT }),
        Object.freeze({ kind: GRANT_KIND.ACTIVE_RECOVER }),
        TIMED(COMPANION_MODE_ACROSS_TOOLS, 10)
      ])
    }),
    focusCoinsExpectations: Object.freeze({
      dailyIncomeD0: 11,
      dailyIncomeD: 14,
      hitsTotalCap: false,
      calendarDaysToFirstSku: 3,
      calendarDaysToDrawer648: 47
    })
  }),
  Object.freeze({
    id: 'honesty-30',
    label: '仅 Honesty 30',
    intent: 'Honesty-only 日收入低；第一件清供约 4 日；撞不到 48',
    domain: 'focus-coins',
    focusCoinsDayScript: Object.freeze({
      steps: Object.freeze([
        Object.freeze({ kind: GRANT_KIND.HONESTY, durationMinutes: 30 })
      ])
    }),
    focusCoinsExpectations: Object.freeze({
      dailyIncomeD0: 3,
      dailyIncomeD: 6,
      hitsTotalCap: false,
      calendarDaysToFirstSku: 4,
      calendarDaysToDrawer648: 109
    })
  }),
  Object.freeze({
    id: 'breath-1',
    label: '仅 Breath 10m',
    intent: '单场半速 1 点 — 最慢清空曲线；撞不到 48',
    domain: 'focus-coins',
    focusCoinsDayScript: Object.freeze({
      steps: Object.freeze([TIMED(COMPANION_MODE_ACROSS_TOOLS, 10)])
    }),
    focusCoinsExpectations: Object.freeze({
      dailyIncomeD0: 1,
      dailyIncomeD: 4,
      hitsTotalCap: false,
      calendarDaysToFirstSku: 6,
      calendarDaysToDrawer648: 163
    })
  }),
  Object.freeze({
    id: 'binge-cap',
    label: '刷满日封顶',
    intent: '故意刷满全日合计 48 — 唯一切到封顶的人；14 日清空抽屉',
    domain: 'focus-coins',
    focusCoinsDayScript: Object.freeze({
      steps: Object.freeze([
        TIMED(COMPANION_MODE_STAY, 180),
        Object.freeze({ kind: GRANT_KIND.HONESTY, durationMinutes: 30 }),
        Object.freeze({ kind: GRANT_KIND.ARRIVE }),
        Object.freeze({ kind: GRANT_KIND.REFLECT }),
        Object.freeze({ kind: GRANT_KIND.ACTIVE_RECOVER }),
        Object.freeze({ kind: GRANT_KIND.MICRO_RITUAL }),
        SESSION_BREAK,
        Object.freeze({ kind: GRANT_KIND.ARRIVE }),
        Object.freeze({ kind: GRANT_KIND.REFLECT }),
        Object.freeze({ kind: GRANT_KIND.ACTIVE_RECOVER })
      ])
    }),
    focusCoinsExpectations: Object.freeze({
      dailyIncomeD0: 48,
      dailyIncomeD: 48,
      hitsTotalCap: true,
      calendarDaysToFirstSku: 3,
      calendarDaysToDrawer648: 14
    })
  })
]);

/**
 * @param {FocusCoinsPersonaFixture} persona
 * @returns {string[]}
 */
export function listFocusCoinsPersonaExpectationViolations(persona) {
  const script = persona.focusCoinsDayScript.steps;
  const d0 = simulateFocusCoinsPersonaDay(script, { yesterdayPracticed: false });
  const d = simulateFocusCoinsPersonaDay(script, { yesterdayPracticed: true });
  const expected = persona.focusCoinsExpectations;
  /** @type {string[]} */
  const out = [];

  if (d0.total !== expected.dailyIncomeD0) {
    out.push(
      `dailyIncomeD0 expected ${expected.dailyIncomeD0} got ${d0.total}`
    );
  }
  if (d.total !== expected.dailyIncomeD) {
    out.push(`dailyIncomeD expected ${expected.dailyIncomeD} got ${d.total}`);
  }
  if (d0.hitsTotalCap !== expected.hitsTotalCap) {
    out.push(
      `hitsTotalCap expected ${expected.hitsTotalCap} got ${d0.hitsTotalCap}`
    );
  }

  const firstSkuDays = calendarDaysToFirstSku(
    expected.dailyIncomeD0,
    expected.dailyIncomeD
  );
  if (firstSkuDays !== expected.calendarDaysToFirstSku) {
    out.push(
      `calendarDaysToFirstSku expected ${expected.calendarDaysToFirstSku} got ${firstSkuDays}`
    );
  }

  const drawerDays = calendarDaysToEarnCoins(
    FOCUS_COINS_DRAWER_TOTAL_PRICE,
    expected.dailyIncomeD0,
    expected.dailyIncomeD
  );
  if (drawerDays !== expected.calendarDaysToDrawer648) {
    out.push(
      `calendarDaysToDrawer648 expected ${expected.calendarDaysToDrawer648} got ${drawerDays}`
    );
  }

  return out;
}

/**
 * @returns {{ ok: boolean, failures: { id: string, violations: string[] }[] }}
 */
export function runFocusCoinsPersonaRegression() {
  /** @type {{ id: string, violations: string[] }[]} */
  const failures = [];
  for (const persona of FOCUS_COINS_PERSONA_FIXTURES) {
    const violations = listFocusCoinsPersonaExpectationViolations(persona);
    if (violations.length > 0) {
      failures.push({ id: persona.id, violations });
    }
  }
  return { ok: failures.length === 0, failures };
}
