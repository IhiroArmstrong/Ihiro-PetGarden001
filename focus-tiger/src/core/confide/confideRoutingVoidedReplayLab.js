/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * PO-locked labels for --curves-only on already-voided zh routing holdouts (T9).
 * Brief: task-confide-routing-holdout-caliber-split.md · GLOSSARY T9.
 */

/** Shown on every voided-replay curve run; not pass evidence. */
export const VOIDED_REPLAY_EVIDENCE_LABEL = '作废卷回放，非过关证据';

/** Observe-only: above this share, PO reads band A pass rates with a discount. */
export const VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH = 0.5;

const RULE_LINES = Object.freeze([
  '带 C 硬闸未过（product_ask_into_emotion 或 yin_coin_short_answer > 0）须人工判真错，不得自动当过关',
  `merge_pass_share_of_passes > ${VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH} 时带 A 通过率只作打折观察，不当关单尺`,
  '带 B 未过不计入英文未见卷占额叙事（en/b-v6 仍封存，真跑须另行书面）',
  '本回放数字不得当作未见卷预测；合并对结构判据几乎恒真仍是推断，须等未见真跑出数再确认'
]);

/**
 * @param {{ holdoutSetVersion: string }} ctx
 */
export function voidedReplayCurvesJsonMeta(ctx) {
  return {
    voided_replay_evidence_label: VOIDED_REPLAY_EVIDENCE_LABEL,
    not_pass_evidence: true,
    unseen_holdout_prediction: false,
    en_bv6_sealed: true,
    reading_rules: RULE_LINES,
    merge_pass_share_high_threshold: VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH
  };
}

/**
 * @param {{ holdoutSetVersion: string }} ctx
 */
export function formatVoidedReplayCurvesPreamble(ctx) {
  const version = String(ctx?.holdoutSetVersion || '').trim();
  const lines = [
    `[routing-class-holdout] voided_replay_evidence_label=${VOIDED_REPLAY_EVIDENCE_LABEL}`,
    `[routing-class-holdout] voided_replay=yes not_pass_evidence=yes unseen_prediction=no holdout_set_version=${version}`,
    '[routing-class-holdout] voided_replay_reading_rules_begin'
  ];
  for (const rule of RULE_LINES) {
    lines.push(`[routing-class-holdout] voided_replay_rule ${rule}`);
  }
  lines.push('[routing-class-holdout] voided_replay_reading_rules_end');
  return `${lines.join('\n')}\n`;
}

/**
 * @param {ReturnType<typeof import('./confideRoutingHoldoutCaliberSplit.js').summarizeCaliberSplitHoldout>} summary
 */
export function formatVoidedReplayCaliberHints(summary) {
  const lines = [];
  const c = summary.band_c;
  if (c.hard_gate_met === false) {
    lines.push(
      '[routing-class-holdout] band_c manual_review_required=yes hard_gate_met=no'
    );
  }
  for (const id of Object.keys(summary.band_a)) {
    const slot = summary.band_a[id];
    const share = slot.merge_pass_share_of_passes;
    if (share != null && share > VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH) {
      lines.push(
        `[routing-class-holdout] band_a ${id} band_a_read_discount=yes merge_pass_share_of_passes=${share.toFixed(3)}`
      );
    }
  }
  for (const id of Object.keys(summary.band_b)) {
    const slot = summary.band_b[id];
    if (slot.pass_criteria_met === false && slot.n > 0) {
      lines.push(
        `[routing-class-holdout] band_b ${id} english_quota_irrelevant=yes pass_criteria_met=no`
      );
    }
  }
  lines.push(
    `[routing-class-holdout] voided_replay_footer label=${VOIDED_REPLAY_EVIDENCE_LABEL}`
  );
  return `${lines.join('\n')}\n`;
}
