/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Validation set for the KB product gate mood veto lab (stage one, shadow only).
 * SSOT: task-confide-kb-gate-mood-veto.md §验证集 + PO decisions 2026-10-13.
 * None of these lines may seed CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE.
 * Japanese lines are provisional until a native speaker reviews them.
 */

import { CONFIDE_SEMANTIC_LIBRARY_C } from './confideSemanticExamples.js';
import { KB_ROUTING_MATRIX_FIXTURES } from './confideKbRoutingMatrix.js';
import { STAGE2B_NEGATIVE_CONTROL_TEXTS } from './stage2bNegativeControlTexts.js';

/**
 * @param {string} text
 * @returns {'zh' | 'en' | 'ja'}
 */
export function kbMoodVetoLabLanguage(text) {
  const raw = String(text || '');
  if (/[\u3040-\u30ff]/.test(raw)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(raw)) return 'zh';
  return 'en';
}

const MOOD_TONIGHT = Object.freeze([
  '最近老是想起以前',
  '我今天练习的太久啦。',
  '我不想练习，想喝酒。'
]);

const MOOD_UNCOVERED_ZH = Object.freeze([
  '昨晚又梦到以前的事',
  '我妈总让我想起以前',
  '今天坐不住，想放弃',
  '练着练着就想哭',
  '想抽烟',
  '想吃点甜的逃避一下'
]);

const MOOD_EN = Object.freeze([
  'I keep thinking about the past lately',
  'I practiced way too long today',
  "I don't want to practice, I want a drink",
  'I feel like giving up today',
  'I want a cigarette',
  'I just want something sweet to escape for a bit'
]);

const MOOD_JA = Object.freeze([
  '最近昔のことばかり思い出す',
  '今日は練習しすぎた',
  '練習したくない、お酒が飲みたい',
  '今日はもう諦めたい',
  '練習してたら泣きたくなった',
  'タバコが吸いたい'
]);

const CONTROL_COMPLAINT = Object.freeze([
  'Sit 按钮不见了',
  '备份失败了',
  'The Sit button disappeared',
  'Backup failed',
  '座るボタンが消えた',
  'バックアップに失敗した'
]);

/** PO decision 5: mood + concrete feature ask must stay a product answer. */
const CONTROL_MIXED = Object.freeze([
  '太累了，怎么关提醒？',
  "I'm exhausted, how do I turn off reminders?",
  '疲れた、リマインダーはどう消す？'
]);

const CONTROL_PRACTICE_FACTS = Object.freeze([
  '我练了多久',
  'how long have I been practicing',
  'どれくらい練習した？'
]);

/**
 * @typedef {{
 *   set: 'mood' | 'control',
 *   group: string,
 *   lang: 'zh' | 'en' | 'ja',
 *   text: string
 * }} KbMoodVetoLabRow
 */

/**
 * @param {readonly { set: 'mood' | 'control', group: string, lines: readonly string[] }[]} sources
 * @returns {readonly KbMoodVetoLabRow[]}
 */
function buildRows(sources) {
  const seen = new Set();
  /** @type {KbMoodVetoLabRow[]} */
  const rows = [];
  for (const { set, group, lines } of sources) {
    for (const line of lines) {
      const text = String(line || '').trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      rows.push({ set, group, lang: kbMoodVetoLabLanguage(text), text });
    }
  }
  return Object.freeze(rows);
}

const matrixMoodLines = KB_ROUTING_MATRIX_FIXTURES.filter(
  (row) => row.expect.dataSource === 'generate'
).map((row) => row.text);

const matrixProductLines = KB_ROUTING_MATRIX_FIXTURES.filter((row) =>
  String(row.expect.dataSource).startsWith('product_knowledge')
).map((row) => row.text);

const matrixPracticeLines = KB_ROUTING_MATRIX_FIXTURES.filter(
  (row) => row.expect.dataSource === 'practice_facts'
).map((row) => row.text);

/** Expected: veto → observation wing. */
export const KB_MOOD_VETO_LAB_MOOD_ROWS = buildRows([
  { set: 'mood', group: 'stage2b_negative_control', lines: STAGE2B_NEGATIVE_CONTROL_TEXTS },
  { set: 'mood', group: 'tonight', lines: MOOD_TONIGHT },
  { set: 'mood', group: 'uncovered_zh', lines: MOOD_UNCOVERED_ZH },
  { set: 'mood', group: 'kb_matrix_generate', lines: matrixMoodLines },
  { set: 'mood', group: 'family_en', lines: MOOD_EN },
  { set: 'mood', group: 'family_ja', lines: MOOD_JA }
]);

/** Expected: no veto → short answer or honesty empty state. */
export const KB_MOOD_VETO_LAB_CONTROL_ROWS = buildRows([
  { set: 'control', group: 'library_c', lines: CONFIDE_SEMANTIC_LIBRARY_C },
  { set: 'control', group: 'kb_matrix_product', lines: matrixProductLines },
  { set: 'control', group: 'complaint', lines: CONTROL_COMPLAINT },
  { set: 'control', group: 'mixed', lines: CONTROL_MIXED },
  { set: 'control', group: 'practice_facts', lines: CONTROL_PRACTICE_FACTS },
  { set: 'control', group: 'kb_matrix_practice', lines: matrixPracticeLines }
]);

/** PO decision 4. */
export const KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS = 40;

/** Brief §过关门槛 + PO decision 3. */
export const KB_MOOD_VETO_LAB_MOOD_MIN_RATE = Object.freeze({ zh: 0.9, en: 0.9, ja: 0.8 });
