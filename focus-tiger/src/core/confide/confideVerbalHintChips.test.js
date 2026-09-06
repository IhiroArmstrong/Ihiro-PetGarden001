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
      CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_TREND,
      CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE,
      CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_RECENT
    ]);
    assert.equal(
      CONFIDE_VERBAL_HINT_CHIPS.find(
        (chip) => chip.id === CONFIDE_VERBAL_HINT_CHIP_ID.FORGET_THIS
      )?.shipped,
      true
    );
    assert.equal(
      CONFIDE_VERBAL_HINT_CHIPS.find(
        (chip) => chip.id === CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE
      )?.shipped,
      true
    );
    assert.equal(
      CONFIDE_VERBAL_HINT_CHIPS.find(
        (chip) => chip.id === CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_RECENT
      )?.shipped,
      true
    );
    assert.equal(
      CONFIDE_VERBAL_HINT_CHIPS.filter((chip) => chip.shipped).length,
      3
    );
  });

  it('lists observation guidance chips without memory bridge', () => {
    const shipped = listShippedConfideVerbalHintChips({ hasMemoryBridge: false });
    assert.equal(shipped.length, 2);
    assert.deepEqual(
      shipped.map((chip) => chip.id),
      [
        CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE,
        CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_RECENT
      ]
    );
  });

  it('lists Forget this plus observation guidance when bridge exists', () => {
    const shipped = listShippedConfideVerbalHintChips({ hasMemoryBridge: true });
    assert.equal(shipped.length, 3);
    assert.equal(shipped[0].id, CONFIDE_VERBAL_HINT_CHIP_ID.FORGET_THIS);
    assert.deepEqual(
      shipped.slice(1).map((chip) => chip.id),
      [
        CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE,
        CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_RECENT
      ]
    );
  });
});
