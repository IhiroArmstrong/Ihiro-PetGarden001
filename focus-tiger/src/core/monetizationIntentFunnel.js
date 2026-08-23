/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Monetization intent funnel — local store (+ optional afterRecord hook for opt-in upload).
 * Nodes: Support open → card CTA → Checkout start → paid complete (Test Mode OK).
 *
 * @see docs/PROCESS.md「付费 · 意愿漏斗本地统计」
 * @see docs/task-briefs/task-monetization-intent-funnel-opt-in.md
 */

export const MONETIZATION_FUNNEL_STORAGE_KEY =
  'focus-tiger.monetization-funnel.v1';

/** @typedef {'tea' | 'sanctuary' | 'membership'} MonetizationTrack */

export const MONETIZATION_FUNNEL_EVENTS = Object.freeze({
  SUPPORT_OPEN: 'support_open',
  SUPPORT_CTA: 'support_cta',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  CHECKOUT_CANCEL: 'checkout_cancel'
});

/** @type {readonly MonetizationTrack[]} */
export const MONETIZATION_TRACKS = Object.freeze([
  'tea',
  'sanctuary',
  'membership'
]);

/** @typedef {'tea-first' | 'sanctuary-first'} MonetizationFunnelLayout */

/** @type {readonly MonetizationFunnelLayout[]} */
export const MONETIZATION_FUNNEL_LAYOUTS = Object.freeze([
  'tea-first',
  'sanctuary-first'
]);

const MAX_EVENTS = 80;

/**
 * @typedef {{
 *   at: string,
 *   name: string,
 *   track: MonetizationTrack | null,
 *   source: string | null,
 *   layout: MonetizationFunnelLayout | null
 * }} MonetizationFunnelEvent
 */

/**
 * @typedef {{
 *   counts: Record<string, number>,
 *   events: MonetizationFunnelEvent[]
 * }} MonetizationFunnelState
 */

/**
 * @param {unknown} raw
 * @returns {MonetizationFunnelState}
 */
export function normalizeMonetizationFunnelState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { counts: {}, events: [] };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  /** @type {Record<string, number>} */
  const counts = {};
  if (o.counts && typeof o.counts === 'object') {
    for (const [k, v] of Object.entries(
      /** @type {Record<string, unknown>} */ (o.counts)
    )) {
      const n = Number(v);
      if (k && Number.isFinite(n) && n > 0) counts[k] = Math.floor(n);
    }
  }
  /** @type {MonetizationFunnelEvent[]} */
  const events = [];
  if (Array.isArray(o.events)) {
    for (const row of o.events) {
      if (!row || typeof row !== 'object') continue;
      const r = /** @type {Record<string, unknown>} */ (row);
      const name = typeof r.name === 'string' ? r.name : '';
      if (!name) continue;
      const track =
        r.track === 'tea' ||
        r.track === 'sanctuary' ||
        r.track === 'membership'
          ? r.track
          : null;
      events.push({
        at: typeof r.at === 'string' && r.at ? r.at : '',
        name,
        track,
        source: typeof r.source === 'string' && r.source ? r.source : null,
        layout: parseMonetizationFunnelLayout(r.layout)
      });
    }
  }
  return { counts, events: events.slice(-MAX_EVENTS) };
}

/**
 * @param {unknown} value
 * @returns {MonetizationFunnelLayout | null}
 */
export function parseMonetizationFunnelLayout(value) {
  return value === 'tea-first' || value === 'sanctuary-first' ? value : null;
}

/**
 * Count keys: name; `name:track`; `name:layout`; `name:track:layout`.
 * Keep in sync with `cloud/src/lib/monetizationFunnelKv.ts`.
 * @param {string} k
 * @returns {boolean}
 */
export function isAllowedMonetizationFunnelCountKey(k) {
  if (typeof k !== 'string' || !k) return false;
  const parts = k.split(':');
  if (parts.length < 1 || parts.length > 3) return false;
  const allowedNames = new Set(Object.values(MONETIZATION_FUNNEL_EVENTS));
  if (!allowedNames.has(parts[0])) return false;
  if (parts.length === 1) return true;
  const second = parts[1];
  const secondOk =
    MONETIZATION_TRACKS.includes(/** @type {MonetizationTrack} */ (second)) ||
    Boolean(parseMonetizationFunnelLayout(second));
  if (!secondOk) return false;
  if (parts.length === 2) return true;
  return (
    MONETIZATION_TRACKS.includes(/** @type {MonetizationTrack} */ (parts[1])) &&
    Boolean(parseMonetizationFunnelLayout(parts[2]))
  );
}

/**
 * Count key: event name, or `name:track` when track is set.
 * @param {string} name
 * @param {MonetizationTrack | null | undefined} track
 */
export function monetizationFunnelCountKey(name, track) {
  if (track && MONETIZATION_TRACKS.includes(track)) return `${name}:${track}`;
  return name;
}

/**
 * @param {string} name
 * @param {{ track?: MonetizationTrack | null, layout?: MonetizationFunnelLayout | null }} [dims]
 * @returns {string[]}
 */
export function monetizationFunnelCountKeys(name, dims = {}) {
  const track =
    dims.track && MONETIZATION_TRACKS.includes(dims.track) ? dims.track : null;
  const layout = parseMonetizationFunnelLayout(dims.layout);
  /** @type {string[]} */
  const keys = [name];
  if (track) keys.push(`${name}:${track}`);
  if (layout) keys.push(`${name}:${layout}`);
  if (track && layout) keys.push(`${name}:${track}:${layout}`);
  return keys;
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} [props]
 * @param {{ log?: (...args: unknown[]) => void }} [options]
 */
export function trackMonetizationEvent(
  name,
  props = {},
  { log = console.log } = {}
) {
  log('[MonetizationFunnel]', name, props);
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {MonetizationFunnelState}
 */
export function readMonetizationFunnelState(storage) {
  if (!storage) return normalizeMonetizationFunnelState(null);
  try {
    const raw = storage.getItem(MONETIZATION_FUNNEL_STORAGE_KEY);
    if (!raw) return normalizeMonetizationFunnelState(null);
    return normalizeMonetizationFunnelState(JSON.parse(raw));
  } catch {
    return normalizeMonetizationFunnelState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {MonetizationFunnelState} state
 */
export function writeMonetizationFunnelState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      MONETIZATION_FUNNEL_STORAGE_KEY,
      JSON.stringify(normalizeMonetizationFunnelState(state))
    );
  } catch {
    /* ignore */
  }
}

export class MonetizationFunnelStore {
  /**
   * @param {object} [options]
   * @param {Storage | null} [options.storage]
   * @param {() => Date} [options.now]
   * @param {(name: string, props?: Record<string, unknown>) => void} [options.track]
   */
  constructor({
    storage = getDefaultStorage(),
    now = () => new Date(),
    track = (name, props) => trackMonetizationEvent(name, props),
    /** @type {(name: string) => void} */
    afterRecord = () => {}
  } = {}) {
    this.storage = storage;
    this.now = now;
    this.track = track;
    this.afterRecord = afterRecord;
  }

  /** @returns {MonetizationFunnelState} */
  read() {
    return readMonetizationFunnelState(this.storage);
  }

  /**
   * @param {string} name
   * @param {object} [props]
   * @param {MonetizationTrack} [props.track]
   * @param {string} [props.source]
   * @param {MonetizationFunnelLayout | null} [props.layout]
   */
  record(name, props = {}) {
    if (!name || typeof name !== 'string') return;
    const track =
      props.track === 'tea' ||
      props.track === 'sanctuary' ||
      props.track === 'membership'
        ? props.track
        : null;
    const source =
      typeof props.source === 'string' && props.source ? props.source : null;
    const layout = parseMonetizationFunnelLayout(props.layout);
    const at = this.now().toISOString();
    const state = this.read();
    for (const key of monetizationFunnelCountKeys(name, { track, layout })) {
      state.counts[key] = (state.counts[key] || 0) + 1;
    }
    state.events.push({ at, name, track, source, layout });
    if (state.events.length > MAX_EVENTS) {
      state.events = state.events.slice(-MAX_EVENTS);
    }
    writeMonetizationFunnelState(this.storage, state);
    this.track(name, {
      track,
      source,
      layout,
      countKey: monetizationFunnelCountKey(name, track)
    });
    try {
      this.afterRecord?.(name);
    } catch {
      /* upload must never break local record */
    }
  }

  /**
   * @param {string} [source]
   * @param {MonetizationFunnelLayout | null} [layout]
   */
  supportOpen(source = 'fab', layout = null) {
    this.record(MONETIZATION_FUNNEL_EVENTS.SUPPORT_OPEN, { source, layout });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   * @param {MonetizationFunnelLayout | null} [layout]
   */
  supportCta(track, source = 'support-modal', layout = null) {
    this.record(MONETIZATION_FUNNEL_EVENTS.SUPPORT_CTA, {
      track,
      source,
      layout
    });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   * @param {MonetizationFunnelLayout | null} [layout]
   */
  checkoutStart(track, source = 'card', layout = null) {
    this.record(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_START, {
      track,
      source,
      layout
    });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   * @param {MonetizationFunnelLayout | null} [layout]
   */
  checkoutComplete(track, source = 'return', layout = null) {
    this.record(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_COMPLETE, {
      track,
      source,
      layout
    });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   * @param {MonetizationFunnelLayout | null} [layout]
   */
  checkoutCancel(track, source = 'return', layout = null) {
    this.record(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_CANCEL, {
      track,
      source,
      layout
    });
  }

  /** Human-readable summary for DEV panel. */
  formatSummary() {
    const { counts, events } = this.read();
    const lines = ['Monetization intent funnel (local)', ''];
    const keys = Object.keys(counts).sort();
    if (keys.length === 0) {
      lines.push('(empty)');
    } else {
      for (const k of keys) lines.push(`${k} = ${counts[k]}`);
    }
    lines.push('', `recent (${Math.min(10, events.length)}):`);
    for (const ev of events.slice(-10).reverse()) {
      const t = ev.track ? `:${ev.track}` : '';
      const l = ev.layout ? ` layout=${ev.layout}` : '';
      const s = ev.source ? ` @${ev.source}` : '';
      lines.push(`- ${ev.at} ${ev.name}${t}${l}${s}`);
    }
    return lines.join('\n');
  }
}

/** @type {MonetizationFunnelStore | null} */
let singleton = null;

/** @returns {MonetizationFunnelStore} */
export function getMonetizationFunnelStore() {
  if (!singleton) singleton = new MonetizationFunnelStore();
  return singleton;
}

/**
 * Test/DEV helper — replace singleton.
 * @param {MonetizationFunnelStore | null} store
 */
export function setMonetizationFunnelStoreForTests(store) {
  singleton = store;
}
