/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import os from 'node:os';
import path from 'node:path';
import { CR45_BAND_A_CLASS_IDS } from './confideCr45MixedReplyShadow.js';

/**
 * PO-locked labels for --curves-only on already-voided zh routing holdouts (T9).
 * Brief: task-confide-routing-holdout-caliber-split.md · GLOSSARY T9.
 */

/** Shown on every voided-replay curve run; not pass evidence. */
export const VOIDED_REPLAY_EVIDENCE_LABEL = '作废卷回放，非过关证据';

/** Observe-only: above this share, PO reads band A pass rates with a discount. */
export const VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH = 0.5;

/** PO note printed beside the 0.5 observe threshold. */
export const VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE =
  '暂定口径，首次有过线样本时复核';

export const VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_SAMPLES =
  '无过线样本，无法判断';

/** Clarifies 过线 here = n_pass=0 for merge-share, not the 85% pass-rate gate. */
export const VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_GLOSS =
  '指该带 A 类过关句数 n_pass=0，非 85% 关单尺未达线';

export const VOIDED_REPLAY_BAND_C_MANUAL_REVIEW_LABEL = '硬闸计数未过，待人工判';

const RULE_LINES = Object.freeze([
  '带 C 硬闸未过（product_ask_into_emotion 或 yin_coin_short_answer > 0）须人工判真错，不得自动当过关',
  `merge_pass_share_of_passes > ${VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH}（${VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE}）时带 A 通过率只作打折观察，不当关单尺`,
  '带 B 未过不计入英文未见卷占额叙事（en/b-v6 仍封存，真跑须另行书面）',
  '本回放数字不得当作未见卷预测；合并对结构判据几乎恒真仍是推断，须等未见真跑出数再确认'
]);

export function defaultVoidedReplayBandCRedSentencesDir() {
  return path.join(os.homedir(), 'Documents', 'ft-private', 'voided-replay-band-c-red');
}

/**
 * @param {{ holdoutSetVersion: string }} ctx
 */
export function voidedReplayCurvesJsonMeta(ctx) {
  const holdoutSetVersion = String(ctx?.holdoutSetVersion || '').trim();
  return {
    voided_replay_evidence_label: VOIDED_REPLAY_EVIDENCE_LABEL,
    not_pass_evidence: true,
    unseen_holdout_prediction: false,
    en_bv6_sealed: true,
    holdout_set_version: holdoutSetVersion || null,
    reading_rules: RULE_LINES,
    merge_pass_share_high_threshold: VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH,
    merge_pass_share_high_threshold_provisional_note:
      VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE,
    band_a_discount_no_pass_gloss: VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_GLOSS
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
    `[routing-class-holdout] merge_pass_share_high_threshold=${VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH} provisional_note=${VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE}`,
    '[routing-class-holdout] voided_replay_reading_rules_begin'
  ];
  for (const rule of RULE_LINES) {
    lines.push(`[routing-class-holdout] voided_replay_rule ${rule}`);
  }
  lines.push('[routing-class-holdout] voided_replay_reading_rules_end');
  return `${lines.join('\n')}\n`;
}

function formatBandAReadDiscountLine(id, slot) {
  const share = slot.merge_pass_share_of_passes;
  if (share == null) {
    return `[routing-class-holdout] band_a ${id} band_a_read_discount=${VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_SAMPLES} merge_pass_share_of_passes=n/a no_pass_gloss=${VOIDED_REPLAY_BAND_A_DISCOUNT_NO_PASS_GLOSS}`;
  }
  if (share > VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH) {
    return `[routing-class-holdout] band_a ${id} band_a_read_discount=yes merge_pass_share_of_passes=${share.toFixed(3)} threshold=${VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH} provisional_note=${VOIDED_REPLAY_MERGE_PASS_SHARE_PROVISIONAL_NOTE}`;
  }
  return `[routing-class-holdout] band_a ${id} band_a_read_discount=no merge_pass_share_of_passes=${share.toFixed(3)} threshold=${VOIDED_REPLAY_MERGE_PASS_SHARE_HIGH}`;
}

/**
 * @param {ReturnType<typeof import('./confideRoutingHoldoutCaliberSplit.js').summarizeCaliberSplitHoldout>} summary
 * @param {{ holdoutSetVersion?: string }} [ctx]
 */
export function formatVoidedReplayCaliberHints(summary, ctx = {}) {
  const version = String(ctx?.holdoutSetVersion || '').trim();
  const isZhBv6 = version === 'confide-routing-blind-zh/b-v6';
  const lines = [];

  if (isZhBv6) {
    lines.push('[routing-class-holdout] voided_replay_zh_bv6_reading_block_begin');
  }

  const c = summary.band_c;
  lines.push(
    `[routing-class-holdout] band_c voided_replay_reading product_ask_into_emotion=${c.product_ask_into_emotion} yin_coin_short_answer=${c.yin_coin_short_answer} hard_gate_met=${c.hard_gate_met === null ? 'n/a' : c.hard_gate_met ? 'yes' : 'no'} report_only=yes`
  );
  if (c.hard_gate_met === false) {
    lines.push(
      `[routing-class-holdout] band_c voided_replay_hint=${VOIDED_REPLAY_BAND_C_MANUAL_REVIEW_LABEL}`
    );
  }

  for (const id of CR45_BAND_A_CLASS_IDS) {
    const slot = summary.band_a[id];
    const rate = slot.pass_rate == null ? 'n/a' : slot.pass_rate.toFixed(3);
    lines.push(
      `[routing-class-holdout] band_a ${id} voided_replay_reading n=${slot.n} pass_rate=${rate} pass_criteria_met=${slot.pass_criteria_met ? 'yes' : 'no'} observe_only=yes`
    );
    lines.push(formatBandAReadDiscountLine(id, slot));
  }

  for (const id of Object.keys(summary.band_b)) {
    const slot = summary.band_b[id];
    if (slot.pass_criteria_met === false && slot.n > 0) {
      lines.push(
        `[routing-class-holdout] band_b ${id} band_b_fail_do_not_spend_en_quota=yes pass_criteria_met=no`
      );
    }
  }

  if (isZhBv6) {
    lines.push('[routing-class-holdout] voided_replay_zh_bv6_reading_block_end');
  }

  lines.push(
    `[routing-class-holdout] voided_replay_footer label=${VOIDED_REPLAY_EVIDENCE_LABEL}`
  );
  return `${lines.join('\n')}\n`;
}

/**
 * @param {readonly {
 *   holdoutSetVersion: string,
 *   itemId: string,
 *   text: string,
 *   productAskIntoEmotion: boolean,
 *   yinCoinShortAnswer: boolean
 * }[]} rows
 */
export function selectBandCRedSentenceRows(rows) {
  return rows.filter(
    (row) => row.productAskIntoEmotion === true || row.yinCoinShortAnswer === true
  );
}

/**
 * @param {ReturnType<typeof selectBandCRedSentenceRows>} rows
 */
export function formatBandCRedSentencesPrivateJsonl(rows) {
  return rows
    .map((row) =>
      JSON.stringify({
        holdout_set_version: row.holdoutSetVersion,
        item_id: row.itemId,
        text: row.text,
        product_ask_into_emotion: row.productAskIntoEmotion,
        yin_coin_short_answer: row.yinCoinShortAnswer
      })
    )
    .join('\n');
}

/**
 * @param {{
 *   holdoutSetVersion: string,
 *   rows: ReturnType<typeof selectBandCRedSentenceRows>,
 *   epoch?: number,
 *   baseDir?: string
 * }} opts
 * @returns {Promise<string | null>}
 */
export async function writeBandCRedSentencesPrivateFile(opts) {
  const { writeFile, mkdir } = await import('node:fs/promises');
  const red = selectBandCRedSentenceRows(opts.rows);
  if (!red.length) return null;
  const epoch = opts.epoch ?? Date.now();
  const safeVersion = String(opts.holdoutSetVersion || 'unknown').replace(/\//g, '_');
  const baseDir = opts.baseDir || defaultVoidedReplayBandCRedSentencesDir();
  await mkdir(baseDir, { recursive: true });
  const filePath = path.join(
    baseDir,
    `band-c-red-${safeVersion}-${epoch}.jsonl`
  );
  const body = formatBandCRedSentencesPrivateJsonl(red);
  await writeFile(filePath, body ? `${body}\n` : '', 'utf8');
  return filePath;
}
