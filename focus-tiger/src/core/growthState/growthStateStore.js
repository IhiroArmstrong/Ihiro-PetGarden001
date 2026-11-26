/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T108 — persisted growth-state.v1 (authorized goals + derived suppress flags).
 * Free-text confide / diary content must never be written here.
 */

import { getStorage, setStorage } from '../../utils/Storage.js';

export const GROWTH_STATE_STORAGE_KEY = 'focus-tiger.growth-state.v1';
export const GROWTH_STATE_PERSIST_SCHEMA = 1;
export const GROWTH_AUTHORIZED_GOAL_MAX = 5;
export const GROWTH_AUTHORIZED_GOAL_TEXT_MAX = 120;

/**
 * @typedef {'active' | 'done'} GrowthAuthorizedGoalStatus
 * @typedef {{ id: string, text: string, status: GrowthAuthorizedGoalStatus, createdAt: number, completedAt?: number }} GrowthAuthorizedGoal
 * @typedef {{ v: number, goalsConsentAt: number | null, goals: GrowthAuthorizedGoal[], derivedSuppress: { adaptation: boolean } }} GrowthStatePersisted
 */

export function defaultGrowthStatePersisted() {
  return {
    v: GROWTH_STATE_PERSIST_SCHEMA,
    goalsConsentAt: null,
    goals: [],
    derivedSuppress: { adaptation: false }
  };
}

/**
 * @param {unknown} raw
 * @returns {GrowthStatePersisted}
 */
export function normalizeGrowthStatePersisted(raw) {
  const base = defaultGrowthStatePersisted();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw;
  if (Number(obj.v) === 1) base.v = 1;
  const consent = Number(obj.goalsConsentAt);
  if (Number.isFinite(consent) && consent > 0) {
    base.goalsConsentAt = consent;
  }
  if (Array.isArray(obj.goals)) {
    base.goals = obj.goals
      .filter((row) => row && typeof row === 'object')
      .map((row) => ({
        id: typeof row.id === 'string' ? row.id : '',
        text: normalizeGrowthGoalText(row.text),
        status: row.status === 'done' ? 'done' : 'active',
        createdAt: Number(row.createdAt) || 0,
        completedAt:
          row.completedAt != null ? Number(row.completedAt) || undefined : undefined
      }))
      .filter((row) => row.id && row.text);
  }
  if (obj.derivedSuppress && typeof obj.derivedSuppress === 'object') {
    base.derivedSuppress.adaptation = obj.derivedSuppress.adaptation === true;
  }
  return base;
}

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeGrowthGoalText(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, GROWTH_AUTHORIZED_GOAL_TEXT_MAX);
}

/**
 * @param {string} [key]
 * @returns {GrowthStatePersisted}
 */
export function readGrowthStatePersisted(key = GROWTH_STATE_STORAGE_KEY) {
  return normalizeGrowthStatePersisted(getStorage(key, null));
}

/**
 * @param {GrowthStatePersisted} state
 * @param {string} [key]
 * @returns {boolean}
 */
export function writeGrowthStatePersisted(state, key = GROWTH_STATE_STORAGE_KEY) {
  try {
    setStorage(key, normalizeGrowthStatePersisted(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} [key]
 * @returns {boolean}
 */
export function hasGrowthGoalsConsent(key = GROWTH_STATE_STORAGE_KEY) {
  const consent = readGrowthStatePersisted(key).goalsConsentAt;
  return Number.isFinite(consent) && consent > 0;
}

/**
 * @param {string} [key]
 * @returns {boolean}
 */
export function grantGrowthGoalsConsent(key = GROWTH_STATE_STORAGE_KEY) {
  const state = readGrowthStatePersisted(key);
  if (state.goalsConsentAt) return true;
  state.goalsConsentAt = Date.now();
  return writeGrowthStatePersisted(state, key);
}

function newGoalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {string} text
 * @param {string} [key]
 * @returns {{ ok: boolean, reason?: 'empty' | 'no-consent' | 'full' | 'persist-failed' }}
 */
export function addAuthorizedGrowthGoal(text, key = GROWTH_STATE_STORAGE_KEY) {
  const normalized = normalizeGrowthGoalText(text);
  if (!normalized) return { ok: false, reason: 'empty' };
  const state = readGrowthStatePersisted(key);
  if (!state.goalsConsentAt) return { ok: false, reason: 'no-consent' };
  const activeCount = state.goals.filter((g) => g.status === 'active').length;
  if (activeCount >= GROWTH_AUTHORIZED_GOAL_MAX) {
    return { ok: false, reason: 'full' };
  }
  state.goals.push({
    id: newGoalId(),
    text: normalized,
    status: 'active',
    createdAt: Date.now()
  });
  if (!writeGrowthStatePersisted(state, key)) {
    return { ok: false, reason: 'persist-failed' };
  }
  return { ok: true };
}

/**
 * @param {string} goalId
 * @param {string} [key]
 * @returns {boolean}
 */
export function removeAuthorizedGrowthGoal(goalId, key = GROWTH_STATE_STORAGE_KEY) {
  const state = readGrowthStatePersisted(key);
  const before = state.goals.length;
  state.goals = state.goals.filter((g) => g.id !== goalId);
  if (state.goals.length === before) return false;
  return writeGrowthStatePersisted(state, key);
}

/**
 * @param {string} goalId
 * @param {string} [key]
 * @returns {boolean}
 */
export function completeAuthorizedGrowthGoal(goalId, key = GROWTH_STATE_STORAGE_KEY) {
  const state = readGrowthStatePersisted(key);
  let touched = false;
  for (const goal of state.goals) {
    if (goal.id !== goalId || goal.status === 'done') continue;
    goal.status = 'done';
    goal.completedAt = Date.now();
    touched = true;
  }
  if (!touched) return false;
  return writeGrowthStatePersisted(state, key);
}

/**
 * Drop adaptation-derived fields from the read model after forget / disable.
 * Goals and consent are untouched; practice calendars are untouched.
 *
 * @param {string} [key]
 * @returns {boolean}
 */
export function clearGrowthStateDerivedOnAdaptationReset(
  key = GROWTH_STATE_STORAGE_KEY
) {
  const state = readGrowthStatePersisted(key);
  if (state.derivedSuppress.adaptation) return true;
  state.derivedSuppress.adaptation = true;
  return writeGrowthStatePersisted(state, key);
}