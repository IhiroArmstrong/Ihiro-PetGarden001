/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('breath practice end speaks the same closing sentence as a finished sit', () => {
  const main = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const start = main.indexOf('function completeMicroRitual');
  const end = main.indexOf('function leaveMicroRitualQuietly');
  const body = main.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.match(body, /t\('system_tts\.focus_end'\)/);
  assert.match(body, /cueId: `breath-complete:/);
});

test('a late breath-phase tick cannot talk over the ending sentence', () => {
  const ui = readFileSync(new URL('../ui/MicroRitualUI.js', import.meta.url), 'utf8');
  assert.match(
    ui,
    /if \(this\._completionFired \|\| this\.phase !== 'breath'\) return;/
  );
});
