/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  REFLECTION_ECHO_KEYS,
  formatLocalDateYmd,
  pickReflectionEchoKey,
  shouldShowReflectionEcho
} from './reflectionEchoCopy.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('reflectionEchoCopy', () => {
  it('pool has at least 5 keys', () => {
    assert.ok(REFLECTION_ECHO_KEYS.length >= 5);
  });

  it('shouldShowReflectionEcho only for non-empty trimmed text', () => {
    assert.equal(shouldShowReflectionEcho('  held  '), true);
    assert.equal(shouldShowReflectionEcho(''), false);
    assert.equal(shouldShowReflectionEcho('   '), false);
    assert.equal(shouldShowReflectionEcho(null), false);
  });

  it('pickReflectionEchoKey is stable for same day+salt', () => {
    const a = pickReflectionEchoKey({ localDate: '2026-08-07', salt: 1 });
    const b = pickReflectionEchoKey({ localDate: '2026-08-07', salt: 1 });
    assert.equal(a, b);
    assert.ok(REFLECTION_ECHO_KEYS.includes(a));
  });

  it('pickReflectionEchoKey varies with salt', () => {
    const a = pickReflectionEchoKey({ localDate: '2026-08-07', salt: 0 });
    const b = pickReflectionEchoKey({ localDate: '2026-08-07', salt: 3 });
    // Not guaranteed different for all salts, but 0 vs 3 should differ for pool of 7
    assert.notEqual(a, b);
  });

  it('formatLocalDateYmd uses local calendar fields', () => {
    assert.equal(
      formatLocalDateYmd(() => new Date(2026, 7, 7, 15, 0, 0)),
      '2026-08-07'
    );
  });

  it('en + ja define all echo keys without coachy forbidden words', () => {
    for (const file of ['en.json', 'ja.json']) {
      const map = JSON.parse(
        readFileSync(join(here, '../locales', file), 'utf8')
      );
      for (const key of REFLECTION_ECHO_KEYS) {
        assert.equal(typeof map[key], 'string', `${file} missing ${key}`);
        assert.ok(map[key].trim().length > 0);
        assert.equal(
          /\b(must|should|need to|fix your|improve your|教练|必须|应该)\b/i.test(
            map[key]
          ),
          false,
          `${file} ${key} must stay observational`
        );
      }
    }
  });
});
