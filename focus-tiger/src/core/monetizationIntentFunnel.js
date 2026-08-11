/**
 * Monetization intent funnel — local only (no third-party).
 * Nodes: Support open → card CTA → Checkout start → paid complete (Test Mode OK).
 *
 * @see docs/PROCESS.md「付费 · 意愿漏斗本地统计」
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

const MAX_EVENTS = 80;

/**
 * @typedef {{
 *   at: string,
 *   name: string,
 *   track: MonetizationTrack | null,
 *   source: string | null
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
        source: typeof r.source === 'string' && r.source ? r.source : null
      });
    }
  }
  return { counts, events: events.slice(-MAX_EVENTS) };
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

/** @type {null | (() => void)} */
let afterMonetizationFunnelRecord = null;

/**
 * Optional hook (e.g. opt-in upload scheduler). Set from main once.
 * @param {null | (() => void)} fn
 */
export function setAfterMonetizationFunnelRecord(fn) {
  afterMonetizationFunnelRecord = typeof fn === 'function' ? fn : null;
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
    track = (name, props) => trackMonetizationEvent(name, props)
  } = {}) {
    this.storage = storage;
    this.now = now;
    this.track = track;
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
    const at = this.now().toISOString();
    const state = this.read();
    const key = monetizationFunnelCountKey(name, track);
    state.counts[key] = (state.counts[key] || 0) + 1;
    state.events.push({ at, name, track, source });
    if (state.events.length > MAX_EVENTS) {
      state.events = state.events.slice(-MAX_EVENTS);
    }
    writeMonetizationFunnelState(this.storage, state);
    this.track(name, { track, source, countKey: key });
    afterMonetizationFunnelRecord?.();
  }

  supportOpen(source = 'fab') {
    this.record(MONETIZATION_FUNNEL_EVENTS.SUPPORT_OPEN, { source });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   */
  supportCta(track, source = 'support-modal') {
    this.record(MONETIZATION_FUNNEL_EVENTS.SUPPORT_CTA, { track, source });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   */
  checkoutStart(track, source = 'card') {
    this.record(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_START, { track, source });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   */
  checkoutComplete(track, source = 'return') {
    this.record(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_COMPLETE, {
      track,
      source
    });
  }

  /**
   * @param {MonetizationTrack} track
   * @param {string} [source]
   */
  checkoutCancel(track, source = 'return') {
    this.record(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_CANCEL, { track, source });
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
      const s = ev.source ? ` @${ev.source}` : '';
      lines.push(`- ${ev.at} ${ev.name}${t}${s}`);
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
