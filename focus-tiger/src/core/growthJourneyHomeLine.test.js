/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { growthJourneyHomeLineModel } from './growthJourneyHomeLine.js';
import { GROWTH_JOURNEY_INTEGRATED_MINUTES } from './growthJourneyStage.js';

const here = dirname(fileURLToPath(import.meta.url));

/** @param {string} key */
function echo(key) {
  return key;
}

test('begin with no minutes still names a next step', () => {
  const line = growthJourneyHomeLineModel(0, null, echo);
  assert.equal(line.stage, 'begin');
  assert.equal(line.position, 0);
  assert.equal(
    line.text,
    'GROWTH_JOURNEY_STAGE_BEGIN · GROWTH_JOURNEY_YOU_ARE_HERE · GROWTH_JOURNEY_NEXT_BEGIN'
  );
});

test('integrated omits the next step and pins the dot', () => {
  const line = growthJourneyHomeLineModel(
    GROWTH_JOURNEY_INTEGRATED_MINUTES,
    null,
    echo
  );
  assert.equal(line.stage, 'integrated');
  assert.equal(line.position, 1);
  assert.equal(
    line.text,
    'GROWTH_JOURNEY_STAGE_INTEGRATED · GROWTH_JOURNEY_YOU_ARE_HERE'
  );
  assert.equal(line.text.includes('NEXT'), false);
});

test('a higher floor keeps the label and the dot from walking back', () => {
  const line = growthJourneyHomeLineModel(0, 'steady', echo);
  assert.equal(line.stage, 'steady');
  assert.equal(
    line.text,
    'GROWTH_JOURNEY_STAGE_STEADY · GROWTH_JOURNEY_YOU_ARE_HERE · GROWTH_JOURNEY_NEXT_STEADY'
  );
  assert.ok(line.position >= 0.75);
});

test('en ja zh share the home-line keys', () => {
  const keys = [
    'GROWTH_JOURNEY_STAGE_BEGIN',
    'GROWTH_JOURNEY_STAGE_NOTICE',
    'GROWTH_JOURNEY_STAGE_PRACTICE',
    'GROWTH_JOURNEY_STAGE_STEADY',
    'GROWTH_JOURNEY_STAGE_INTEGRATED',
    'GROWTH_JOURNEY_YOU_ARE_HERE',
    'GROWTH_JOURNEY_NEXT_BEGIN',
    'GROWTH_JOURNEY_NEXT_NOTICE',
    'GROWTH_JOURNEY_NEXT_PRACTICE',
    'GROWTH_JOURNEY_NEXT_STEADY'
  ];
  for (const file of ['en.json', 'ja.json', 'zh.json']) {
    const dict = JSON.parse(
      readFileSync(join(here, '../locales', file), 'utf8')
    );
    for (const key of keys) {
      assert.equal(typeof dict[key], 'string', `${file} ${key}`);
      assert.ok(dict[key].length > 0, `${file} ${key}`);
    }
  }
});
