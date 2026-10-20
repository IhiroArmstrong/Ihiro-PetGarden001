/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide golden script v1 — visible freeze for CI and hand replay.
 * SSOT JSON: fixtures/confide-golden-script-v1.json
 * Human table: docs/CONFIDE_GOLDEN_SCRIPT.md
 *
 * Do not copy full lines into production classifiers (R-Confide-No-Symptom-List).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const CONFIDE_GOLDEN_SCRIPT_JSON_PATH = join(
  __dirname,
  '../../../fixtures/confide-golden-script-v1.json'
);
export const CONFIDE_GOLDEN_SCRIPT_MD_RELATIVE = 'docs/CONFIDE_GOLDEN_SCRIPT.md';

/** @typedef {'safety' | 'personal_facts' | 'product_short' | 'product_honesty' | 'product_redirect' | 'emotion_or_generate'} ConfideGoldenChannel */

export const CONFIDE_GOLDEN_CHANNELS = Object.freeze({
  SAFETY: 'safety',
  PERSONAL_FACTS: 'personal_facts',
  PRODUCT_SHORT: 'product_short',
  PRODUCT_HONESTY: 'product_honesty',
  PRODUCT_REDIRECT: 'product_redirect',
  EMOTION_OR_GENERATE: 'emotion_or_generate'
});

export const CONFIDE_GOLDEN_CHANNEL_LABELS = Object.freeze({
  safety: '安全',
  personal_facts: '个人事实',
  product_short: '产品问-短答',
  product_honesty: '产品问-诚实空态',
  product_redirect: '产品问-跳转帮助中心',
  emotion_or_generate: '情绪或生成'
});

export const CONFIDE_GOLDEN_MUST_NOT = Object.freeze({
  HONESTY_EMPTY: "doesn't keep a manual",
  REFERRAL: '转介',
  HELP_CENTER_REDIRECT: 'I keep how-to answers'
});

/**
 * @typedef {Readonly<{
 *   id: string,
 *   lang: 'en' | 'zh',
 *   text: string,
 *   channel: ConfideGoldenChannel,
 *   must_not_appear: readonly string[],
 *   tags: readonly string[]
 * }>} ConfideGoldenScriptItem
 */

function loadConfideGoldenScriptV1() {
  const parsed = JSON.parse(readFileSync(CONFIDE_GOLDEN_SCRIPT_JSON_PATH, 'utf8'));
  const items = Object.freeze(
    parsed.items.map((row) =>
      Object.freeze({
        id: String(row.id),
        lang: row.lang === 'zh' ? 'zh' : 'en',
        text: String(row.text),
        channel: String(row.channel),
        must_not_appear: Object.freeze([...(row.must_not_appear || [])]),
        tags: Object.freeze([...(row.tags || [])])
      })
    )
  );
  const meta = Object.freeze({
    name: String(parsed.meta.name),
    version: String(parsed.meta.version),
    date: String(parsed.meta.date),
    set: String(parsed.meta.set),
    notes: Object.freeze([...(parsed.meta.notes || [])]),
    counts: Object.freeze({ ...(parsed.meta.counts || {}) }),
    required_hand_ids: Object.freeze([...(parsed.meta.required_hand_ids || [])])
  });
  return Object.freeze({ meta, items });
}

const GOLDEN = loadConfideGoldenScriptV1();

export const CONFIDE_GOLDEN_SCRIPT_V1_META = GOLDEN.meta;
export const CONFIDE_GOLDEN_SCRIPT_V1_ITEMS = GOLDEN.items;

/**
 * @param {ConfideGoldenScriptItem} row
 * @returns {string}
 */
function escapeMdCell(rowText) {
  return String(rowText).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/**
 * @param {typeof GOLDEN.meta} meta
 * @param {readonly ConfideGoldenScriptItem[]} items
 * @returns {string}
 */
export function renderConfideGoldenScriptMarkdown(meta, items) {
  const en = items.filter((row) => row.lang === 'en').length;
  const zh = items.filter((row) => row.lang === 'zh').length;
  const lines = [
    '# Confide 黄金脚本 v1.1',
    '',
    `权威句表：[\`fixtures/confide-golden-script-v1.json\`](../fixtures/confide-golden-script-v1.json)（${meta.version} · ${meta.date}）。`,
    '本页给人和 CI 共用：通道期望 +「不得出现」。**不是**盲测集，**不是**词表补丁来源。禁止把整句抄进发送链分类器（R-Confide-No-Symptom-List）。',
    '',
    '## 怎么用',
    '',
    '- **CI**：`node --test src/core/confide/confideGoldenScriptV1.test.js`（含在 `npm run test:smoke`）。锁句数、必含手测 11 句、字面/闸门通道。不跑真 embedding、不占 en/b-v6。',
    '- **人工（Electron 宽屏 · 向量 ready）**：Idle → Confide → 按下表逐句发送。看 `data-source` / `data-route` 与「不得出现」。危机句只抽明确撑不住的英文 + 中文「我不想活了」，看棕色竖线；**T34 起宽屏须朗读屏上全文**，关卡可停。',
    '',
    '## 通道',
    '',
    '| 代码 | 中文 | 人看到什么 |',
    '|---|---|---|',
    '| `safety` | 安全 | 转介金句（safety-01）、棕色竖线；宽屏朗读屏上全文（T34） |',
    '| `personal_facts` | 个人事实 | Journey 练习记录短答，不是情绪陪伴 |',
    '| `product_short` | 产品问-短答 | catalog 短答（Help Center 问卡不可达时） |',
    '| `product_honesty` | 产品问-诚实空态 | 可以说没有手册；禁止现编步骤（问卡不可达时） |',
    '| `product_redirect` | 产品问-跳转帮助中心 | 跳转句；禁止念卡、禁止空态金句、禁止转介 |',
    '| `emotion_or_generate` | 情绪或生成 | 陪伴语料或本地生成；禁止空态金句、禁止转介、禁止跳转 |',
    '',
    '「不得出现」词：`doesn\'t keep a manual` = 诚实空态金句；`转介` = safety-01 / 热线 / crisis line；`I keep how-to answers` = T23 跳转句。',
    '',
    `## 句数`,
    '',
    `- 英文 **${en}**（门槛 ≥60）`,
    `- 中文 **${zh}**（门槛 ≥20）`,
    `- 合计 **${items.length}**`,
    '',
    '## 完整句表',
    '',
    '| id | 语言 | 通道 | 不得出现 | 句 |',
    '|---|---|---|---|---|'
  ];
  for (const row of items) {
    const label = CONFIDE_GOLDEN_CHANNEL_LABELS[row.channel] || row.channel;
    lines.push(
      `| ${row.id} | ${row.lang} | ${label} | ${escapeMdCell(row.must_not_appear.join('；'))} | ${escapeMdCell(row.text)} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}
