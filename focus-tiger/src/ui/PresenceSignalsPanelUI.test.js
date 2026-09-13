/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'PresenceSignalsPanelUI.js'), 'utf8');

test('Presence panel uses paper quiet-object surface and right dock on wide', () => {
  assert.match(src, /PAPER_FILL/);
  assert.doesNotMatch(src, /GLASS_BLUR_CSS/);
  assert.match(src, /@media \(min-width: 480px\)/);
  assert.match(src, /left: max\(56vw, calc\(100vw - 360px\)\)/);
});

test('Presence delete is behind overflow menu, not a row button', () => {
  assert.match(src, /presence-signals-panel__overflow-btn/);
  assert.match(src, /PRESENCE_SIGNALS_PANEL_REMOVE/);
  assert.doesNotMatch(src, /presence-signals-panel__delete/);
  assert.match(src, /dataset\.testid = 'presence-signals-panel-remove'/);
});

test('Presence human time defaults; exact time only when meta expanded', () => {
  assert.match(src, /formatPresenceMomentTime/);
  assert.match(src, /formatPresenceExactTime/);
  assert.match(src, /presence-signals-panel-exact-time/);
  assert.match(src, /aria-expanded/);
});
