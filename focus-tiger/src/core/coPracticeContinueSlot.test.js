/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  continueSlotCopyPassesBanlist,
  resolveCoPracticeContinueSlot
} from './coPracticeContinueSlot.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('co-practice-continue-slot-copy T77', () => {
  it('locale slice has no banned time-of-day words in continue labels', () => {
    const slice = JSON.parse(
      readFileSync(join(here, '../locales/slices/co-practice-continue-slot.json'), 'utf8')
    );
    for (const locale of ['en', 'zh', 'ja']) {
      const block = slice[locale];
      assert.ok(block, locale);
      for (const value of Object.values(block)) {
        assert.equal(
          continueSlotCopyPassesBanlist(String(value)),
          true,
          `${locale}: ${value}`
        );
      }
    }
  });

  it('hides continue model when no stable practice config', () => {
    const map = new Map();
    const storage = /** @type {Storage} */ ({
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
      clear: () => map.clear(),
      key: () => null,
      get length() {
        return map.size;
      }
    });
    assert.equal(resolveCoPracticeContinueSlot(storage), null);
  });
});
