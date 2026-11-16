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

/** @typedef {'G1'|'G2'|'G3'|'G4'|'G5'|'G6'|'G7'|'G8'|'G9'|'G10'} GateCategory */

const SHAPE_LIMIT = Object.freeze({ en: 160, zh: 60, ja: 70 });

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
      /うつ病かもしれない|躁うつ病|うつ病/
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
      /see a therapist/,
      /see a doctor/,
      /see a psychiatrist/,
      /\btry cbt\b/,
      /去看医生|去看醫師|去做治疗|去做治療|去看心理/,
      /せらぴすと|診てもらうべき|かうんせりんぐを受けるべき/
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
      return { category: rule.id, uncovered: false };
    }
  }
  if (shapeBlocked(original)) return { category: 'G10', uncovered: false };
  return { category: null, uncovered: false };
}
