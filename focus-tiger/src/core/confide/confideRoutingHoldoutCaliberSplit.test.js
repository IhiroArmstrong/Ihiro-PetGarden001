/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCaliberSplitHoldoutStdout,
  scoreBandARow,
  scoreBandCHardGateRow,
  summarizeCaliberSplitHoldout
} from './confideRoutingHoldoutCaliberSplit.js';

describe('confideRoutingHoldoutCaliberSplit', () => {
  it('band A pass is path OR merge structural pass', () => {
    assert.equal(scoreBandARow({ pathPass: false, mergeStructPass: true }).pass, true);
    assert.equal(scoreBandARow({ pathPass: true, mergeStructPass: false }).pass, true);
    assert.equal(
      scoreBandARow({ pathPass: false, mergeStructPass: true }).mergeOnlyPass,
      true
    );
  });

  it('band C hard gate counts emotion path and yin coin short answer', () => {
    const emotion = scoreBandCHardGateRow({
      classId: 'product-short-answer',
      text: '背景音乐怎么关？',
      dataSource: 'generate',
      operationalAsk: true
    });
    assert.equal(emotion.productAskIntoEmotion, true);
    const coin = scoreBandCHardGateRow({
      classId: 'badge-yin-coin',
      text: '徽章',
      dataSource: 'product_knowledge',
      catalogId: 'KB-FUNC-0018'
    });
    assert.equal(coin.yinCoinShortAnswer, true);
  });

  it('reports merge_pass_share_of_passes as observe-only in stdout', () => {
    const summary = summarizeCaliberSplitHoldout({
      bandARows: [
        { classId: 'mixed', pathPass: false, mergeStructPass: true },
        { classId: 'mixed', pathPass: true, mergeStructPass: false }
      ]
    });
    const slot = summary.band_a.mixed;
    assert.equal(slot.n_pass, 2);
    assert.equal(slot.n_merge_only_pass, 1);
    assert.equal(slot.merge_pass_share_of_passes, 0.5);
    const out = formatCaliberSplitHoldoutStdout(summary);
    assert.match(out, /merge_pass_share_of_passes=0.500 observe_only=yes/);
    assert.match(out, /band_c product_ask_into_emotion=0/);
  });
});
