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
const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');
const uiSrc = readFileSync(join(here, '../ui/AmbientSoundscapeUI.js'), 'utf8');

test('Breath practice wires start / interval / end sitting cues', () => {
  assert.match(mainSrc, /onBreathStart:[\s\S]*?sessionCues\.playStart/);
  assert.match(mainSrc, /onBreathStart:[\s\S]*?sessionCues\.startIntervalSession/);
  assert.match(mainSrc, /function completeMicroRitual\([\s\S]*?sessionCues\.playEnd/);
  assert.match(
    mainSrc,
    /function leaveMicroRitualQuietly\([\s\S]*?sessionCues\.cancelPending/
  );
  assert.match(mainSrc, /microBreathing[\s\S]*?sessionCues\.tickInterval/);
});

test('Breath practice does not override Idle with blink-smile', () => {
  const micro = mainSrc.match(
    /microRitualUI = new MicroRitualUI\([\s\S]*?onBreathStart: \(\) => \{([\s\S]*?)\},\s*onComplete:/
  );
  assert.ok(micro, 'MicroRitual onBreathStart block');
  assert.equal(/playEmotion\(\s*'smiling'/.test(micro[1]), false);
  assert.match(micro[1], /lightProgression\.beginBreath/);
  assert.match(micro[1], /sessionCues\.playStart/);
});

test('Companion expand stages wide+narrow so Breath home ball can hide', () => {
  assert.match(mainSrc, /ft-wide-stage-companion/);
  assert.match(
    mainSrc,
    /classList\.add\(\s*'ft-narrow-stage-companion',\s*'ft-wide-stage-companion'/
  );
});

test('Focusing auto-starts sitting music on the same gesture as the start bell', () => {
  assert.match(mainSrc, /ambientSoundscape\.startSittingMusic/);
  assert.equal((mainSrc.match(/sessionCues\.playStart/g) || []).length, 2);
});

test('Soundscape volume bar is labelled volume, not a progress control', () => {
  assert.match(uiSrc, /AMBIENT_VOLUME_LABEL/);
  assert.match(uiSrc, /id = 'ambient-volume-slider'/);
  assert.match(uiSrc, /CHIMES_VOLUME_LABEL/);
  assert.match(uiSrc, /id = 'ambient-chimes-volume-slider'/);
  assert.match(uiSrc, /chimeVolumeInput/);
});
