/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { STAY_MINUTES_PER_POINT } from '../core/focusCoinsLedger.js';
import {
  shouldShowFocusCoinsDurationHint
} from './focusCoinsDurationHint.js';

describe('focusCoinsDurationHint', () => {
  const here = dirname(fileURLToPath(import.meta.url));

  it('shows on product default and hides when ?focusCoins=0', () => {
    assert.equal(shouldShowFocusCoinsDurationHint({ search: '?product=1' }), true);
    assert.equal(
      shouldShowFocusCoinsDurationHint({ search: '?product=1&focusCoins=0' }),
      false
    );
  });

  it('en/zh/ja name 寅币 and the Stay-rate floor, without arcade copy', () => {
    assert.equal(STAY_MINUTES_PER_POINT, 5);
    const localesDir = join(here, '../locales');
    const forbidden = /earn|shop|limited|积分|金币|抽奖|错过|赶紧/i;
    for (const file of ['en.json', 'zh.json', 'ja.json']) {
      const loc = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
      const hint = loc['focus_coins.duration_hint'];
      assert.equal(typeof hint, 'string', file);
      assert.match(hint, /寅币/, `${file} must keep 寅币`);
      assert.match(hint, /5/, `${file} must name the ${STAY_MINUTES_PER_POINT}-minute floor`);
      assert.equal(forbidden.test(hint), false, `${file} must stay observational`);
    }
  });

  it('Focus and Breath pickers mount the shared hint', () => {
    const focusSrc = readFileSync(join(here, 'FocusDurationPickerUI.js'), 'utf8');
    const breathSrc = readFileSync(join(here, 'MicroRitualUI.js'), 'utf8');
    assert.ok(focusSrc.includes('createFocusCoinsDurationHint'));
    assert.ok(breathSrc.includes('createFocusCoinsDurationHint'));
    assert.ok(focusSrc.includes('FOCUS_COINS_DURATION_HINT_ID'));
  });
});
