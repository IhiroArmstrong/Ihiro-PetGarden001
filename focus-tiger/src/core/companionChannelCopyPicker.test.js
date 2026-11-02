/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchForbiddenPatterns } from '../../scripts/companion-contract-forbidden.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';
import { PRACTICE_BACKUP_EXPORT_KEYS } from './practiceBackup/localBackupStorageRegistry.js';
import {
  COMPANION_CHANNEL_COPY_OVERLAY_LIVE,
  COMPANION_CHANNEL_FREEZE_ANCHORS,
  COMPANION_CHANNEL_RECENT_IDS_KEY,
  companionChannelRecentWindowSize,
  fillCompanionChannelSlots,
  pickCompanionChannelLineFromPool,
  rememberCompanionChannelTemplateId,
  resolveCompanionChannelCopy
} from './companionChannelCopyPicker.js';

const PACK = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../../content/companion-channel-copy/en.json'
    ),
    'utf8'
  )
);

function memoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    }
  };
}

function channelLines(channelId, subtypeId) {
  return PACK.channels.find(
    (row) => row.channelId === channelId && row.subtypeId === subtypeId
  ).lines;
}

test('overlayLive off keeps freeze-table ids', () => {
  assert.equal(COMPANION_CHANNEL_COPY_OVERLAY_LIVE, true);
  assert.equal(PACK.overlayLive, true);
  const resolved = resolveCompanionChannelCopy({
    channelId: 'session-end',
    subtypeId: 'observed-minutes',
    locale: 'en',
    overlayLive: false,
    overlayLines: channelLines('session-end', 'observed-minutes')
  });
  assert.equal(resolved.source, 'freeze');
  assert.deepEqual(resolved.ids, ['SESSION_END_OBSERVED_MINUTES']);
});

test('ja does not read the English pool', () => {
  const resolved = resolveCompanionChannelCopy({
    channelId: 'awaken-invite',
    subtypeId: 'pause',
    locale: 'ja',
    overlayLive: true,
    overlayLines: channelLines('awaken-invite', 'pause')
  });
  assert.equal(resolved.source, 'freeze');
  assert.deepEqual(resolved.ids, COMPANION_CHANNEL_FREEZE_ANCHORS['awaken-invite:pause']);
});

test('pause and extend pools stay separate', () => {
  const pauseIds = new Set(channelLines('awaken-invite', 'pause').map((row) => row.id));
  const extendIds = new Set(channelLines('awaken-invite', 'extend').map((row) => row.id));
  for (const id of pauseIds) assert.equal(extendIds.has(id), false);
});

test('minute unit fill locks 1 / 25 / 90 and re-scans forbidden table', () => {
  const template = 'About {minutes} {minuteUnit} this sitting.';
  assert.equal(fillCompanionChannelSlots(template, { minutes: 1 }), 'About 1 minute this sitting.');
  assert.equal(
    fillCompanionChannelSlots(template, { minutes: 25 }),
    'About 25 minutes this sitting.'
  );
  assert.equal(
    fillCompanionChannelSlots(template, { minutes: 90 }),
    'About 90 minutes this sitting.'
  );
  assert.deepEqual(matchForbiddenPatterns('About 1 minute this sitting.'), []);
  assert.deepEqual(matchForbiddenPatterns('About 25 minutes this sitting.'), []);
  assert.deepEqual(matchForbiddenPatterns('About 90 minutes this sitting.'), []);
});

test('recent-id window is floor(visible/2); eight lines skip the last four ids', () => {
  assert.equal(companionChannelRecentWindowSize(8), 4);
  assert.equal(companionChannelRecentWindowSize(1), 0);
  const lines = channelLines('moment-whisper', 'arrive');
  const recentIds = lines.slice(0, 4).map((row) => row.id);
  const picked = pickCompanionChannelLineFromPool({
    lines,
    recentIds,
    random: () => 0
  });
  assert.ok(picked);
  assert.equal(recentIds.includes(picked.id), false);
});

test('fewer than two eligible lines fall back to freeze, no generation', () => {
  const picked = pickCompanionChannelLineFromPool({
    lines: channelLines('session-end', 'observed-minutes').slice(0, 1)
  });
  assert.equal(picked, null);
});

test('overlay live path records template ids and reset whitelist includes the key', () => {
  assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(COMPANION_CHANNEL_RECENT_IDS_KEY));
  assert.equal(PRACTICE_BACKUP_EXPORT_KEYS.includes(COMPANION_CHANNEL_RECENT_IDS_KEY), false);
  const storage = memoryStorage();
  const lines = channelLines('refocus', 'acknowledge');
  const first = resolveCompanionChannelCopy({
    channelId: 'refocus',
    subtypeId: 'acknowledge',
    locale: 'en',
    overlayLive: true,
    overlayLines: lines,
    storage,
    random: () => 0
  });
  assert.equal(first.source, 'overlay');
  const stored = JSON.parse(storage.getItem(COMPANION_CHANNEL_RECENT_IDS_KEY));
  assert.deepEqual(stored.refocus.acknowledge.en, [first.ids[0]]);
  rememberCompanionChannelTemplateId(
    storage,
    'refocus',
    'acknowledge',
    'en',
    'REFOCUS_ACKNOWLEDGE_8',
    4
  );
});
