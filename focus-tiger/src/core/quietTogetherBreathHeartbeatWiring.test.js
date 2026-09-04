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
const chromeSrc = readFileSync(
  join(here, '../ui/QuietTogetherLanternsChrome.js'),
  'utf8'
);

test('Breath practice contributes lantern heartbeat and leaves on end', () => {
  const micro = mainSrc.match(
    /microRitualUI = new MicroRitualUI\([\s\S]*?onBreathStart: \(\) => \{([\s\S]*?)\},\s*onComplete:/
  );
  assert.ok(micro, 'MicroRitual onBreathStart block');
  assert.match(micro[1], /beginBreathLanternPresence\(\)/);
  assert.match(
    mainSrc,
    /function completeMicroRitual\([\s\S]*?endBreathLanternPresence\(\)/
  );
  assert.match(
    mainSrc,
    /function leaveMicroRitualQuietly\([\s\S]*?endBreathLanternPresence\(\)/
  );
});

test('RitualFlow breath step wires lantern heartbeat lifecycle', () => {
  const ritual = mainSrc.match(
    /ritualFlowUI = new RitualFlowUI\([\s\S]*?onBreathStart: \(\) => \{([\s\S]*?)\},\s*onBreathEnd:/
  );
  assert.ok(ritual, 'RitualFlow onBreathStart block');
  assert.match(ritual[1], /beginBreathLanternPresence\(\)/);
  assert.match(
    mainSrc,
    /onBreathEnd: \(\) => \{[\s\S]*?endBreathLanternPresence\(\)/
  );
  assert.match(
    mainSrc,
    /function completeRitualFlow\([\s\S]*?endBreathLanternPresence\(\)/
  );
  assert.match(
    mainSrc,
    /function leaveRitualFlowQuietly\([\s\S]*?endBreathLanternPresence\(\)/
  );
});

test('beginBreathLanternPresence hides own-window lanterns while contributing', () => {
  assert.match(
    mainSrc,
    /function beginBreathLanternPresence\(\) \{[\s\S]*?setContributing\(true\)[\s\S]*?startLanternHeartbeat\(\)/
  );
  assert.match(
    mainSrc,
    /function endBreathLanternPresence\(\) \{[\s\S]*?setContributing\(false\)[\s\S]*?stopLanternHeartbeat\(\)/
  );
  assert.match(chromeSrc, /!this\._contributing/);
});
