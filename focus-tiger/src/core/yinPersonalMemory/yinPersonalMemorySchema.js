/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · schema + normalize (Slice 1a skeleton).
 * SSOT: docs/YIN_PERSONAL_MEMORY.md §5–§6.
 * Persisted in Electron userData only — not localStorage, not practice backup.
 */

export const YIN_PERSONAL_MEMORY_SCHEMA_VERSION = 1;

/** @typedef {'preference' | 'pattern' | 'moment' | 'relationship'} YinMemoryKind */

/** @typedef {'low' | 'medium' | 'high'} YinMemoryConfidence */

/** @typedef {'proposed' | 'active' | 'superseded' | 'forgotten'} YinMemoryStatus */

/** @typedef {'granted' | 'denied'} YinMemoryConsent */

/**
 * @typedef {{
 *   id: string,
 *   kind: YinMemoryKind,
 *   summary: string,
 *   evidence: string,
 *   confidence: YinMemoryConfidence,
 *   firstSeenAt: string,
 *   lastSeenAt: string,
 *   status: YinMemoryStatus,
 *   sourceRoute: string
 * }} YinMemoryEntry
 *
 * @typedef {{
 *   schemaVersion: number,
 *   consent: YinMemoryConsent | null,
 *   consentedAt: string | null,
 *   memories: YinMemoryEntry[]
 * }} YinPersonalMemoryState
 */

const MEMORY_KINDS = new Set(['preference', 'pattern', 'moment', 'relationship']);
const CONFIDENCE_LEVELS = new Set(['low', 'medium', 'high']);
const MEMORY_STATUSES = new Set(['proposed', 'active', 'superseded', 'forgotten']);
const CONSENT_VALUES = new Set(['granted', 'denied']);

/**
 * @returns {YinPersonalMemoryState}
 */
export function emptyYinPersonalMemoryState() {
  return {
    schemaVersion: YIN_PERSONAL_MEMORY_SCHEMA_VERSION,
    consent: null,
    consentedAt: null,
    memories: []
  };
}

/**
 * @param {unknown} raw
 * @returns {YinMemoryEntry | null}
 */
export function normalizeYinMemoryEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const kind = typeof o.kind === 'string' ? o.kind : '';
  const status = typeof o.status === 'string' ? o.status : '';
  const confidence = typeof o.confidence === 'string' ? o.confidence : '';
  const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : null;
  const summary = typeof o.summary === 'string' ? o.summary.trim() : '';
  const evidence = typeof o.evidence === 'string' ? o.evidence.trim() : '';
  const firstSeenAt = typeof o.firstSeenAt === 'string' ? o.firstSeenAt : '';
  const lastSeenAt = typeof o.lastSeenAt === 'string' ? o.lastSeenAt : '';
  const sourceRoute = typeof o.sourceRoute === 'string' ? o.sourceRoute.trim() : '';
  if (
    !id ||
    !MEMORY_KINDS.has(kind) ||
    !MEMORY_STATUSES.has(status) ||
    !CONFIDENCE_LEVELS.has(confidence) ||
    !summary ||
    !firstSeenAt ||
    !lastSeenAt ||
    !sourceRoute
  ) {
    return null;
  }
  return {
    id,
    kind: /** @type {YinMemoryKind} */ (kind),
    summary,
    evidence,
    confidence: /** @type {YinMemoryConfidence} */ (confidence),
    firstSeenAt,
    lastSeenAt,
    status: /** @type {YinMemoryStatus} */ (status),
    sourceRoute
  };
}

/**
 * @param {unknown} raw
 * @returns {YinPersonalMemoryState}
 */
export function normalizeYinPersonalMemoryState(raw) {
  const empty = emptyYinPersonalMemoryState();
  if (!raw || typeof raw !== 'object') return empty;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const schemaVersion =
    Number(o.schemaVersion) === YIN_PERSONAL_MEMORY_SCHEMA_VERSION
      ? YIN_PERSONAL_MEMORY_SCHEMA_VERSION
      : YIN_PERSONAL_MEMORY_SCHEMA_VERSION;
  const consentRaw = o.consent;
  const consent =
    typeof consentRaw === 'string' && CONSENT_VALUES.has(consentRaw)
      ? /** @type {YinMemoryConsent} */ (consentRaw)
      : null;
  const consentedAt =
    typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : null;
  const memories = [];
  if (Array.isArray(o.memories)) {
    for (const row of o.memories) {
      const entry = normalizeYinMemoryEntry(row);
      if (entry) memories.push(entry);
    }
  }
  return {
    schemaVersion,
    consent,
    consentedAt: consent ? consentedAt : null,
    memories
  };
}
