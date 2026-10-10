/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const checkIn = readFileSync(
  new URL('./HonestyCheckInUI.js', import.meta.url),
  'utf8'
);
const bridge = readFileSync(
  new URL('./HonestyBridgeCtaUI.js', import.meta.url),
  'utf8'
);

test('honesty choice and bridge buttons set an explicit glass border', () => {
  for (const src of [checkIn, bridge]) {
    assert.match(src, /appearance:none/);
    assert.match(src, /`border:\$\{GLASS_BORDER_STRONG\}`/);
    assert.doesNotMatch(
      src,
      /`background:\$\{GLASS_FILL_STRONG\}`,\n\s*GLASS_BORDER_STRONG,/
    );
  }
});
