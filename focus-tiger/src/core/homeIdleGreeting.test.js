/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HOME_IDLE_GREETING_KEYS,
  pickHomeIdleGreetingKey
} from './homeIdleGreeting.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('homeIdleGreeting H5', () => {
  it('keeps the same key for one local calendar day', () => {
    const morning = new Date(2026, 10, 18, 8, 0, 0);
    const evening = new Date(2026, 10, 18, 21, 30, 0);
    assert.equal(pickHomeIdleGreetingKey(morning), pickHomeIdleGreetingKey(evening));
  });

  it('rotates on a later local day', () => {
    const keys = new Set();
    for (let day = 1; day <= 16; day += 1) {
      keys.add(pickHomeIdleGreetingKey(new Date(2026, 10, day, 12, 0, 0)));
    }
    assert.equal(HOME_IDLE_GREETING_KEYS.length, 4);
    assert.ok(keys.size >= 2, 'pool should rotate across days');
    for (const key of keys) {
      assert.equal(HOME_IDLE_GREETING_KEYS.includes(key), true);
    }
  });

  it('locale slice is short, three-locale, and avoids guilt / time-of-day words', () => {
    const slice = JSON.parse(
      readFileSync(join(here, '../locales/slices/home-idle-greeting.json'), 'utf8')
    );
    const banned =
      /missed|guilt|heal you|cure you|anxiety|depression|morning|afternoon|evening|night|错过|缺席|治愈|早安|下午好|晚上好|おはよう|こんばんは/i;
    for (const locale of ['en', 'zh', 'ja']) {
      const block = slice[locale];
      assert.ok(block, locale);
      for (const key of HOME_IDLE_GREETING_KEYS) {
        const text = String(block[key] || '');
        assert.ok(text.length > 0 && text.length <= 42, `${locale} ${key}`);
        assert.equal(banned.test(text), false, `${locale} ${key}: ${text}`);
      }
    }
  });
});
