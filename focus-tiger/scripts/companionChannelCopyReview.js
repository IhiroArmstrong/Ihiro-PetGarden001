/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const COMPANION_CHANNEL_COPY_REL = 'content/companion-channel-copy/en.json';

const REVIEWER_TYPES = new Set(['ai', 'native-human', 'non-native-human']);
const CHANNEL_SPECS = Object.freeze([
  {
    channelId: 'session-end',
    subtypeId: 'observed-minutes',
    anchorId: 'SESSION_END_OBSERVED_MINUTES',
    count: 8
  },
  {
    channelId: 'awaken-invite',
    subtypeId: 'pause',
    anchorId: 'AWAKEN_INVITE_PAUSE_PROMPT',
    count: 8
  },
  {
    channelId: 'awaken-invite',
    subtypeId: 'extend',
    anchorId: 'AWAKEN_INVITE_EXTEND_PROMPT',
    count: 8
  },
  {
    channelId: 'refocus',
    subtypeId: 'acknowledge',
    anchorId: 'REFOCUS_ACKNOWLEDGE_1',
    count: 8
  },
  {
    channelId: 'moment-whisper',
    subtypeId: 'arrive',
    anchorId: 'MOMENT_WHISPER_ARRIVE',
    count: 8
  }
]);

/**
 * @param {string} text
 * @returns {string}
 */
export function hashCompanionChannelText(text) {
  return createHash('sha256').update(String(text).normalize('NFC'), 'utf8').digest('hex');
}

/**
 * @param {string} [rel]
 */
export function readCompanionChannelCopyPack(rel = COMPANION_CHANNEL_COPY_REL) {
  return JSON.parse(readFileSync(join(PKG_ROOT, rel), 'utf8'));
}

/**
 * @param {object} pack
 * @returns {string[]}
 */
export function evaluateCompanionChannelCopyReview(pack) {
  const errors = [];
  if (!pack || pack.schemaVersion !== 1) {
    errors.push('companion-channel-copy schemaVersion must be 1');
  }
  if (pack?.locale !== 'en') {
    errors.push('companion-channel-copy locale must be en (ja not expanded)');
  }
  if (pack?.overlayLive !== true) {
    errors.push(
      'companion-channel-copy overlayLive must be true after deploy step 4'
    );
  }

  const channels = Array.isArray(pack?.channels) ? pack.channels : [];
  if (channels.length !== CHANNEL_SPECS.length) {
    errors.push(
      `companion-channel-copy channel count ${channels.length} !== ${CHANNEL_SPECS.length}`
    );
  }

  const seenIds = new Set();
  for (const spec of CHANNEL_SPECS) {
    const channel = channels.find(
      (row) => row.channelId === spec.channelId && row.subtypeId === spec.subtypeId
    );
    if (!channel) {
      errors.push(`missing channel ${spec.channelId}:${spec.subtypeId}`);
      continue;
    }
    if (channel.anchorId !== spec.anchorId) {
      errors.push(
        `${spec.channelId}:${spec.subtypeId} anchorId ${channel.anchorId} !== ${spec.anchorId}`
      );
    }
    const lines = Array.isArray(channel.lines) ? channel.lines : [];
    if (lines.length !== spec.count) {
      errors.push(
        `${spec.channelId}:${spec.subtypeId} has ${lines.length} lines, need ${spec.count}`
      );
    }
    if (lines[0]?.id !== spec.anchorId) {
      errors.push(
        `${spec.channelId}:${spec.subtypeId} first line must be freeze anchor ${spec.anchorId}`
      );
    }
    for (const line of lines) {
      const id = String(line?.id || '');
      if (!id) errors.push(`${spec.channelId}:${spec.subtypeId} line missing id`);
      if (seenIds.has(id)) errors.push(`duplicate companion-channel-copy id ${id}`);
      seenIds.add(id);
      const text = String(line?.text ?? '');
      if (!text.trim()) errors.push(`${id} empty text`);
      if (line?.reviewed === true) {
        if (!String(line.reviewer || '').trim()) {
          errors.push(`${id} reviewed:true but reviewer is blank`);
        }
        if (!REVIEWER_TYPES.has(line.reviewerType)) {
          errors.push(`${id} missing or invalid reviewerType`);
        }
        if (!String(line.reviewedOn || '').trim()) {
          errors.push(`${id} reviewed:true but reviewedOn is blank`);
        }
        if (!String(line.contentHash || '').trim()) {
          errors.push(`${id} reviewed:true but contentHash is blank`);
        }
      }
      const expected = hashCompanionChannelText(text);
      if (line?.contentHash && line.contentHash !== expected) {
        errors.push(`${id} contentHash does not match text`);
      }
      if (spec.subtypeId === 'observed-minutes') {
        if (!text.includes('{minutes}') || !text.includes('{minuteUnit}')) {
          errors.push(`${id} must use {minutes} and {minuteUnit}`);
        }
        if (/\{minutes\}\s+minutes\b/.test(text)) {
          errors.push(`${id} must not hard-code minutes as the English unit`);
        }
      }
    }
  }
  return errors;
}
