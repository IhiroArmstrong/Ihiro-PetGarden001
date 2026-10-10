/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'HelpCenterUI.js'), 'utf8');

test('HelpCenterUI registers active press feedback on topic buttons', () => {
  assert.match(src, /\.help-center__topic:active/);
});

test('help center close hides the card in the same turn as the click', () => {
  const closeAt = src.indexOf('  close() {');
  const closeFn = src.slice(closeAt, src.indexOf('  _showIndex() {', closeAt));
  assert.match(closeFn, /this\.root\.hidden = true/);
  assert.match(closeFn, /hideOverlayBackdrop\(this\.backdrop, \{ fadeMs: FADE_MS \}\)/);
  assert.doesNotMatch(closeFn, /hideOverlayBackdrop\(this\.backdrop, FADE_MS/);
});
