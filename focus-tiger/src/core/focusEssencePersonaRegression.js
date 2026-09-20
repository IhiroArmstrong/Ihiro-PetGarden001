/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Essence persona regression — mirrors focus-coins earn personas.
 *
 * Slice 3: essence daily totals must match coin persona D0/D (same ledger caps).
 *
 * @see docs/planning/focus-essence-coin-split-audit.md §5 Slice 3
 */

import {
  computeFocusEssenceGrant,
  emptyFocusEssenceDayState,
  emptyFocusEssenceSessionState,
  focusEssenceDayTotal
} from './focusEssenceLedger.js';
import { TOTAL_DAILY_CAP } from './focusCoinsLedger.js';
import {
  FOCUS_COINS_PERSONA_FIXTURES,
  simulateFocusCoinsPersonaDay
} from './focusCoinsPersonaRegression.js';

/**
 * @param {readonly import('./focusCoinsPersonaRegression.js').FocusCoinsPersonaGrantStep[]} steps
 * @param {{ yesterdayPracticed?: boolean }} [opts]
 * @returns {{ total: number, hitsTotalCap: boolean }}
 */
export function simulateFocusEssencePersonaDay(steps, opts = {}) {
  let day = emptyFocusEssenceDayState();
  let session = emptyFocusEssenceSessionState();
  let total = 0;

  for (const step of steps) {
    if (step.resetSession) {
      session = emptyFocusEssenceSessionState();
    }
    const result = computeFocusEssenceGrant(
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
    hitsTotalCap: focusEssenceDayTotal(day) >= TOTAL_DAILY_CAP
  };
}

/**
 * @param {import('./focusCoinsPersonaRegression.js').FocusCoinsPersonaFixture} persona
 * @returns {string[]}
 */
export function listFocusEssencePersonaExpectationViolations(persona) {
  const script = persona.focusCoinsDayScript.steps;
  const coinsD0 = simulateFocusCoinsPersonaDay(script, { yesterdayPracticed: false });
  const coinsD = simulateFocusCoinsPersonaDay(script, { yesterdayPracticed: true });
  const essenceD0 = simulateFocusEssencePersonaDay(script, { yesterdayPracticed: false });
  const essenceD = simulateFocusEssencePersonaDay(script, { yesterdayPracticed: true });
  /** @type {string[]} */
  const out = [];

  if (essenceD0.total !== coinsD0.total) {
    out.push(
      `dailyIncomeD0 essence ${essenceD0.total} != coin ${coinsD0.total}`
    );
  }
  if (essenceD.total !== coinsD.total) {
    out.push(`dailyIncomeD essence ${essenceD.total} != coin ${coinsD.total}`);
  }
  if (essenceD0.hitsTotalCap !== coinsD0.hitsTotalCap) {
    out.push(
      `hitsTotalCap D0 essence ${essenceD0.hitsTotalCap} != coin ${coinsD0.hitsTotalCap}`
    );
  }
  if (essenceD.hitsTotalCap !== coinsD.hitsTotalCap) {
    out.push(
      `hitsTotalCap D essence ${essenceD.hitsTotalCap} != coin ${coinsD.hitsTotalCap}`
    );
  }

  const expected = persona.focusCoinsExpectations;
  if (essenceD0.total !== expected.dailyIncomeD0) {
    out.push(
      `dailyIncomeD0 expected ${expected.dailyIncomeD0} got ${essenceD0.total}`
    );
  }
  if (essenceD.total !== expected.dailyIncomeD) {
    out.push(`dailyIncomeD expected ${expected.dailyIncomeD} got ${essenceD.total}`);
  }
  if (essenceD0.hitsTotalCap !== expected.hitsTotalCap) {
    out.push(
      `hitsTotalCap expected ${expected.hitsTotalCap} got ${essenceD0.hitsTotalCap}`
    );
  }

  return out;
}

/**
 * @returns {{ ok: boolean, failures: { id: string, violations: string[] }[] }}
 */
export function runFocusEssencePersonaRegression() {
  /** @type {{ id: string, violations: string[] }[]} */
  const failures = [];
  for (const persona of FOCUS_COINS_PERSONA_FIXTURES) {
    const violations = listFocusEssencePersonaExpectationViolations(persona);
    if (violations.length > 0) {
      failures.push({ id: persona.id, violations });
    }
  }
  return { ok: failures.length === 0, failures };
}
