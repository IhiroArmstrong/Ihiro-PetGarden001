/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATES } from './StateManager.js';
import {
  LONG_AWAY_WAKE_MS,
  FOREGROUND_RETURN_ACTIONS,
  shouldPlayLongAwayWake,
  shouldLateNightCloakOnSessionEnd,
  isLateNightCloakHoldEmotion,
  resolveForegroundReturnAction,
  resolveSessionEndHoldEmotion,
  shouldAllowEnterDormantOnForegroundReturn
} from './companionRestPolicy.js';
import * as companionRestPolicy from './companionRestPolicy.js';

test('shouldPlayLongAwayWake only when FOCUSING and hidden long enough', () => {
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.FOCUSING,
      hiddenMs: LONG_AWAY_WAKE_MS
    }),
    true
  );
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.FOCUSING,
      hiddenMs: LONG_AWAY_WAKE_MS - 1
    }),
    false
  );
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.IDLE,
      hiddenMs: LONG_AWAY_WAKE_MS * 2
    }),
    false
  );
  assert.equal(
    shouldPlayLongAwayWake({
      sessionState: STATES.DORMANT,
      hiddenMs: LONG_AWAY_WAKE_MS * 2
    }),
    false
  );
});

test('resolveForegroundReturnAction: 2B vs keep 2h DORMANT path', () => {
  assert.equal(
    resolveForegroundReturnAction({
      sessionState: STATES.FOCUSING,
      hiddenMs: LONG_AWAY_WAKE_MS
    }),
    FOREGROUND_RETURN_ACTIONS.LONG_AWAY_WAKE
  );
  assert.equal(
    resolveForegroundReturnAction({
      sessionState: STATES.IDLE,
      hiddenMs: LONG_AWAY_WAKE_MS * 3
    }),
    FOREGROUND_RETURN_ACTIONS.SYNC_DORMANT_AND_LATE_NIGHT
  );
  assert.equal(
    resolveForegroundReturnAction({
      sessionState: STATES.FOCUSING,
      hiddenMs: 1000
    }),
    FOREGROUND_RETURN_ACTIONS.SYNC_DORMANT_AND_LATE_NIGHT
  );
});

/**
 * 回归锚（2026-08-04 plan A）：白天 Idle 无操作披毯已删除。
 * 不得再导出 shouldIdleInactivityCloak / IDLE_INACTIVITY_CLOAK_MS。
 */
test('plan A: daytime Idle inactivity cloak helpers are removed', () => {
  assert.equal(
    Object.hasOwn(companionRestPolicy, 'shouldIdleInactivityCloak'),
    false
  );
  assert.equal(
    Object.hasOwn(companionRestPolicy, 'IDLE_INACTIVITY_CLOAK_MS'),
    false
  );
});

/**
 * 回归锚（2026-08-18）：Reflect 仍是同坐时刻，会话结束不得 cloakSleep。
 * 深夜休息仍走 Expand A Idle→DORMANT / 2h live，不进未填完的 Reflection。
 */
test('session end into Reflection never cloaks (Expand B revoked)', () => {
  assert.equal(
    shouldLateNightCloakOnSessionEnd(new Date('2026-08-18T23:10:00')),
    false
  );
  assert.equal(
    shouldLateNightCloakOnSessionEnd(new Date('2026-08-18T22:59:00')),
    false
  );
  assert.equal(
    shouldLateNightCloakOnSessionEnd(new Date('2026-08-18T05:00:00')),
    false
  );
});

test('resolveSessionEndHoldEmotion: rise pool at all hours (no cloak into Reflection)', () => {
  assert.equal(
    resolveSessionEndHoldEmotion({
      date: new Date('2026-08-18T23:10:00'),
      pickDaytimeRiseEmotion: () => 'riseStretchCasual'
    }),
    'riseStretchCasual'
  );
  assert.equal(
    resolveSessionEndHoldEmotion({
      date: new Date('2026-08-18T14:00:00'),
      pickDaytimeRiseEmotion: () => 'teaDrinking'
    }),
    'teaDrinking'
  );
});

test('isLateNightCloakHoldEmotion covers classic + starlight cloak sleep keys', () => {
  assert.equal(isLateNightCloakHoldEmotion('cloakSleep'), true);
  assert.equal(isLateNightCloakHoldEmotion('starlightCloakSleep'), true);
  assert.equal(isLateNightCloakHoldEmotion('riseStretchCasual'), false);
  assert.equal(isLateNightCloakHoldEmotion(null), false);
});

test('shouldAllowEnterDormantOnForegroundReturn: short hide after Welcome stays awake', () => {
  assert.equal(
    shouldAllowEnterDormantOnForegroundReturn({ hiddenMs: 60_000 }),
    false,
    '1 min tab hide must not cloak'
  );
  assert.equal(
    shouldAllowEnterDormantOnForegroundReturn({ hiddenMs: 0 }),
    false
  );
  assert.equal(
    shouldAllowEnterDormantOnForegroundReturn({ hiddenMs: Number.NaN }),
    false
  );
  assert.equal(
    shouldAllowEnterDormantOnForegroundReturn({
      hiddenMs: 2 * 60 * 60 * 1000 - 1
    }),
    false
  );
  assert.equal(
    shouldAllowEnterDormantOnForegroundReturn({
      hiddenMs: 2 * 60 * 60 * 1000
    }),
    true,
    'tab actually hidden ≥2h may enter DORMANT'
  );
});

test('main.js visibility return uses hiddenMs DORMANT gate', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, '../main.js'), 'utf8');
  assert.match(src, /resolveVisibilitySpriteOccupancy/);
  assert.match(src, /hiddenMs/);
  assert.doesNotMatch(src, /tryPlaySceneAnim\(SCENE_ANIM_EVENTS\.LATE_NIGHT\)/);
});
