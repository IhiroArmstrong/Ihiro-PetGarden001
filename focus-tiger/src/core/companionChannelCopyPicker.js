/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Kill switch. Steps 1–3 stay false; flipping true needs a written deploy. */
export const COMPANION_CHANNEL_COPY_OVERLAY_LIVE = true;

export const COMPANION_CHANNEL_RECENT_IDS_KEY =
  'focus-tiger.companion-channel-recent-ids.v1';

export const COMPANION_CHANNEL_FREEZE_ANCHORS = Object.freeze({
  'session-end:observed-minutes': Object.freeze(['SESSION_END_OBSERVED_MINUTES']),
  'awaken-invite:pause': Object.freeze(['AWAKEN_INVITE_PAUSE_PROMPT']),
  'awaken-invite:extend': Object.freeze(['AWAKEN_INVITE_EXTEND_PROMPT']),
  'refocus:acknowledge': Object.freeze([
    'REFOCUS_ACKNOWLEDGE_1',
    'REFOCUS_ACKNOWLEDGE_2',
    'REFOCUS_ACKNOWLEDGE_3'
  ]),
  'moment-whisper:arrive': Object.freeze(['MOMENT_WHISPER_ARRIVE'])
});

/**
 * @param {number} minutes
 * @returns {'minute' | 'minutes'}
 */
export function englishMinuteUnit(minutes) {
  return Number(minutes) === 1 ? 'minute' : 'minutes';
}

/**
 * @param {string} template
 * @param {{ minutes?: number }} [slots]
 * @returns {string}
 */
export function fillCompanionChannelSlots(template, slots = {}) {
  let out = String(template ?? '');
  if (slots.minutes != null && Number.isFinite(Number(slots.minutes))) {
    const minutes = Number(slots.minutes);
    out = out.replaceAll('{minutes}', String(minutes));
    out = out.replaceAll('{minuteUnit}', englishMinuteUnit(minutes));
  }
  return out;
}

/**
 * @param {number} visibleCount
 * @returns {number}
 */
export function companionChannelRecentWindowSize(visibleCount) {
  const n = Number(visibleCount);
  if (!Number.isFinite(n) || n < 2) return 0;
  return Math.floor(n / 2);
}

/**
 * @param {object} line
 * @returns {boolean}
 */
export function isCompanionChannelLineEligible(line) {
  return Boolean(
    line &&
      line.reviewed === true &&
      String(line.reviewer || '').trim() &&
      String(line.reviewerType || '').trim() &&
      String(line.reviewedOn || '').trim() &&
      String(line.contentHash || '').trim() &&
      String(line.text || '').trim() &&
      String(line.id || '').trim()
  );
}

/**
 * @param {object} opts
 * @param {Array<{id: string}>} opts.lines
 * @param {string[]} [opts.recentIds]
 * @param {() => number} [opts.random]
 * @returns {{id: string} | null}
 */
export function pickCompanionChannelLineFromPool({
  lines,
  recentIds = [],
  random = Math.random
} = {}) {
  const visible = (Array.isArray(lines) ? lines : []).filter(isCompanionChannelLineEligible);
  if (visible.length < 2) return null;
  const windowSize = companionChannelRecentWindowSize(visible.length);
  const blocked = new Set(
    (Array.isArray(recentIds) ? recentIds : []).slice(-windowSize)
  );
  const candidates = visible.filter((line) => !blocked.has(line.id));
  const pool = candidates.length ? candidates : visible;
  const idx = Math.floor(Number(random()) * pool.length);
  const picked = pool[Math.max(0, Math.min(pool.length - 1, idx))];
  return picked || null;
}

/**
 * @param {string | null | undefined} raw
 * @returns {Record<string, Record<string, Record<string, string[]>>>}
 */
export function parseCompanionChannelRecentIds(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} channelId
 * @param {string} subtypeId
 * @param {string} locale
 * @returns {string[]}
 */
export function readCompanionChannelRecentIds(
  storage,
  channelId,
  subtypeId,
  locale
) {
  try {
    const tree = parseCompanionChannelRecentIds(
      storage?.getItem(COMPANION_CHANNEL_RECENT_IDS_KEY)
    );
    const ids = tree?.[channelId]?.[subtypeId]?.[locale];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} channelId
 * @param {string} subtypeId
 * @param {string} locale
 * @param {string} id
 * @param {number} [keep]
 */
export function rememberCompanionChannelTemplateId(
  storage,
  channelId,
  subtypeId,
  locale,
  id,
  keep = 4
) {
  if (!storage || !id) return;
  try {
    const tree = parseCompanionChannelRecentIds(
      storage.getItem(COMPANION_CHANNEL_RECENT_IDS_KEY)
    );
    const next = { ...tree };
    const channel = { ...(next[channelId] || {}) };
    const subtype = { ...(channel[subtypeId] || {}) };
    const prev = Array.isArray(subtype[locale]) ? subtype[locale].map(String) : [];
    const ring = [...prev, String(id)].slice(-Math.max(1, keep));
    subtype[locale] = ring;
    channel[subtypeId] = subtype;
    next[channelId] = channel;
    storage.setItem(COMPANION_CHANNEL_RECENT_IDS_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Overlay-off path returns freeze-table ids. Callers keep using locale `t()`.
 *
 * @param {object} opts
 */
export function resolveCompanionChannelCopy({
  channelId,
  subtypeId,
  locale,
  overlayLive = COMPANION_CHANNEL_COPY_OVERLAY_LIVE,
  overlayLines = [],
  storage = null,
  random = Math.random
} = {}) {
  const freezeKey = `${channelId}:${subtypeId}`;
  const freezeIds = COMPANION_CHANNEL_FREEZE_ANCHORS[freezeKey] || [];
  const freeze = { source: 'freeze', ids: freezeIds, line: null };
  if (overlayLive !== true || locale !== 'en') return freeze;
  const recentIds = readCompanionChannelRecentIds(
    storage,
    channelId,
    subtypeId,
    locale
  );
  const picked = pickCompanionChannelLineFromPool({
    lines: overlayLines,
    recentIds,
    random
  });
  if (!picked) return freeze;
  rememberCompanionChannelTemplateId(
    storage,
    channelId,
    subtypeId,
    locale,
    picked.id,
    companionChannelRecentWindowSize(
      overlayLines.filter(isCompanionChannelLineEligible).length
    )
  );
  return { source: 'overlay', ids: [picked.id], line: picked };
}
