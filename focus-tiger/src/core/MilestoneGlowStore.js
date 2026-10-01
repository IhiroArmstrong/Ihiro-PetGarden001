/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import {
  buildGlowClaimProvenanceMeta,
  catalogResolveGlowNodeId,
  MILESTONE_GLOW_STREAK_NODES
} from './MILESTONE_CATALOG.js';

/**
 * Which long-horizon MilestoneGlow nodes have already played (once each).
 * Only-add; quiet days never revoke. No Day-N scoreboard copy.
 *
 * Batch 2: `claimOffer` writes #890 scheme D provenance from `MILESTONE_CATALOG`.
 */

export const MILESTONE_GLOW_STORAGE_KEY = 'focus-tiger.milestone-glow.v1';

/** Re-exported from catalog SSOT (7/21/100 legacy glow ids). */
export { MILESTONE_GLOW_STREAK_NODES };

/**
 * @typedef {string | Record<string, unknown>} MilestoneGlowPlaceholderValue
 *
 * @typedef {{
 *   id: string,
 *   origin?: MilestoneGlowPlaceholderValue,
 *   journey_id?: string,
 *   rarity_basis?: MilestoneGlowPlaceholderValue
 * }} MilestoneGlowRecord
 *
 * @typedef {{ records: MilestoneGlowRecord[] }} MilestoneGlowState
 *
 * @typedef {{
 *   origin?: MilestoneGlowPlaceholderValue,
 *   journey_id?: string,
 *   rarity_basis?: MilestoneGlowPlaceholderValue
 * }} MilestoneGlowRecordMeta
 */

/**
 * @param {unknown} raw
 * @returns {MilestoneGlowPlaceholderValue | undefined}
 */
function normalizePlaceholderField(raw) {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return /** @type {Record<string, unknown>} */ (raw);
  }
  return undefined;
}

/**
 * @param {unknown} raw
 * @returns {MilestoneGlowRecord | null}
 */
function normalizeMilestoneGlowRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const id = typeof o.id === 'string' ? o.id.trim() : '';
  if (!id) return null;
  /** @type {MilestoneGlowRecord} */
  const record = { id };
  const origin = normalizePlaceholderField(o.origin);
  if (origin !== undefined) record.origin = origin;
  const journeyId =
    typeof o.journey_id === 'string' && o.journey_id.trim()
      ? o.journey_id.trim()
      : undefined;
  if (journeyId) record.journey_id = journeyId;
  const rarityBasis = normalizePlaceholderField(o.rarity_basis);
  if (rarityBasis !== undefined) record.rarity_basis = rarityBasis;
  return record;
}

/**
 * @param {unknown} raw
 * @returns {MilestoneGlowState}
 */
export function normalizeMilestoneGlowState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { records: [] };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (Array.isArray(o.records)) {
    /** @type {MilestoneGlowRecord[]} */
    const records = [];
    const seen = new Set();
    for (const row of o.records) {
      const record = normalizeMilestoneGlowRecord(row);
      if (!record || seen.has(record.id)) continue;
      seen.add(record.id);
      records.push(record);
    }
    return { records };
  }
  if (Array.isArray(o.played)) {
    /** @type {MilestoneGlowRecord[]} */
    const records = [];
    const seen = new Set();
    for (const row of o.played) {
      if (typeof row !== 'string' || !row.trim()) continue;
      const id = row.trim();
      if (seen.has(id)) continue;
      seen.add(id);
      records.push({ id });
    }
    return { records };
  }
  return { records: [] };
}

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
  return catalogResolveGlowNodeId(streakDays, playedIds);
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
    /** @type {MilestoneGlowState} */
    this._memoryState = { records: [] };
  }

  /** @returns {Set<string>} */
  getPlayedIds() {
    return new Set(this._read().records.map((record) => record.id));
  }

  /** @returns {MilestoneGlowRecord[]} */
  getRecords() {
    return this._read().records.map((record) => ({ ...record }));
  }

  /**
   * @param {string} nodeId
   * @param {MilestoneGlowRecordMeta} [meta]
   * @returns {boolean} true if newly recorded
   */
  markPlayed(nodeId, meta = {}) {
    const id = String(nodeId || '');
    if (!id) return false;
    const records = this._read().records.slice();
    if (records.some((record) => record.id === id)) return false;
    /** @type {MilestoneGlowRecord} */
    const record = { id };
    const origin = normalizePlaceholderField(meta.origin);
    if (origin !== undefined) record.origin = origin;
    const journeyId =
      typeof meta.journey_id === 'string' && meta.journey_id.trim()
        ? meta.journey_id.trim()
        : undefined;
    if (journeyId) record.journey_id = journeyId;
    const rarityBasis = normalizePlaceholderField(meta.rarity_basis);
    if (rarityBasis !== undefined) record.rarity_basis = rarityBasis;
    records.push(record);
    this._write({ records });
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
   * @param {MilestoneGlowRecordMeta} [meta]
   * @returns {string | null}
   */
  claimOffer(streakDays, meta = {}) {
    const id = this.peekOffer(streakDays);
    if (!id) return null;
    this.markPlayed(id, { ...buildGlowClaimProvenanceMeta(id), ...meta });
    return id;
  }

  _read() {
    if (!this.storage) return this._memoryState;
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storageKey) ?? 'null');
      const normalized = normalizeMilestoneGlowState(parsed);
      this._memoryState = normalized;
      return this._memoryState;
    } catch {
      /* ignore */
    }
    return this._memoryState;
  }

  /** @param {MilestoneGlowState} state */
  _write(state) {
    this._memoryState = normalizeMilestoneGlowState(state);
    if (!this.storage) return;
    try {
      this.storage.setItem(
        this.storageKey,
        JSON.stringify(this._memoryState)
      );
    } catch {
      /* ignore */
    }
  }
}
