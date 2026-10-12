/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Offline A/B example libraries for Confide semantic coarse routing (Stage 1 shadow).
 * SSOT for example sentences; design rationale in task-confide-semantic-routing-option-d.md.
 */

/** @type {readonly string[]} */
export const CONFIDE_SEMANTIC_LIBRARY_A = Object.freeze([
  '累积了多久',
  '练了多久',
  '我练习多长时间了',
  '这周坐了多少次',
  'how long have I been practicing',
  'how many sessions this week',
  'how much time have I spent practicing',
  'when did I last practice',
  'what is my practice streak',
  '列出记忆',
  '帮我回忆一下',
  'list what you remember about me',
  'show my memories',
  'what do you remember about me',
  '忙啥',
  '忙什么',
  '我最近在忙什么',
  '我最近忙什么',
  'what have I been busy with',
  'what have I been spending my time on',
  'what have I been up to',
  'why did I start practicing',
  '为什么开始做这件事',
  '你还记得我为什么开始',
  'why did I start this',
  '最近状态怎么样',
  'how has my presence been lately',
  'presence trend lately',
  '我这几天有来吗',
  'have I been showing up lately',
  '今天练了吗',
  'did I practice today',
  '总共练了几天',
  'total practice days',
  '专注时长是多少',
  'how long were my focus sessions',
  '我的练习记录',
  'my practice history',
  '帮我看看练习情况',
  'check my practice stats',
  '我累计练习多久了',
  'how many minutes have I focused',
  '列出你记得的事',
  'tell me what you stored about me',
  '我在忙些什么',
  'what am I doing with my time',
  '为什么开始练习',
  'do you remember why I started',
  '这周来了几次',
  'sessions this week count'
]);

/** @type {readonly string[]} */
export const CONFIDE_SEMANTIC_LIBRARY_B = Object.freeze([
  '太累了',
  '我好累',
  '撑不住了',
  "I'm exhausted",
  'I feel so tired',
  'burned out today',
  '好焦虑',
  '我很焦虑',
  "can't stop worrying",
  'I feel anxious',
  'panic is building',
  '很难过',
  '我好难过',
  'heartbroken today',
  'feel depressed today',
  '有点抑郁',
  '完全没思路',
  '卡住了',
  'stuck and blocked',
  'no idea what to do',
  '心乱静不下来',
  "mind won't settle",
  'scattered and restless',
  '脑子很乱',
  '情绪很低落',
  'just need to vent',
  '想倾诉一下',
  '今天压力好大',
  'stress is crushing me',
  '睡不着好烦',
  'feel empty inside',
  '觉得自己好失败',
  'nothing feels okay',
  '好孤单',
  'feeling lonely tonight',
  '哭不出来',
  'overwhelmed by everything',
  '心好累',
  'emotionally drained',
  '好沮丧',
  'feel hopeless today',
  '很烦躁',
  "can't calm down",
  '需要有人听我说',
  'just want to talk about how I feel',
  '今天特别丧',
  'feeling down',
  '好无力',
  'exhausted emotionally',
  '心裡堵得慌',
]);

/**
 * Library C — product / how-to-use-the-app questions (KB routing gate · Brief scheme B).
 * @type {readonly string[]}
 */
export const CONFIDE_SEMANTIC_LIBRARY_C = Object.freeze([
  '怎么开始坐',
  'Sit 在哪',
  'Sit 按钮在哪',
  '接地练习入口',
  '接地练习在哪',
  'Breath 和 Sit 区别',
  '倾诉怎么关',
  '备份在哪',
  '这个按钮是干嘛的',
  'How do I start a sitting',
  'Where is Ground exercise',
  'Where is Sit with Yin',
  'How do I open Confide to Yin',
  'What does this button do',
  'Where is Backup and restore',
  'How to get more focus coins',
  '怎么获得寅币',
  'What is the difference between Breath and Sit',
  'Where is the Ground exercise menu',
  'How do I start Sit with Yin'
]);

/**
 * Everyday asks used only to split the KB middle band.
 * A sentence in that band generates when this library outscores Library C.
 * Measured 2026-09-30: noodle / talk-to-you outscore C; observation wing does not.
 * Not a denylist of those user sentences.
 * @type {readonly string[]}
 */
export const CONFIDE_SEMANTIC_LIBRARY_LIFE = Object.freeze([
  'Where should we eat',
  'Can we just talk',
  'What is for dinner',
  'How is the weather today',
  '晚饭吃什么',
  '想跟你聊聊天'
]);

/**
 * Mood / life self-reports scored only by the KB product gate
 * (`task-confide-kb-gate-mood-veto.md`). Stage 2 coarse routing never reads it.
 * Must not contain any line of `confideKbMoodVetoLabSet.js` (test enforced).
 * Japanese lines are provisional until a native speaker reviews them.
 * @type {readonly string[]}
 */
export const CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE = Object.freeze([
  '撑不住了',
  '好焦虑',
  '很难过',
  '心乱静不下来',
  '情绪很低落',
  '今天压力好大',
  '好孤单',
  '心好累',
  '今天特别丧',
  '又想起小时候的事了',
  '这几天老做噩梦',
  '坐了一会儿就想走',
  '真的不想坚持了',
  '鼻子一酸差点哭出来',
  '好想喝点东西麻痹一下',
  '想躲起来谁也不见',
  '今天打坐坐得腿都麻了',
  '一闭眼就想起那个人',
  'I feel so tired',
  'burned out today',
  'I feel anxious',
  'heartbroken today',
  'feeling lonely tonight',
  'emotionally drained',
  'feeling down',
  'overwhelmed by everything',
  'Old memories keep coming back tonight',
  'I had a bad dream about home again',
  'I sat for ages and my legs went numb',
  'I almost quit halfway through today',
  'I got teary in the middle of sitting',
  'I just want to hide from everyone',
  'I really want a beer tonight',
  'My chest feels heavy',
  'I keep replaying that conversation',
  'くたくただ',
  'もう限界かも',
  '不安でたまらない',
  '悲しくて仕方ない',
  '今夜はひとりぼっちな気がする',
  '気持ちが沈んでる',
  '昔の夢をまた見た',
  '子どもの頃のことを思い出してしまう',
  '座っていたら足がしびれた',
  '途中でやめたくなった',
  'なんだか涙が出そう',
  '誰にも会いたくない',
  'ビールが飲みたい気分',
  '全部投げ出したい',
  '胸が重い',
  '頭の中がざわざわする'
]);

/**
 * Known misclassification anchors referenced in CI / ISSUE_LEDGER.
 * @type {readonly string[]}
 */
export const CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS = Object.freeze([
  '累积了多久',
  '忙啥',
  '忙什么'
]);
