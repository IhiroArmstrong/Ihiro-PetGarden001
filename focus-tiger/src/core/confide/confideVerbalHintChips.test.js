/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFIDE_VERBAL_HINT_CHIP_ID,
  CONFIDE_VERBAL_HINT_CHIPS,
  listShippedConfideVerbalHintChips
} from './confideVerbalHintChips.js';

describe('confideVerbalHintChips', () => {
  it('keeps unshipped chips in the catalog for later unlock', () => {
    const ids = CONFIDE_VERBAL_HINT_CHIPS.map((chip) => chip.id);
    assert.deepEqual(ids, [
      CONFIDE_VERBAL_HINT_CHIP_ID.FORGET_THIS,
      CONFIDE_VERBAL_HINT_CHIP_ID.DONT_SAVE_THIS,
      CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_DURATION,
      CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_TREND
    ]);
    assert.equal(
      CONFIDE_VERBAL_HINT_CHIPS.find(
        (chip) => chip.id === CONFIDE_VERBAL_HINT_CHIP_ID.FORGET_THIS
      )?.shipped,
      true
    );
    assert.equal(
      CONFIDE_VERBAL_HINT_CHIPS.filter((chip) => chip.shipped).length,
      1
    );
  });

  it('lists Forget this only when the memory bridge exists', () => {
    assert.deepEqual(listShippedConfideVerbalHintChips({ hasMemoryBridge: false }), []);
    const shipped = listShippedConfideVerbalHintChips({ hasMemoryBridge: true });
    assert.equal(shipped.length, 1);
    assert.equal(shipped[0].id, CONFIDE_VERBAL_HINT_CHIP_ID.FORGET_THIS);
  });
});
