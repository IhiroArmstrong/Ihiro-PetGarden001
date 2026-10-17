/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VOIDED_REPLAY_EVIDENCE_LABEL,
  formatVoidedReplayCaliberHints,
  formatVoidedReplayCurvesPreamble,
  voidedReplayCurvesJsonMeta
} from './confideRoutingVoidedReplayLab.js';
import { summarizeCaliberSplitHoldout } from './confideRoutingHoldoutCaliberSplit.js';

describe('confideRoutingVoidedReplayLab', () => {
  it('labels voided replay as not pass evidence (red if label removed)', () => {
    const pre = formatVoidedReplayCurvesPreamble({
      holdoutSetVersion: 'confide-routing-blind-zh/b-v5'
    });
    assert.match(pre, /voided_replay_evidence_label=作废卷回放，非过关证据/);
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
    const hints = formatVoidedReplayCaliberHints(summary);
    assert.match(hints, /band_c manual_review_required=yes/);
    assert.match(hints, /band_a_read_discount=yes/);
    assert.match(hints, /voided_replay_footer label=作废卷回放，非过关证据/);
  });
});
