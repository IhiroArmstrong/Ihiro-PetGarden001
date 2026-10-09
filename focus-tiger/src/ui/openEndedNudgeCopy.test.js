/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openEndedNudgeCopyKey } from './OpenEndedNudgeUI.js';
import { OPEN_ENDED_NUDGE_AT_MS } from '../core/openEndedFocus.js';

const here = dirname(fileURLToPath(import.meta.url));
const praise = [/越久越好/, /the longer the better/i, /wonderful/i, /すばらしい/, /太久/];

test('nudge copy keys exist in en/zh/ja and do not praise sitting longer', () => {
  for (const file of ['en.json', 'zh.json', 'ja.json']) {
    const loc = JSON.parse(readFileSync(join(here, '../locales', file), 'utf8'));
    for (const key of [
      'focus_duration.nudge_90',
      'focus_duration.nudge_3h',
      'focus_duration.nudge_stay',
      'focus_duration.nudge_off',
      'focus_duration.nudge_saving',
      'focus_duration.nudge_save_fail'
    ]) {
      assert.equal(typeof loc[key], 'string', `${file} ${key}`);
      assert.ok(loc[key].length > 0, `${file} ${key}`);
      for (const re of praise) {
        assert.equal(re.test(loc[key]), false, `${file} ${key} ${re}`);
      }
    }
  }
  assert.equal(
    openEndedNudgeCopyKey(OPEN_ENDED_NUDGE_AT_MS[0]),
    'focus_duration.nudge_90'
  );
  assert.equal(
    openEndedNudgeCopyKey(OPEN_ENDED_NUDGE_AT_MS[1]),
    'focus_duration.nudge_3h'
  );
  const main = readFileSync(join(here, '../main.js'), 'utf8');
  assert.match(main, /openEndedNudgePreview/);
  assert.match(main, /takeOpenEndedNudges/);
});
