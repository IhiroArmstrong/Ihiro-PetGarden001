/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personalization Engine · L0 silence wrap + L1 local intelligence.
 *
 * SSOT: `docs/YIN_PERSONALIZATION_ENGINE.md`.
 * Does not replace Memory store, taste overlay, Qwen, or practice backup.
 * L2 State Pack is still discarded. No Speak probability.
 */

import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import { shouldUseDesktopCompanionGenerate } from './desktopCompanionL2Route.js';
import { JOURNEY_LOG_MAX_ENTRIES } from './journeyLogGate.js';
import { shouldShowMomentWhisper } from './momentWhispersGate.js';
import { canInjectYinMemoryConfidence } from './yinPersonalMemory/yinPersonalMemoryRetrieve.js';
import { retrieveYinMemoryEntriesForL3Generate } from './yinPersonalMemory/yinPersonalMemoryRetrieve.js';
import { YIN_MEMORY_L3_INJECT_MAX } from './yinPersonalMemory/yinPersonalMemoryRetrieve.js';

/** V1 three named styles; never a continuous intervention probability. */
export const YPE_COMPANION_STYLES = Object.freeze(['quiet', 'default', 'warm']);

export const YPE_FACTORY_COMPANION_STYLE = 'default';

export const YPE_RUNTIME_LEVEL = 'L1';

export const YPE_COMPANION_STYLE_STORAGE_KEY =
  'focus-tiger.ype-companion-style.v1';

/** Safety > corpus / ritual copy > Memory retrieve > Qwen. */
export const YPE_LAYER_ORDER = Object.freeze([
  'safety',
  'corpus',
  'memory',
  'qwen'
]);

export const YPE_INSIGHT_MIN_SITS = 10;

/**
 * @param {unknown} value
 * @returns {'quiet' | 'default' | 'warm'}
 */
export function normalizeYpeCompanionStyle(value) {
  return YPE_COMPANION_STYLES.includes(/** @type {string} */ (value))
    ? /** @type {'quiet' | 'default' | 'warm'} */ (value)
    : YPE_FACTORY_COMPANION_STYLE;
}

/**
 * Local user choice wins. Cloud pack style is ignored.
 * @param {unknown} [requested]
 * @returns {'quiet' | 'default' | 'warm'}
 */
export function resolveLocalCompanionStyle(requested) {
  return normalizeYpeCompanionStyle(requested);
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {'quiet' | 'default' | 'warm'}
 */
export function readYpeCompanionStyle(storage) {
  if (!storage?.getItem) return YPE_FACTORY_COMPANION_STYLE;
  try {
    return normalizeYpeCompanionStyle(storage.getItem(YPE_COMPANION_STYLE_STORAGE_KEY));
  } catch {
    return YPE_FACTORY_COMPANION_STYLE;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {unknown} style
 * @returns {'quiet' | 'default' | 'warm'}
 */
export function writeYpeCompanionStyle(storage, style) {
  const next = normalizeYpeCompanionStyle(style);
  if (!storage?.setItem) return next;
  try {
    if (next === YPE_FACTORY_COMPANION_STYLE) {
      storage.removeItem?.(YPE_COMPANION_STYLE_STORAGE_KEY);
    } else {
      storage.setItem(YPE_COMPANION_STYLE_STORAGE_KEY, next);
    }
  } catch {
    // ignore quota
  }
  return next;
}

/**
 * L2 never installs an overlay in L0/L1.
 * @param {unknown} [_pack]
 * @returns {{ applied: false, reason: 'l0-local-only' }}
 */
export function discardPersonalizationStatePack(_pack) {
  return Object.freeze({ applied: false, reason: 'l0-local-only' });
}

/**
 * @param {Parameters<typeof shouldUseDesktopCompanionGenerate>[0]} [opts]
 * @returns {boolean}
 */
export function ypeMayUseCompanionGenerate(opts) {
  return shouldUseDesktopCompanionGenerate(opts);
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} key
 * @param {{ busy?: boolean }} [opts]
 * @returns {boolean}
 */
export function ypeMayShowMomentWhisper(storage, key, opts = {}) {
  return shouldShowMomentWhisper(storage, key, opts);
}

/**
 * Formation inject gate — from Memory SSOT. Single oral stays `low` there.
 * @param {import('./yinPersonalMemory/yinPersonalMemorySchema.js').YinMemoryEntry | null | undefined} entry
 * @returns {boolean}
 */
export function ypeShouldInjectFormedMemory(entry) {
  return canInjectYinMemoryConfidence(entry);
}

/**
 * @param {'quiet' | 'default' | 'warm' | string} [style]
 * @returns {number}
 */
export function ypeRecallCap(style) {
  return normalizeYpeCompanionStyle(style) === 'quiet' ? 1 : YIN_MEMORY_L3_INJECT_MAX;
}

/**
 * @param {import('./yinPersonalMemory/yinPersonalMemorySchema.js').YinMemoryEntry[]} entries
 * @param {Array<{ memoryId?: string, rankHint?: number }> | null | undefined} rankHints
 * @returns {import('./yinPersonalMemory/yinPersonalMemorySchema.js').YinMemoryEntry[]}
 */
export function ypeSortWithOptionalRankHints(entries, rankHints) {
  const list = Array.isArray(entries) ? [...entries] : [];
  if (!Array.isArray(rankHints) || rankHints.length === 0) return list;
  /** @type {Map<string, number>} */
  const hints = new Map();
  for (const row of rankHints) {
    const id = typeof row?.memoryId === 'string' ? row.memoryId.trim() : '';
    const hint = Number(row?.rankHint);
    if (!id || !Number.isFinite(hint)) continue;
    hints.set(id, hint);
  }
  if (![...hints.keys()].some((id) => list.some((entry) => entry.id === id))) {
    return list;
  }
  return list.sort((a, b) => {
    const ha = hints.has(a.id) ? hints.get(a.id) : null;
    const hb = hints.has(b.id) ? hints.get(b.id) : null;
    if (ha != null && hb != null && ha !== hb) return hb - ha;
    if (ha != null && hb == null) return -1;
    if (ha == null && hb != null) return 1;
    return 0;
  });
}

/**
 * L1 retrieve contract: ≤3, theme + confidence + freshness, no hard insert,
 * session de-dupe, optional rankHint overlay without summaries.
 *
 * @param {object} [input]
 * @param {import('./yinPersonalMemory/yinPersonalMemorySchema.js').YinPersonalMemoryState | null} [input.state]
 * @param {string} [input.userText]
 * @param {string[]} [input.sessionExcludeIds]
 * @param {unknown} [input.companionStyle]
 * @param {Array<{ memoryId?: string, rankHint?: number }>} [input.rankHints]
 * @param {boolean} [input.skipYpeOnSafety]
 * @returns {{ entries: object[], summaries: string[], ids: string[] }}
 */
export function ypeRetrieveMemories(input = {}) {
  if (input.skipYpeOnSafety) {
    return { entries: [], summaries: [], ids: [] };
  }
  const style = resolveLocalCompanionStyle(input.companionStyle);
  const cap = ypeRecallCap(style);
  const exclude = new Set(
    (Array.isArray(input.sessionExcludeIds) ? input.sessionExcludeIds : []).filter(
      (id) => typeof id === 'string' && id
    )
  );
  const pool = retrieveYinMemoryEntriesForL3Generate(input.state, input.userText || '', {
    max: YIN_MEMORY_L3_INJECT_MAX
  }).filter((entry) => !exclude.has(entry.id));
  const sorted = ypeSortWithOptionalRankHints(pool, input.rankHints).slice(0, cap);
  return {
    entries: sorted,
    summaries: sorted.map((entry) => String(entry.summary).trim()),
    ids: sorted.map((entry) => entry.id)
  };
}

/**
 * @param {string} iso
 * @returns {'morning' | 'mid' | 'late' | null}
 */
function sitHourBucket(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const h = d.getHours();
  if (h < 12) return 'morning';
  if (h >= 18) return 'late';
  return 'mid';
}

/**
 * Structured Journey insights only. Never a diagnosis.
 *
 * @param {Array<{ at?: string, reflect?: boolean }> | { entries?: Array<{ at?: string, reflect?: boolean }> } | null | undefined} journal
 * @returns {Array<{ id: string, window: string, claim: string, evidence: object, tone: 'observation' }>}
 */
export function ypeBuildJourneyInsights(journal) {
  const rows = Array.isArray(journal)
    ? journal
    : Array.isArray(journal?.entries)
      ? journal.entries
      : [];
  const sits = rows.slice(-JOURNEY_LOG_MAX_ENTRIES);
  if (sits.length < YPE_INSIGHT_MIN_SITS) return [];

  let morningN = 0;
  let lateN = 0;
  let reflectedN = 0;
  for (const row of sits) {
    const bucket = sitHourBucket(row?.at || '');
    if (bucket === 'morning') morningN += 1;
    if (bucket === 'late') lateN += 1;
    if (row?.reflect === true) reflectedN += 1;
  }

  /** @type {Array<{ id: string, window: string, claim: string, evidence: object, tone: 'observation' }>} */
  const out = [];
  if (morningN >= 3 && lateN >= 3 && morningN > lateN) {
    out.push({
      id: 'morning_settle',
      window: 'last_30_sits',
      claim: 'completion_rate_morning > completion_rate_late',
      evidence: { morningN, lateN, sitN: sits.length },
      tone: 'observation'
    });
  }
  if (reflectedN > 0) {
    out.push({
      id: 'reflection_frequency',
      window: 'last_30_sits',
      claim: 'reflected_count / sit_count',
      evidence: { reflectedN, sitN: sits.length },
      tone: 'observation'
    });
  }
  return out;
}

/**
 * Warm may hand structured claims to L3. Quiet / default do not.
 * @param {unknown} style
 * @param {ReturnType<typeof ypeBuildJourneyInsights>} insights
 * @returns {ReturnType<typeof ypeBuildJourneyInsights>}
 */
export function ypeInsightsForGenerate(style, insights) {
  if (resolveLocalCompanionStyle(style) !== 'warm') return [];
  const rows = Array.isArray(insights) ? insights : [];
  return rows.filter((row) => row?.id === 'morning_settle');
}

/**
 * @param {object} [input]
 * @returns {Readonly<object>}
 */
export function evaluateYinPersonalizationPolicy(input = {}) {
  const packResult = discardPersonalizationStatePack(input.pack);
  const route = input.route ?? null;
  const skipYpeOnSafety = route === CONFIDE_ROUTE.SAFETY_REDIRECT;
  const companionStyle = resolveLocalCompanionStyle(
    input.requestedStyle ?? readYpeCompanionStyle(input.styleStorage)
  );
  const mayGenerate = ypeMayUseCompanionGenerate({
    route,
    generateEnabled: Boolean(input.generateEnabled),
    generateLayerOpen: Boolean(input.generateLayerOpen),
    hasGenerateFn: Boolean(input.hasGenerateFn)
  });
  const mayWhisper = ypeMayShowMomentWhisper(
    input.whisperStorage,
    input.whisperKey,
    { busy: Boolean(input.whisperBusy) }
  );

  return Object.freeze({
    runtimeLevel: YPE_RUNTIME_LEVEL,
    companionStyle,
    packOverlayApplied: packResult.applied,
    packDiscardReason: packResult.reason,
    layerOrder: YPE_LAYER_ORDER,
    skipYpeOnSafety,
    mayGenerate,
    mayWhisper,
    recallCap: ypeRecallCap(companionStyle)
  });
}
