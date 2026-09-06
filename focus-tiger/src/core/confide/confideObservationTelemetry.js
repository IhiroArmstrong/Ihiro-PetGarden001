/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide Batch 0 observation telemetry — local-only, no user free text.
 * Sink: console.log (RetentionTelemetry style) + localStorage ring buffer;
 * Electron also appends userData/companion-l2/confide-observation.jsonl via IPC.
 */

import { CONFIDE_VERBAL_HINT_CHIPS } from './confideVerbalHintChips.js';

export const CONFIDE_OBSERVATION_STORAGE_KEY = 'focus-tiger.confide-observation.v1';
export const CONFIDE_OBSERVATION_MAX_EVENTS = 500;

export const CONFIDE_OBSERVATION_EVENTS = Object.freeze({
  CHIP_TAPPED: 'confide_chip_tapped',
  SHARE: 'confide_share'
});

/**
 * @param {string} text
 * @param {(key: string) => string} [translate]
 * @returns {string | null}
 */
export function resolveChipIdForSubmittedText(text, translate = () => '') {
  const normalized = typeof text === 'string' ? text.trim() : '';
  if (!normalized) return null;
  for (const chip of CONFIDE_VERBAL_HINT_CHIPS) {
    if (chip.shipped !== true) continue;
    const fill = translate(chip.fillKey).trim();
    if (fill && fill === normalized) return chip.id;
  }
  return null;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {object[]}
 */
export function readConfideObservationEvents(storage) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(CONFIDE_OBSERVATION_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {object} record
 * @param {Storage | null | undefined} storage
 */
export function appendConfideObservationEvent(record, storage) {
  if (!storage || !record || typeof record !== 'object') return;
  try {
    const events = readConfideObservationEvents(storage);
    events.push(record);
    const trimmed =
      events.length > CONFIDE_OBSERVATION_MAX_EVENTS
        ? events.slice(-CONFIDE_OBSERVATION_MAX_EVENTS)
        : events;
    storage.setItem(CONFIDE_OBSERVATION_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* local log must not break Share */
  }
}

/**
 * @param {object[]} events
 */
export function summarizeConfideObservationEvents(events) {
  const list = Array.isArray(events) ? events : [];
  /** @type {Record<string, number>} */
  const chipTaps = {};
  /** @type {Record<string, number>} */
  const shareBySource = {};
  let shareWithChipMatch = 0;
  let shareTotal = 0;

  for (const row of list) {
    if (!row || typeof row !== 'object') continue;
    if (row.event === CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED) {
      const chipId = typeof row.chipId === 'string' ? row.chipId : 'unknown';
      chipTaps[chipId] = (chipTaps[chipId] || 0) + 1;
      continue;
    }
    if (row.event === CONFIDE_OBSERVATION_EVENTS.SHARE) {
      shareTotal += 1;
      const source =
        typeof row.dataSource === 'string' ? row.dataSource : 'unknown';
      shareBySource[source] = (shareBySource[source] || 0) + 1;
      if (row.matchedChipId) shareWithChipMatch += 1;
    }
  }

  return {
    totalEvents: list.length,
    chipTaps,
    shareTotal,
    shareBySource,
    shareWithChipMatch,
    shareChipMatchRate:
      shareTotal > 0 ? shareWithChipMatch / shareTotal : null
  };
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function getDefaultAppendSink() {
  try {
    const shell = globalThis.desktopShell;
    if (shell?.confideObservation?.append) {
      return (record) => {
        void shell.confideObservation.append(record);
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} props
 * @param {{
 *   log?: (...args: unknown[]) => void,
 *   storage?: Storage | null,
 *   append?: ((record: object) => void) | null,
 *   now?: () => number
 * }} [options]
 */
export function trackConfideObservationEvent(name, props = {}, options = {}) {
  const {
    log = console.log,
    storage = getDefaultStorage(),
    append = getDefaultAppendSink(),
    now = () => Date.now()
  } = options;
  const record = { event: name, at: now(), ...props };
  log('[ConfideObservationTelemetry]', name, props);
  appendConfideObservationEvent(record, storage);
  try {
    append?.(record);
  } catch {
    /* local log must not break Share */
  }
}

/**
 * @param {string} chipId
 * @param {Parameters<typeof trackConfideObservationEvent>[2]} [options]
 */
export function trackConfideChipTapped(chipId, options) {
  if (typeof chipId !== 'string' || !chipId) return;
  trackConfideObservationEvent(
    CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED,
    { chipId },
    options
  );
}

/**
 * @param {{ dataSource: string, userText: string }} payload
 * @param {Parameters<typeof trackConfideObservationEvent>[2] & {
 *   translate?: (key: string) => string
 * }} [options]
 */
export function trackConfideShare(payload, options = {}) {
  const dataSource =
    typeof payload?.dataSource === 'string' ? payload.dataSource : 'unknown';
  const translate = options.translate ?? (() => '');
  const matchedChipId = resolveChipIdForSubmittedText(payload?.userText, translate);
  trackConfideObservationEvent(
    CONFIDE_OBSERVATION_EVENTS.SHARE,
    {
      dataSource,
      matchedChipId
    },
    options
  );
}
