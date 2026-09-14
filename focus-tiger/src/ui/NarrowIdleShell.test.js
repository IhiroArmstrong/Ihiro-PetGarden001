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
const src = readFileSync(join(here, 'NarrowIdleShell.js'), 'utf8');

test('narrow drawer rows have :active press (Journey log 0–1s)', () => {
  assert.match(src, /\.ft-narrow-sheet__item:active:not\(:disabled\)/);
});

test('narrow ActionBar has Idle Confide ear slot (hidden until gate)', () => {
  assert.match(src, /id="ft-narrow-confide-btn"/);
  assert.match(src, /icon-confide-to-yin\.png/);
  assert.match(src, /setConfideEarVisible/);
  assert.match(src, /CONFIDE_EAR_TOOLTIP/);
  assert.match(src, /attachGlassHoverTip/);
  assert.match(src, /\.ft-narrow-action-bar__btn:active/);
});

test('narrow staged reminder panel uses transform not extra translate', () => {
  assert.match(
    src,
    /ft-narrow-stage-reminder \.reminder-pref__panel[\s\S]*transform: translateX\(-50%\) !important/
  );
  assert.match(
    src,
    /ft-narrow-stage-reminder \.reminder-pref__panel[\s\S]*translate: none !important/
  );
});

test('narrow drawer reclones heatmap after practice import (microtask + destroy unsub)', () => {
  assert.match(src, /subscribePracticeDataImported/);
  assert.match(src, /queueMicrotask\(\(\) => this\._refreshDrawerItems\(\)\)/);
  assert.match(src, /this\._unsubPracticeImport\?\.\(\)/);
});

test('narrow grabber keeps swipe aria-label but hides visible hint text', () => {
  assert.match(src, /this\.grabber\.setAttribute\('aria-label', t\('NARROW_SHEET_SWIPE_HINT'\)\)/);
  assert.match(src, /this\.grabber\.textContent = '';/);
  assert.match(src, /\.ft-narrow-grabber[\s\S]*font-size:\s*0;/);
  assert.match(src, /\.ft-narrow-grabber::before/);
});
