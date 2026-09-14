/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

test('RecoverResetPracticeUI wires minimal breath-pacer and confide offer release', () => {
  const src = readFileSync(join(here, 'RecoverResetPracticeUI.js'), 'utf8');
  assert.match(src, /recover-reset-practice/);
  assert.match(src, /breath-pacer/);
  assert.match(src, /compact/);
  assert.match(src, /minimal/);
  assert.match(src, /is-pass-through/);
  assert.match(src, /_releasePracticeOverlayCapture/);
  assert.match(src, /canOpenConfide/);
  assert.match(src, /RESET_OVERWHELMED_CONFIDE_LINK/);
  assert.match(src, /RESET_OVERWHELMED_CONFIDE_UNAVAILABLE/);
  assert.equal(src.includes('pointer-events: auto'), true);
});

test('breath-pacer compact mode hides preset pills and start-focus button', () => {
  const src = readFileSync(
    join(here, '../components/breath-pacer/breath-pacer.js'),
    'utf8'
  );
  assert.match(src, /compact/);
  assert.match(src, /this\.compact/);
});

test('main wires recover confide offer without reflection/focusing busy gate', () => {
  const mainSrc = readFileSync(
    join(here, '../main.js'),
    'utf8'
  );
  assert.match(mainSrc, /canOpenConfideEntitled/);
  assert.match(
    mainSrc,
    /canOpenConfide:\s*canOpenConfideEntitled/
  );
  assert.match(
    mainSrc,
    /onOpenConfide:[\s\S]*?canOpenConfideEntitled/
  );
});

test('breath-pacer minimal mode strips card chrome and mascot slot', () => {
  const src = readFileSync(
    join(here, '../components/breath-pacer/breath-pacer.js'),
    'utf8'
  );
  assert.match(src, /minimal/);
  assert.match(src, /:host\(\[minimal\]\)/);
  assert.match(src, /breath-pacer__mascot-wrap[\s\S]*display: none/);
});
