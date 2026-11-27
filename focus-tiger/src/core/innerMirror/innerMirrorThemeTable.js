/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Closed first-pack keys. Do not add an 8th at runtime. */
export const INNER_MIRROR_THEME_KEYS = Object.freeze([
  'criticized',
  'rush',
  'tired',
  'avoid',
  'unspoken',
  'friction',
  'pause'
]);

/** Brief §4. zh = contiguous substring ≥2 chars. en = closed word-forms. */
export const INNER_MIRROR_THEME_TABLE = Object.freeze({
  criticized: Object.freeze({
    zh: Object.freeze(['批评', '否定', '指责', '不够好']),
    en: Object.freeze([
      'criticized',
      'criticizing',
      'criticism',
      'blame',
      'blamed',
      'blaming',
      'not good enough',
      'felt dismissed',
      'was dismissed',
      'being dismissed'
    ])
  }),
  rush: Object.freeze({
    zh: Object.freeze(['赶时间', '赶不上', '赶工', '来不及']),
    en: Object.freeze([
      'rush',
      'rushed',
      'rushing',
      'hurry',
      'hurried',
      'hurrying',
      'deadline',
      'falling behind',
      'behind schedule'
    ])
  }),
  tired: Object.freeze({
    zh: Object.freeze(['好累', '很累', '太累', '累死', '疲惫']),
    en: Object.freeze(['tired', 'drained', 'exhausted'])
  }),
  avoid: Object.freeze({
    zh: Object.freeze(['躲开', '逃避', '不想面对', '拖延']),
    en: Object.freeze([
      'avoid',
      'avoiding',
      'avoided',
      'put off',
      'putting off',
      "don't want to face"
    ])
  }),
  unspoken: Object.freeze({
    zh: Object.freeze(['说不出口', '没说出口', '忍住没说']),
    en: Object.freeze(["couldn't say", 'held back', "didn't speak"])
  }),
  friction: Object.freeze({
    zh: Object.freeze(['吵架', '起冲突', '发生冲突', '争执', '起摩擦', '有摩擦']),
    en: Object.freeze([
      'had a conflict',
      'in conflict with',
      'had an argument',
      'got into an argument',
      'friction'
    ])
  }),
  pause: Object.freeze({
    zh: Object.freeze(['想停一下', '想坐一会儿', '先停']),
    en: Object.freeze(['need a pause', 'want to sit for a bit', 'stop a moment'])
  })
});

export const INNER_MIRROR_ZERO_HIT_FIXTURES = Object.freeze([
  '积累',
  '累计',
  '连累',
  '积累了',
  '连累了',
  '赶上了',
  '赶紧',
  '忍住笑',
  '摩擦力',
  '日程冲突',
  '被说服',
  'critical thinking',
  'brush',
  'retired',
  'behind the scenes',
  'scheduling conflict',
  'an argument for this approach',
  'meeting dismissed'
]);
