/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Intent × utterance-variant matrix for Confide KB / practice-fact routing.
 * Assert dataSource + catalog id, never reply copy. No GGUF.
 *
 * lock `must-hit` / `must-miss` fail CI.
 * lock `probe` counts toward miss-rate (embedding-debt signal); does not fail CI.
 */

import { resolveConfideDesktopSource } from './confideAcceptanceResolve.js';
import {
  listRetrievableProductKnowledgeEntries,
  retrieveProductKnowledge
} from './confideProductKnowledge.js';

/** Frozen Electron bugs from 2026-09-22 hand tests. */
export const KB_ROUTING_MATRIX_REGRESSION_IDS = Object.freeze([
  'practice-duration-space-zh',
  'kb-0015-backup-what-inside',
  'kb-0015-backup-include-practice',
  'kb-0015-backup-which-data-spaces',
  'kb-0018-coins-how-zh',
  'kb-0018-coins-word-order-spaces',
  'kb-0018-coins-en',
  'honesty-observe-wing-zh',
  'honesty-observe-wing-en',
  'neg-mood-will-it-get-better'
]);

/**
 * @typedef {{
 *   id: string,
 *   text: string,
 *   dimensions: readonly string[],
 *   lock: 'must-hit' | 'must-miss' | 'probe',
 *   expect: { dataSource: string, catalogId?: string | null }
 * }} KbRoutingMatrixRow
 */

/** @type {readonly KbRoutingMatrixRow[]} */
export const KB_ROUTING_MATRIX_FIXTURES = Object.freeze([
  {
    id: 'practice-duration-canonical',
    text: '累积了多久',
    dimensions: ['how', 'practice'],
    lock: 'must-hit',
    expect: { dataSource: 'practice_facts', catalogId: null }
  },
  {
    id: 'practice-duration-space-zh',
    text: '累积了 多久',
    dimensions: ['space', 'how', 'practice'],
    lock: 'must-hit',
    expect: { dataSource: 'practice_facts', catalogId: null }
  },
  {
    id: 'practice-duration-long-zh',
    text: '我已经累积了多久的练习？',
    dimensions: ['how', 'practice'],
    lock: 'must-hit',
    expect: { dataSource: 'practice_facts', catalogId: null }
  },
  {
    id: 'practice-duration-en',
    text: 'How long have I practiced?',
    dimensions: ['how', 'en', 'practice'],
    lock: 'must-hit',
    expect: { dataSource: 'practice_facts', catalogId: null }
  },
  {
    id: 'kb-0001-how-zh',
    text: '怎么开始同坐？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0001' }
  },
  {
    id: 'kb-0001-how-en',
    text: 'How to start sitting with Yin?',
    dimensions: ['how', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0001' }
  },
  {
    id: 'kb-0001-where-zh',
    text: 'Sit with Yin 从哪坐？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0001' }
  },
  {
    id: 'kb-0001-spaces-particle',
    text: '俺 如何 开始 与阿寅同坐？',
    dimensions: ['space', 'word-order', 'how'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0001' }
  },
  {
    id: 'kb-0002-where-zh',
    text: '接地练习在哪？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0002' }
  },
  {
    id: 'kb-0002-where-en',
    text: 'Where is the Ground exercise?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0002' }
  },
  {
    id: 'kb-0002-spaces',
    text: '接地 练习 在 哪',
    dimensions: ['space', 'where'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0002' }
  },
  {
    id: 'kb-0002-what-is',
    text: 'Ground exercise 是什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0002' }
  },
  {
    id: 'kb-0003-where-zh',
    text: '备份从哪里进？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0003' }
  },
  {
    id: 'kb-0003-where-en',
    text: 'Where is Backup & restore?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0003' }
  },
  {
    id: 'kb-0003-how-zh',
    text: '怎么打开备份与恢复？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0003' }
  },
  {
    id: 'kb-0004-what-zh',
    text: '一炷香是什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0004' }
  },
  {
    id: 'kb-0004-what-hud',
    text: '今日同坐是什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0004' }
  },
  {
    id: 'kb-0004-where-en',
    text: "What is Today's shared sitting bar?",
    dimensions: ['what', 'en'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0004' }
  },
  {
    id: 'kb-0004-spaces',
    text: '今日 同坐 进度条 是什么',
    dimensions: ['space', 'what'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0004' }
  },
  {
    id: 'kb-0005-how-zh',
    text: '怎么结束倾诉？',
    dimensions: ['how'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0005' }
  },
  {
    id: 'kb-0005-esc-zh',
    text: 'Esc 怎么关闭？',
    dimensions: ['how', 'where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0005' }
  },
  {
    id: 'kb-0005-how-en',
    text: 'How do I close Confide?',
    dimensions: ['how', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0005' }
  },
  {
    id: 'kb-0005-where-esc',
    text: '倾诉能不能按 Esc 关掉？',
    dimensions: ['can', 'where'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0005' }
  },
  {
    id: 'kb-0005-cancel',
    text: '还没发送时 Cancel 怎么关？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0005' }
  },
  {
    id: 'kb-0007-how-zh',
    text: '怎么起来结束同坐？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0007' }
  },
  {
    id: 'kb-0007-where-en',
    text: 'Where is Rise to end sit?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0007' }
  },
  {
    id: 'kb-0007-spaces',
    text: '俺 如何 起身',
    dimensions: ['space', 'word-order', 'how'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0007' }
  },
  {
    id: 'kb-0008-how-zh',
    text: '这次怎么陪你？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0008' }
  },
  {
    id: 'kb-0008-where-en',
    text: 'Where is How shall we sit?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0008' }
  },
  {
    id: 'kb-0008-what',
    text: '陪伴模式是什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0008' }
  },
  {
    id: 'kb-0010-where-zh',
    text: '倾诉从哪里说？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0010' }
  },
  {
    id: 'kb-0010-how-en',
    text: 'How do I open Confide to Yin?',
    dimensions: ['how', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0010' }
  },
  {
    id: 'kb-0010-can',
    text: '能不能打开向阿寅倾诉？',
    dimensions: ['can'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0010' }
  },
  {
    id: 'kb-0011-diff-zh',
    text: 'Breath 和 Sit 有什么区别？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0011' }
  },
  {
    id: 'kb-0011-diff-kw',
    text: '呼吸练习和 Sit 区别',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0011' }
  },
  {
    id: 'kb-0011-diff-en',
    text: 'What is the difference between Breath and Sit?',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0011' }
  },
  {
    id: 'kb-0011-where',
    text: '呼吸练习在哪？短坐怎么开始？',
    dimensions: ['where', 'how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0011' }
  },
  {
    id: 'kb-0012-where-zh',
    text: '练习记录从哪看？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0012' }
  },
  {
    id: 'kb-0012-where-en',
    text: 'Where is the Journey log?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0012' }
  },
  {
    id: 'kb-0012-spaces',
    text: 'Journey log 在 哪 看 练习记录',
    dimensions: ['space', 'where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0012' }
  },
  {
    id: 'kb-0013-where-en',
    text: 'Where are Presence moments?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0013' }
  },
  {
    id: 'kb-0013-where-zh',
    text: '情绪记录从哪看？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0013' }
  },
  {
    id: 'kb-0013-what',
    text: 'Presence moments 是什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0013' }
  },
  {
    id: 'kb-0014-where-en',
    text: 'Where is What Yin remembers?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0014' }
  },
  {
    id: 'kb-0014-where-zh',
    text: '阿寅记得什么从哪打开？',
    dimensions: ['where', 'what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0014' }
  },
  {
    id: 'kb-0014-how',
    text: '怎么打开记忆列表面板？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0014' }
  },
  {
    id: 'kb-0015-backup-what-inside',
    text: '备份装了什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0015' }
  },
  {
    id: 'kb-0015-backup-include-practice',
    text: '备份里包不包含练习记录？',
    dimensions: ['include'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0015' }
  },
  {
    id: 'kb-0015-backup-which-data-spaces',
    text: '备份能够 备份 哪些数据？',
    dimensions: ['which', 'space', 'include'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0015' }
  },
  {
    id: 'kb-0015-backup-en',
    text: 'What does the backup include?',
    dimensions: ['include', 'en'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0015' }
  },
  {
    id: 'kb-0015-backup-en-kw',
    text: "what's in the backup",
    dimensions: ['include', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0015' }
  },
  {
    id: 'kb-0016-can-zh',
    text: '同坐不能倾诉吗？',
    dimensions: ['can'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0016' }
  },
  {
    id: 'kb-0016-unload-zh',
    text: '同坐时模型卸载是什么意思？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0016' }
  },
  {
    id: 'kb-0016-en',
    text: 'Does the model unload while you sit?',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0016' }
  },
  {
    id: 'kb-0016-spaces',
    text: '坐着 能不能 聊',
    dimensions: ['space', 'can'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0016' }
  },
  {
    id: 'kb-0017-can-zh',
    text: '网页不能聊吗？浏览器没有本地 AI？',
    dimensions: ['can'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0017' }
  },
  {
    id: 'kb-0017-en',
    text: 'Is Local AI in this browser?',
    dimensions: ['what', 'en'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0017' }
  },
  {
    id: 'kb-0017-safari',
    text: 'Safari 网页 Confide 能不能生成？',
    dimensions: ['can', 'en'],
    lock: 'probe',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0017' }
  },
  {
    id: 'kb-0017-desktop',
    text: '本地 AI 只在 desktop app 吗？',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0017' }
  },
  {
    id: 'kb-0018-coins-how-zh',
    text: '怎么获得寅币？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0018' }
  },
  {
    id: 'kb-0018-coins-word-order-spaces',
    text: '俺 如何 能够 获得 更多的 寅币？',
    dimensions: ['space', 'word-order', 'how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0018' }
  },
  {
    id: 'kb-0018-coins-en',
    text: 'How to get more focus coins?',
    dimensions: ['how', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0018' }
  },
  {
    id: 'kb-0019-five-moments-zh',
    text: 'Five Moments 罗盘从哪开？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0019' }
  },
  {
    id: 'kb-0019-five-moments-short-zh',
    text: 'Five Moments 从哪开',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0019' }
  },
  {
    id: 'kb-0019-five-moments-en',
    text: 'Where is the Five Moments compass?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0019' }
  },
  {
    id: 'kb-0020-honesty-zh',
    text: 'Honesty Check-in 怎么补登？',
    dimensions: ['how'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0020' }
  },
  {
    id: 'kb-0020-honesty-short-zh',
    text: '诚实补登在哪',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0020' }
  },
  {
    id: 'kb-0020-honesty-en',
    text: 'How do I log an honest check-in?',
    dimensions: ['how', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0020' }
  },
  {
    id: 'kb-0021-daily-quote-zh',
    text: '今日静语从哪开？',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0021' }
  },
  {
    id: 'kb-0021-daily-quote-short-zh',
    text: '一句静语在哪',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0021' }
  },
  {
    id: 'kb-0021-daily-quote-en',
    text: 'Where is the daily quote menu?',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0021' }
  },
  {
    id: 'kb-edu-0001-grounding-en',
    text: 'what is grounding?',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0001' }
  },
  {
    id: 'kb-edu-0001-grounding-zh',
    text: '接地是什么',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0001' }
  },
  {
    id: 'kb-edu-0001-grounding-meaning-en',
    text: 'grounding meaning',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0001' }
  },
  {
    id: 'kb-edu-0002-mindfulness-zh',
    text: '正念是什么',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0002' }
  },
  {
    id: 'kb-edu-0002-mindfulness-en',
    text: 'what is mindfulness',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0002' }
  },
  {
    id: 'kb-edu-0002-mindfulness-meaning-en',
    text: 'mindfulness meaning',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0002' }
  },
  {
    id: 'kb-edu-0003-focus-vs-meditation-en',
    text: 'focus vs meditation',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0003' }
  },
  {
    id: 'kb-edu-0003-am-i-meditating-zh',
    text: '我这是在冥想吗',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0003' }
  },
  {
    id: 'kb-edu-0003-mindfulness-meditation-zh',
    text: '正念和冥想一样吗',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0003' }
  },
  {
    id: 'kb-edu-0004-mindfulness-in-app-en',
    text: 'mindfulness in this app',
    dimensions: ['where', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0004' }
  },
  {
    id: 'kb-edu-0004-grounding-in-app-zh',
    text: '接地功能在哪',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0004' }
  },
  {
    id: 'kb-edu-0004-focus-entry-zh',
    text: '从哪开始专注',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-EDU-0004' }
  },
  {
    id: 'honesty-observe-wing-zh',
    text: '观察翼是什么？',
    dimensions: ['what'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge_honesty', catalogId: null }
  },
  {
    id: 'honesty-observe-wing-en',
    text: 'What is the observation wing?',
    dimensions: ['what', 'en'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge_honesty', catalogId: null }
  },
  {
    id: 'kb-0001-sit-button-zh',
    text: 'Sit 按钮在哪',
    dimensions: ['where'],
    lock: 'must-hit',
    expect: { dataSource: 'product_knowledge', catalogId: 'KB-FUNC-0001' }
  },
  {
    id: 'neg-mood-will-it-get-better',
    text: '会不会好一点',
    dimensions: ['will'],
    lock: 'must-miss',
    expect: { dataSource: 'generate', catalogId: null }
  },
  {
    id: 'neg-mood-annoyed',
    text: '有点烦',
    dimensions: ['mood'],
    lock: 'must-miss',
    expect: { dataSource: 'generate', catalogId: null }
  },
  {
    id: 'neg-bare-observe-wing',
    text: '观察翼',
    dimensions: ['bare'],
    lock: 'must-miss',
    expect: { dataSource: 'generate', catalogId: null }
  }
]);

/**
 * @param {KbRoutingMatrixRow} row
 */
export function evaluateKbRoutingMatrixRow(row) {
  const dataSource = resolveConfideDesktopSource(row.text);
  const catalog = retrieveProductKnowledge(row.text);
  const catalogId = catalog.hit ? catalog.id : null;
  const expectSource = row.expect.dataSource;
  const expectId = row.expect.catalogId === undefined ? undefined : row.expect.catalogId;
  const sourceOk = dataSource === expectSource;
  const idOk = expectId === undefined ? true : catalogId === expectId;
  return {
    id: row.id,
    lock: row.lock,
    text: row.text,
    pass: sourceOk && idOk,
    dataSource,
    catalogId,
    expectSource,
    expectId: expectId === undefined ? null : expectId
  };
}

/**
 * @param {readonly KbRoutingMatrixRow[]} [fixtures]
 */
export function evaluateKbRoutingMatrix(fixtures = KB_ROUTING_MATRIX_FIXTURES) {
  const rows = fixtures.map(evaluateKbRoutingMatrixRow);
  const lockedFail = rows.filter(
    (row) => (row.lock === 'must-hit' || row.lock === 'must-miss') && !row.pass
  );
  const probes = rows.filter((row) => row.lock === 'probe');
  const probeMiss = probes.filter((row) => !row.pass);
  const probeMissRate = probes.length === 0 ? 0 : probeMiss.length / probes.length;
  return {
    total: rows.length,
    lockedFail,
    probes: probes.length,
    probeMiss: probeMiss.length,
    probeMissRate,
    rows
  };
}

/**
 * Embedding-debt heuristic: probe miss-rate in [0.10, 1] suggests semantic layer.
 * @param {{ probeMissRate: number, probes: number }} report
 */
export function kbRoutingMatrixSuggestsEmbeddingDebt(report) {
  if (report.probes < 4) return false;
  return report.probeMissRate >= 0.1;
}

export function listLiveKbIdsForMatrix() {
  return listRetrievableProductKnowledgeEntries().map((row) => row.id);
}

/**
 * Normalize utterance text for matrix / log display (not confide intent normalize).
 * @param {string} text
 */
export function normalizeKbMatrixProbeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Dedupe key: collapse inner spaces so「怎么 获得 寅币」=「怎么获得寅币」.
 * @param {string} text
 */
export function compactKbMatrixProbeText(text) {
  return normalizeKbMatrixProbeText(text).replace(/\s+/g, '');
}

/**
 * @param {readonly KbRoutingMatrixRow[]} [fixtures]
 * @returns {Set<string>}
 */
export function buildKbMatrixFixtureTextSet(fixtures = KB_ROUTING_MATRIX_FIXTURES) {
  const set = new Set();
  for (const row of fixtures) {
    set.add(normalizeKbMatrixProbeText(row.text));
    set.add(compactKbMatrixProbeText(row.text));
  }
  return set;
}
