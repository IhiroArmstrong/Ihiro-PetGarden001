/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { matchForbiddenPatterns } from '../../scripts/companion-contract-forbidden.js';
import { getLocale, t, tPool } from '../locales/i18n.js';
import {
  COMPANION_CHANNEL_COPY_OVERLAY_LIVE,
  fillCompanionChannelSlots,
  resolveCompanionChannelCopy
} from './companionChannelCopyPicker.js';
import { getTasteCompanionChannelCopyOverlay } from './tasteLayerOverlay.js';

/**
 * @param {string} channelId
 * @param {string} subtypeId
 * @returns {ReadonlyArray<{ id: string, text: string }>}
 */
function overlayLinesForChannel(channelId, subtypeId) {
  const overlay = getTasteCompanionChannelCopyOverlay();
  if (!overlay?.channels) return [];
  const row = overlay.channels.find(
    (entry) => entry.channelId === channelId && entry.subtypeId === subtypeId
  );
  return row?.lines || [];
}

/**
 * @param {string} channelId
 * @param {string} subtypeId
 * @param {string} locale
 * @param {{ minutes?: number }} slots
 * @returns {string}
 */
function freezeTableLine(channelId, subtypeId, locale, slots) {
  if (channelId === 'refocus' && subtypeId === 'acknowledge') {
    return tPool('REFOCUS_ACKNOWLEDGE');
  }
  if (channelId === 'session-end' && subtypeId === 'observed-minutes') {
    return fillCompanionChannelSlots(String(t('SESSION_END_OBSERVED_MINUTES')), slots).trim();
  }
  if (channelId === 'awaken-invite' && subtypeId === 'pause') {
    return String(t('AWAKEN_INVITE_PAUSE_PROMPT')).trim();
  }
  if (channelId === 'awaken-invite' && subtypeId === 'extend') {
    return String(t('AWAKEN_INVITE_EXTEND_PROMPT')).trim();
  }
  if (channelId === 'moment-whisper' && subtypeId === 'arrive') {
    return String(t('MOMENT_WHISPER_ARRIVE')).trim();
  }
  if (locale !== 'en') {
    // Non-English freeze tables only; never read en overlay pool.
    if (channelId === 'awaken-invite' && subtypeId === 'pause') {
      return String(t('AWAKEN_INVITE_PAUSE_PROMPT')).trim();
    }
  }
  return '';
}

/**
 * English four-channel copy: overlay pool when live + cloud applied, else freeze table.
 *
 * @param {object} [opts]
 * @param {string} opts.channelId
 * @param {string} opts.subtypeId
 * @param {string} [opts.locale]
 * @param {{ minutes?: number }} [opts.slots]
 * @param {Storage | null} [opts.storage]
 * @param {() => number} [opts.random]
 * @returns {string | null}
 */
export function formatCompanionChannelLine({
  channelId,
  subtypeId,
  locale = getLocale(),
  slots = {},
  storage = typeof localStorage !== 'undefined' ? localStorage : null,
  random = Math.random
} = {}) {
  if (!channelId || !subtypeId) return null;

  const overlay = getTasteCompanionChannelCopyOverlay();
  const overlayLive =
    COMPANION_CHANNEL_COPY_OVERLAY_LIVE === true && overlay?.overlayLive === true;

  const resolved = resolveCompanionChannelCopy({
    channelId,
    subtypeId,
    locale,
    overlayLive,
    overlayLines: overlayLive ? overlayLinesForChannel(channelId, subtypeId) : [],
    storage,
    random
  });

  if (resolved.source === 'overlay' && resolved.line?.text) {
    const filled = fillCompanionChannelSlots(resolved.line.text, slots).trim();
    if (filled && matchForbiddenPatterns(filled).length === 0) {
      return filled;
    }
  }

  const frozen = freezeTableLine(channelId, subtypeId, locale, slots);
  return frozen || null;
}
