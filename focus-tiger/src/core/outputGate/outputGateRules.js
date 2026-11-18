/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Draft category rules for T100. Not clinically reviewed.
 * G5 and G6 list classification words only. They do not describe methods.
 * Every output is checked with the union of en / zh / ja. Language detection
 * does not choose which list runs.
 */

import {
  normalizeForMatch,
  primaryOutputLanguage,
  visibleLength
} from './normalizeOutput.js';

/** @typedef {'G1'|'G2'|'G3'|'G4'|'G5'|'G6'|'G7'|'G8'|'G9'|'G10'|'G11'} GateCategory */

const SHAPE_LIMIT = Object.freeze({ en: 160, zh: 60, ja: 70 });

/**
 * The one public crisis number round-2 English outputs actually wrote.
 * 111 stays on G9: it also shows up as an ordinary short number.
 * This list is for matching model text. It is not copy to show the user.
 */
const PUBLIC_CRISIS_HOTLINE = /\b988\b/;

/**
 * Classification paraphrases that are not already G5 or G6.
 * They become late crisis only together with the public hotline.
 * No method detail.
 */
const SELF_HARM_WITH_HOTLINE = [
  /ending your life/,
  /harming yourself/,
  /not wanting to be here/
];

/**
 * @param {string} normalized
 * @returns {boolean}
 */
function publicHotlineWithSelfHarm(normalized) {
  if (!PUBLIC_CRISIS_HOTLINE.test(normalized)) return false;
  return SELF_HARM_WITH_HOTLINE.some((pattern) => pattern.test(normalized));
}

/** @type {Array<{ id: GateCategory, patterns: RegExp[] }>} */
const RULES = [
  {
    id: 'G5',
    patterns: [
      /kill myself/,
      /want to die/,
      /end my life/,
      /不想活|想死/,
      /死にたい|しにたい/
    ]
  },
  {
    id: 'G6',
    patterns: [
      /suicid/,
      /self-harm/,
      /self harm/,
      /自杀|自残|自傷|自伤/,
      /自殺|自傷|死にたい|しにたい/
    ]
  },
  {
    id: 'G1',
    patterns: [
      /you may have/,
      /sounds like (?:depression|anxiety|ptsd|adhd|bipolar)/,
      /classic signs of/,
      /\b(?:depression|adhd|ptsd|bipolar)\b/,
      /你可能有|你患有|抑郁症|憂鬱症|焦虑障碍|焦慮障礙|双相|雙相/,
      /うつ病かもしれない|躁うつ病|うつ病/,
      // Presuppose-illness shapes (Brief 4.3). Not bare diagnosis/illness keywords.
      /(?:name|kind|type) of (?:the |your |this )?(?:illness|condition|disorder)/,
      /name (?:an |the |your )?illness/,
      /identify (?:the |a |your |this )?(?:potential |possible )?(?:illness|condition|disorder)/,
      /help you (?:to )?(?:identify|determine|figure out|name)(?:\s+\w+){0,6}\s+(?:(?:the|a|an|your|this|potential|possible)\s+)*(?:illness|condition|disorder|what you have)/,
      /provide (?:the |your |any )?(?:symptoms|details)(?:\s+\w+){0,10}\s+so i can/,
      /不知道病名|说不出是什么病|說不出是什麼病|叫什么病|叫什麼病|病名/,
      /(?:帮你|帮您|帮我)(?:识别|判断|找出|确认|说出)(?:出)?(?:什么病|是什么病|病情|疾病|障碍|状况)/,
      /(?:把症状|提供症状)(?:告诉我|给我|描述)/,
      /何の病気か|病名/,
      /病気を(?:特定|判断|見極|みきわめ|言い当て)/,
      /症状を(?:教えて|おしえて)/
    ]
  },
  {
    id: 'G2',
    patterns: [
      /\bclinically\b/,
      /severe symptoms/,
      /this is an illness/,
      /临床上|臨床上|症状符合|症狀符合|这是病|這是病/,
      /臨床的|症状は重度|これは病気/
    ]
  },
  {
    id: 'G3',
    patterns: [
      /\b(?:consult|see|seek|visit|contact|talk to|reach out to)\b(?:\s+\w+){0,6}\s+(?:mental health professional|healthcare professional|healthcare provider|medical professional|professional help|medical advice|psychiatrist|counselor|counsellor|therapist|specialist|doctor)\b/,
      /\btry cbt\b/,
      /去看医生|去看醫師|去做治疗|去做治療|去看心理/,
      /(?:去看|去找|咨询|聯繫|联系|就诊)(?:[\u4e00-\u9fff]{0,6})?(?:医生|醫師|医师|治疗师|治療師|咨询师|諮詢師|心理医生|心理醫生|精神科|专业人士|專業人士|专业帮助|專業幫助|医疗建议|醫療建議)/,
      /せらぴすと|診てもらうべき|かうんせりんぐを受けるべき/,
      /(?:医者|医師|いしゃ|専門家|せんもんか|かうんせらー|精神科|せいしんか)に(?:相談|そうだん|診てもら|みてもら|連絡|れんらく)/,
      /受診して|受診を/
    ]
  },
  {
    id: 'G4',
    patterns: [
      /melatonin/,
      /sleeping pill/,
      /\bmg\b/,
      /milligram/,
      /dosage/,
      /褪黑素|安眠药|安眠藥|毫克|吃什么能睡着|吃什麼能睡著/,
      /睡眠薬|めらとにん|みりぐらむ/
    ]
  },
  {
    id: 'G7',
    patterns: [
      /he deserved it/,
      /they deserved (?:it|that)/,
      /他活该|他活該/,
      /自業自得/
    ]
  },
  {
    id: 'G8',
    patterns: [
      /\byou should\b/,
      /\byou must\b/,
      /你应该|你應該|你必须|你必須|一定要/,
      /べき|しなければならない/
    ]
  },
  {
    id: 'G11',
    patterns: [
      /\bi am an ai\b/,
      /language model/,
      /\bi can help you identify\b/,
      /\bplease (?:provide|describe|consult|seek)\b/,
      /我是(?:人工智能|ai|一个ai)/,
      /请(?:提供|描述|咨询|寻求)/,
      /我可以帮你(?:识别|找出)/,
      /私は(?:ai|人工知能|言語モデル)/,
      /提供してください|説明してください|相談してください/
    ]
  },
  {
    id: 'G9',
    patterns: [/https?:\/\//, /\bwww\./, /\d{3,}/]
  }
];

/**
 * @param {string} text
 * @returns {number}
 */
function sentenceCount(text) {
  const parts = String(text || '')
    .split(/[.!?。！？]+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function shapeBlocked(text) {
  const visible = String(text || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (!visible) return false;
  if (sentenceCount(visible) > 2) return true;
  if ((visible.match(/[?？]/g) || []).length > 1) return true;
  if (/(^|\n)\s*(?:[-*•]|\d+[.)])/u.test(visible)) return true;
  const lang = primaryOutputLanguage(visible);
  const limit = SHAPE_LIMIT[lang];
  if (!limit) return false;
  return visibleLength(visible) > limit;
}

/**
 * @param {unknown} raw
 * @returns {{ category: GateCategory | null, uncovered: boolean }}
 */
export function inspectModelOutput(raw) {
  const original = String(raw ?? '');
  const normalized = normalizeForMatch(original);
  if (!normalized) return { category: null, uncovered: false };
  const lang = primaryOutputLanguage(original);
  if (lang === 'other') return { category: null, uncovered: true };
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      if (rule.id === 'G9' && publicHotlineWithSelfHarm(normalized)) {
        return { category: 'G6', uncovered: false };
      }
      return { category: rule.id, uncovered: false };
    }
  }
  if (shapeBlocked(original)) return { category: 'G10', uncovered: false };
  return { category: null, uncovered: false };
}
