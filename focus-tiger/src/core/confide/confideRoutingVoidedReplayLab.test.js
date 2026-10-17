/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_SAMPLES,
  VOIDED_REPLAY_BAND_C_MANUAL_REVIEW_LABEL,
  VOIDED_REPLAY_EVIDENCE_LABEL,
  VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE,
  formatVoidedReplayCaliberHints,
  formatVoidedReplayCurvesPreamble,
  selectBandCRedSentenceRows,
  voidedReplayCurvesJsonMeta,
  writeBandCRedSentencesPrivateFile
} from './confideRoutingVoidedReplayLab.js';
import { summarizeCaliberSplitHoldout } from './confideRoutingHoldoutCaliberSplit.js';

describe('confideRoutingVoidedReplayLab', () => {
  it('labels voided replay as not pass evidence (red if label removed)', () => {
    const pre = formatVoidedReplayCurvesPreamble({
      holdoutSetVersion: 'confide-routing-blind-zh/b-v5'
    });
    assert.match(pre, /voided_replay_evidence_label=作废卷回放，非过关证据/);
    assert.match(pre, new RegExp(VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE));
    const meta = voidedReplayCurvesJsonMeta({
      holdoutSetVersion: 'confide-routing-blind-zh/b-v5'
    });
    assert.equal(meta.not_pass_evidence, true);
    assert.equal(meta.voided_replay_evidence_label, VOIDED_REPLAY_EVIDENCE_LABEL);
  });

  it('flags band C manual review and band A discount when PO rules hit', () => {
    const summary = summarizeCaliberSplitHoldout({
      bandARows: [
        { classId: 'mixed', pathPass: false, mergeStructPass: true },
        { classId: 'mixed', pathPass: false, mergeStructPass: true },
        { classId: 'mixed', pathPass: true, mergeStructPass: false }
      ],
      bandBRows: [{ classId: 'life-emotion', pass: false }],
      bandCRows: [
        {
          counted: true,
          productAskIntoEmotion: 1,
          yinCoinShortAnswer: 0
        }
      ],
      bandDAnchors: []
    });
    const hints = formatVoidedReplayCaliberHints(summary, {
      holdoutSetVersion: 'confide-routing-blind-zh/b-v6'
    });
    assert.match(hints, /voided_replay_zh_bv6_reading_block_begin/);
    assert.match(hints, /band_c voided_replay_hint=硬闸计数未过，待人工判/);
    assert.match(hints, /mixed voided_replay_reading .* pass_criteria_met=/);
    assert.match(hints, /band_a_read_discount=yes/);
    assert.doesNotMatch(hints, /band_c manual_review_required=yes/);
    assert.match(hints, /voided_replay_footer label=作废卷回放，非过关证据/);
  });

  it('uses 无过线样本 when merge_pass_share_of_passes is n/a (red if 未触发)', () => {
    const summary = summarizeCaliberSplitHoldout({
      bandARows: [
        { classId: 'mixed', pathPass: false, mergeStructPass: false },
        { classId: 'product-over-emotion', pathPass: false, mergeStructPass: false }
      ],
      bandBRows: [],
      bandCRows: [],
      bandDAnchors: []
    });
    const hints = formatVoidedReplayCaliberHints(summary);
    assert.match(
      hints,
      new RegExp(
        `band_a mixed band_a_read_discount=${VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_SAMPLES}`
      )
    );
    assert.doesNotMatch(hints, /未触发/);
  });

  it('writes band C red sentences only to a private path', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ft-band-c-red-'));
    const rows = [
      {
        holdoutSetVersion: 'confide-routing-blind-zh/b-v6',
        itemId: 'x-1',
        text: 'sample holdout sentence',
        productAskIntoEmotion: true,
        yinCoinShortAnswer: false
      },
      {
        holdoutSetVersion: 'confide-routing-blind-zh/b-v6',
        itemId: 'x-2',
        text: 'clean row',
        productAskIntoEmotion: false,
        yinCoinShortAnswer: false
      }
    ];
    assert.equal(selectBandCRedSentenceRows(rows).length, 1);
    const written = await writeBandCRedSentencesPrivateFile({
      holdoutSetVersion: 'confide-routing-blind-zh/b-v6',
      rows,
      epoch: 1,
      baseDir: dir
    });
    assert.ok(written);
    const body = await readFile(written, 'utf8');
    assert.match(body, /product_ask_into_emotion":true/);
    assert.doesNotMatch(body, /clean row/);
    assert.equal(
      VOIDED_REPLAY_BAND_C_MANUAL_REVIEW_LABEL,
      '硬闸计数未过，待人工判'
    );
  });
});
