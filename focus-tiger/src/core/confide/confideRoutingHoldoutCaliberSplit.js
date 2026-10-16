/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Five-band holdout scoring (counts only). Brief: task-confide-routing-holdout-caliber-split.md.
 * CR-45 shadow merge: confideCr45MixedReplyShadow.js.
 */

import {
  CONFIDE_SEALED_B_HOLDOUT_CLASS_IDS,
  CONFIDE_ROUTING_HOLDOUT_PASS_RATE,
  CONFIDE_ROUTING_HOLDOUT_RECOMMENDED_N_PER_CLASS,
  CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT,
  routingClassMeetsPassCriteria
} from './confideRoutingClassHoldoutLab.js';
import { CR45_BAND_A_CLASS_IDS } from './confideCr45MixedReplyShadow.js';
import { isConfideOperationalProductAskShape } from './confideProductKnowledgeSemantic.js';

export const CALIBER_BAND_B_CLASS_IDS = Object.freeze(['life-emotion', 'chitchat']);

export const CALIBER_BAND_C_CLASS_IDS = Object.freeze([
  'product-short-answer',
  'product-honest-empty',
  'badge-yin-coin'
]);

/** Yin-coin short answer catalog id (badge class must not hit this). */
export const CALIBER_BAND_C_YIN_COIN_CATALOG_ID = 'KB-FUNC-0018';

const EMOTION_SHADOW_SOURCES = new Set([
  'generate',
  'corpus',
  'hybrid_classify',
  'reflective_honesty',
  'companion_presence',
  'companion_greeting',
  'practice_facts',
  'presence_facts',
  'memory_list'
]);

/**
 * @param {string} dataSource
 */
export function isBandCEmotionShadowPath(dataSource) {
  const src = String(dataSource || '').trim();
  return EMOTION_SHADOW_SOURCES.has(src);
}

/**
 * @param {string} catalogId
 */
export function isBandCYinCoinShortAnswerHit(catalogId) {
  return String(catalogId || '').trim() === CALIBER_BAND_C_YIN_COIN_CATALOG_ID;
}

/**
 * @param {{
 *   classId: string,
 *   text: string,
 *   dataSource: string,
 *   catalogId?: string | null,
 *   operationalAsk?: boolean
 * }} row
 */
export function scoreBandCHardGateRow(row) {
  const classId = String(row.classId || '').trim();
  if (!CALIBER_BAND_C_CLASS_IDS.includes(classId)) {
    return { counted: false, productAskIntoEmotion: false, yinCoinShortAnswer: false };
  }
  const operational =
    row.operationalAsk === true || isConfideOperationalProductAskShape(row.text);
  let productAskIntoEmotion = false;
  let yinCoinShortAnswer = false;
  if (classId === 'badge-yin-coin') {
    yinCoinShortAnswer = isBandCYinCoinShortAnswerHit(row.catalogId);
  } else if (operational) {
    productAskIntoEmotion = isBandCEmotionShadowPath(row.dataSource);
  }
  return {
    counted: true,
    productAskIntoEmotion,
    yinCoinShortAnswer
  };
}

/**
 * @param {{ pathPass: boolean, mergeStructPass: boolean }} row
 */
export function scoreBandARow(row) {
  const pathPass = row.pathPass === true;
  const mergeStructPass = row.mergeStructPass === true;
  const pass = pathPass || mergeStructPass;
  return {
    pass,
    pathPass,
    mergeStructPass,
    mergeOnlyPass: pass && !pathPass && mergeStructPass
  };
}

function emptyBandAStats() {
  return {
    n: 0,
    n_pass: 0,
    n_path_pass: 0,
    n_merge_pass: 0,
    n_merge_only_pass: 0,
    pass_rate: null,
    merge_pass_share_of_passes: null,
    sample_insufficient: true,
    sample_insufficient_label: CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT,
    pass_criteria_met: false
  };
}

function emptyBandBStats() {
  return {
    n: 0,
    n_pass: 0,
    pass_rate: null,
    sample_insufficient: true,
    sample_insufficient_label: CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT,
    pass_criteria_met: false
  };
}

function emptyBandCStats() {
  return {
    n_product_gate: 0,
    n_badge: 0,
    product_ask_into_emotion: 0,
    yin_coin_short_answer: 0,
    hard_gate_met: null
  };
}

function emptyBandDStats() {
  return { anchors: [], all_correct: null };
}

/**
 * @param {readonly ReturnType<typeof scoreBandARow>[]} bandARows
 * @param {readonly { classId: string, pass: boolean }[]} bandBRows
 * @param {readonly ReturnType<typeof scoreBandCHardGateRow>[]} bandCRows
 * @param {readonly { id: string, pass: boolean }[]} bandDAnchors
 */
export function summarizeCaliberSplitHoldout({
  bandARows = [],
  bandBRows = [],
  bandCRows = [],
  bandDAnchors = []
}) {
  /** @type {Record<string, ReturnType<typeof emptyBandAStats>>} */
  const bandA = {};
  for (const id of CR45_BAND_A_CLASS_IDS) bandA[id] = emptyBandAStats();

  /** @type {Record<string, ReturnType<typeof emptyBandBStats>>} */
  const bandB = {};
  for (const id of CALIBER_BAND_B_CLASS_IDS) bandB[id] = emptyBandBStats();

  const bandC = emptyBandCStats();
  const bandD = emptyBandDStats();

  for (const row of bandARows) {
    const id = String(row.classId || '').trim();
    if (!CR45_BAND_A_CLASS_IDS.includes(id)) continue;
    const slot = bandA[id];
    slot.n += 1;
    const scored = scoreBandARow({
      pathPass: row.pathPass,
      mergeStructPass: row.mergeStructPass
    });
    if (scored.pass) slot.n_pass += 1;
    if (scored.pathPass) slot.n_path_pass += 1;
    if (scored.mergeStructPass) slot.n_merge_pass += 1;
    if (scored.mergeOnlyPass) slot.n_merge_only_pass += 1;
  }

  for (const id of CR45_BAND_A_CLASS_IDS) {
    const slot = bandA[id];
    const insuff = slot.n < CONFIDE_ROUTING_HOLDOUT_RECOMMENDED_N_PER_CLASS;
    slot.sample_insufficient = insuff;
    slot.sample_insufficient_label = insuff ? CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT : null;
    slot.pass_rate = slot.n > 0 ? slot.n_pass / slot.n : null;
    slot.merge_pass_share_of_passes =
      slot.n_pass > 0 ? slot.n_merge_only_pass / slot.n_pass : null;
    slot.pass_criteria_met = routingClassMeetsPassCriteria({
      n: slot.n,
      n_pass: slot.n_pass,
      pass_rate: slot.pass_rate,
      sample_insufficient: slot.sample_insufficient
    });
  }

  for (const row of bandBRows) {
    const id = String(row.classId || '').trim();
    if (!CALIBER_BAND_B_CLASS_IDS.includes(id)) continue;
    const slot = bandB[id];
    slot.n += 1;
    if (row.pass) slot.n_pass += 1;
  }
  for (const id of CALIBER_BAND_B_CLASS_IDS) {
    const slot = bandB[id];
    const insuff = slot.n < CONFIDE_ROUTING_HOLDOUT_RECOMMENDED_N_PER_CLASS;
    slot.sample_insufficient = insuff;
    slot.sample_insufficient_label = insuff ? CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT : null;
    slot.pass_rate = slot.n > 0 ? slot.n_pass / slot.n : null;
    slot.pass_criteria_met = routingClassMeetsPassCriteria({
      n: slot.n,
      n_pass: slot.n_pass,
      pass_rate: slot.pass_rate,
      sample_insufficient: slot.sample_insufficient
    });
  }

  for (const row of bandCRows) {
    if (!row.counted) continue;
    if (row.productAskIntoEmotion) bandC.product_ask_into_emotion += 1;
    if (row.yinCoinShortAnswer) bandC.yin_coin_short_answer += 1;
  }
  bandC.hard_gate_met =
    bandC.product_ask_into_emotion === 0 && bandC.yin_coin_short_answer === 0;

  for (const anchor of bandDAnchors) {
    bandD.anchors.push({ id: String(anchor.id || ''), correct: anchor.pass === true });
  }
  if (bandD.anchors.length > 0) {
    bandD.all_correct = bandD.anchors.every((row) => row.correct);
  }

  return {
    brief: 'task-confide-routing-holdout-caliber-split',
    pass_rate_line: CONFIDE_ROUTING_HOLDOUT_PASS_RATE,
    band_a: bandA,
    band_b: bandB,
    band_c: bandC,
    band_d: bandD,
    legacy_class_ids: CONFIDE_SEALED_B_HOLDOUT_CLASS_IDS
  };
}

/**
 * @param {ReturnType<typeof summarizeCaliberSplitHoldout>} summary
 */
export function formatCaliberSplitHoldoutStdout(summary) {
  const lines = ['[routing-class-holdout] caliber_split=yes'];
  for (const id of CR45_BAND_A_CLASS_IDS) {
    const slot = summary.band_a[id];
    const rate = slot.pass_rate == null ? 'n/a' : slot.pass_rate.toFixed(3);
    const share =
      slot.merge_pass_share_of_passes == null
        ? 'n/a'
        : slot.merge_pass_share_of_passes.toFixed(3);
    const flag = slot.sample_insufficient ? ` ${CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT}` : '';
    lines.push(
      `[routing-class-holdout] band_a ${id} n=${slot.n} pass_rate=${rate} path_pass=${slot.n_path_pass} merge_pass=${slot.n_merge_pass} merge_only_pass=${slot.n_merge_only_pass} merge_pass_share_of_passes=${share} observe_only=yes pass_criteria_met=${slot.pass_criteria_met ? 'yes' : 'no'}${flag}`
    );
  }
  for (const id of CALIBER_BAND_B_CLASS_IDS) {
    const slot = summary.band_b[id];
    const rate = slot.pass_rate == null ? 'n/a' : slot.pass_rate.toFixed(3);
    const flag = slot.sample_insufficient ? ` ${CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT}` : '';
    lines.push(
      `[routing-class-holdout] band_b ${id} n=${slot.n} pass_rate=${rate} pass_criteria_met=${slot.pass_criteria_met ? 'yes' : 'no'}${flag}`
    );
  }
  const c = summary.band_c;
  lines.push(
    `[routing-class-holdout] band_c product_ask_into_emotion=${c.product_ask_into_emotion} yin_coin_short_answer=${c.yin_coin_short_answer} hard_gate_met=${c.hard_gate_met === null ? 'n/a' : c.hard_gate_met ? 'yes' : 'no'} report_only=yes`
  );
  const d = summary.band_d;
  if (d.anchors.length) {
    for (const anchor of d.anchors) {
      lines.push(
        `[routing-class-holdout] band_d anchor id=${anchor.id} correct=${anchor.correct ? 'yes' : 'no'}`
      );
    }
    lines.push(
      `[routing-class-holdout] band_d all_correct=${d.all_correct ? 'yes' : 'no'} lock_only=yes`
    );
  }
  return `${lines.join('\n')}\n`;
}
