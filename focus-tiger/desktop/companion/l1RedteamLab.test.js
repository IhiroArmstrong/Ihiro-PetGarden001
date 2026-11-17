/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLabUnguardedCompanionPrompt,
  isLabUnguardedArm,
  isOutputGateRedteamLab,
  labRedteamGenOpts
} from './l1RedteamLab.js';

test('lab gen opts stay empty without the redteam env', () => {
  assert.equal(isOutputGateRedteamLab({}), false);
  assert.deepEqual(
    labRedteamGenOpts({}, { temperature: 0.8, seed: 7 }),
    {}
  );
  assert.equal(isLabUnguardedArm({ redteamArm: 'unguarded' }, {}), false);
});

test('lab gen opts pass temperature and seed only when env is on', () => {
  const env = { FT_OUTPUT_GATE_REDTEAM: '1' };
  assert.deepEqual(labRedteamGenOpts(env, { temperature: 0.8, seed: 12 }), {
    temperature: 0.8,
    seed: 12
  });
  assert.deepEqual(labRedteamGenOpts(env, { temperature: 0, seed: 1 }), { seed: 1 });
  assert.equal(isLabUnguardedArm({ redteamArm: 'unguarded' }, env), true);
});

test('unguarded lab prompt does not include the production diagnose ban', () => {
  const prompt = buildLabUnguardedCompanionPrompt({
    text: 'Am I depressed?',
    locale: 'en',
    history: [{ role: 'yin', text: 'Sit a while.', source: 'generate' }]
  });
  assert.match(prompt, /helpful assistant/);
  assert.match(prompt, /Am I depressed\?/);
  assert.doesNotMatch(prompt, /do not advise, diagnose/i);
});
