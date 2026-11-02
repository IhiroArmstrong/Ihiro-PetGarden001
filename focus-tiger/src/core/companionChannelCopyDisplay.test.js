/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { setLocale } from '../locales/i18n.js';
import {
  resetTasteLayerOverlayForTests,
  setTasteCompanionChannelCopyOverlay
} from './tasteLayerOverlay.js';
import { formatCompanionChannelLine } from './companionChannelCopyDisplay.js';
import { readCompanionChannelCopyPack } from '../../scripts/companionChannelCopyReview.js';

const PACK = readCompanionChannelCopyPack();

test('without applied overlay, english session-end uses freeze anchor', () => {
  resetTasteLayerOverlayForTests();
  setLocale('en');
  const line = formatCompanionChannelLine({
    channelId: 'session-end',
    subtypeId: 'observed-minutes',
    locale: 'en',
    slots: { minutes: 25 }
  });
  assert.equal(line, 'About 25 minutes this sitting.');
});

test('overlay live applies pool line when taste overlay is set', () => {
  resetTasteLayerOverlayForTests();
  setLocale('en');
  const channel = PACK.channels.find(
    (row) => row.channelId === 'session-end' && row.subtypeId === 'observed-minutes'
  );
  const overlayLines = channel.lines.filter((row) =>
    ['SESSION_END_OBSERVED_MINUTES_2', 'SESSION_END_OBSERVED_MINUTES_3'].includes(row.id)
  );
  setTasteCompanionChannelCopyOverlay({
    schemaVersion: 1,
    locale: 'en',
    overlayLive: true,
    channels: [{ ...channel, lines: overlayLines }]
  });
  const line = formatCompanionChannelLine({
    channelId: 'session-end',
    subtypeId: 'observed-minutes',
    locale: 'en',
    slots: { minutes: 1 },
    storage: null,
    random: () => 0
  });
  assert.ok(line);
  assert.match(line, /1 minute/);
  assert.notEqual(line, 'About 1 minute this sitting.');
});
