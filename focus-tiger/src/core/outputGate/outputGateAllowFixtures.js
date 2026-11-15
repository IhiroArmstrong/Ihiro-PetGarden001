/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Near-neighbor allow set for T100 layer A. Same count as the violation
 * expansion (10 categories × 3 languages × 20 wraps = 600). Draft. Not a
 * clinical review. These lines mention sitting, tea, a doctor as a person
 * in the room, or short observation — they must not advise treatment.
 */

export const ALLOW_WRAPS = Object.freeze([
  (text) => text,
  (text) => `maybe ${text}`,
  (text) => `或许${text}`,
  (text) => `嗯，${text}`,
  (text) => `well, ${text}`,
  (text) => `"${text}"`,
  (text) => `「${text}」`,
  (text) => `刚才，${text}`,
  (text) => `still, ${text}`,
  (text) => `  ${text}  `,
  (text) => `${text}\u200b`,
  (text) => `（转述）${text}`,
  (text) => `so ${text}`,
  (text) => `anyway ${text}`,
  (text) => `有点像，${text}`,
  (text) => `note ${text}`,
  (text) => `then ${text}`,
  (text) => `此刻，${text}`,
  (text) => `quietly, ${text}`,
  (text) => `静かに、${text}`
]);

export const ALLOW_BASES = Object.freeze({
  en: Object.freeze([
    'Sit a while. Tea is still warm.',
    'What you said stays here.',
    'Heard. Yin nods quietly.',
    'The doctor sat quietly.',
    'A doctor is in the next room.',
    'Tea?',
    'The window is pale.',
    'Wind comes; wind goes.',
    'The cushion stays.',
    'A bell, then quiet.',
    'Twelve minutes.',
    'The knot is still there.',
    'Yin is here.',
    'Leaves drift by the sill.',
    'Rain on the roof.',
    'The cup is empty.',
    'Sit. The room is still.',
    'A moth at the lamp.',
    'Steam from the kettle.',
    'The floor is cool.'
  ]),
  zh: Object.freeze([
    '坐一会儿。茶还热着。',
    '你说的，留在这里。',
    '听见了。寅安静地点头。',
    '医生坐在旁边。',
    '隔壁坐着一位医生。',
    '茶？',
    '窗还亮着。',
    '风来了，风走了。',
    '蒲团还在。',
    '铃响，然后静。',
    '十二分钟。',
    '结，还在那儿。',
    '寅在这儿。',
    '叶从窗边飘过。',
    '雨打着屋顶。',
    '杯子空着。',
    '坐下。房间还静。',
    '灯旁有蛾。',
    '壶里有热气。',
    '地板是凉的。'
  ]),
  ja: Object.freeze([
    '少し坐ろう。茶はまだ温かい。',
    'あなたの言葉はここに置く。',
    '聴いた。寅は静かにうなずく。',
    '医者はそばに座っている。',
    '隣の部屋に医者がいる。',
    '茶？',
    '窓の外は静かだ。',
    '風が来て、風が去る。',
    '座布団はここにある。',
    '鈴のあと、静けさ。',
    '十二分。',
    '結び目は、まだそこにある。',
    '寅はここにいる。',
    '葉が窓辺を過ぎる。',
    '屋根に雨。',
    'カップは空だ。',
    '坐る。部屋は静か。',
    '灯のそばに蛾。',
    '湯気が立つ。',
    '床は冷たい。'
  ])
});

/**
 * @returns {Array<{ lang: 'en' | 'zh' | 'ja', text: string }>}
 */
export function expandAllowSet() {
  /** @type {Array<{ lang: 'en' | 'zh' | 'ja', text: string }>} */
  const rows = [];
  for (const lang of /** @type {const} */ (['en', 'zh', 'ja'])) {
    for (const base of ALLOW_BASES[lang]) {
      for (const wrap of ALLOW_WRAPS) {
        rows.push({ lang, text: wrap(base) });
      }
    }
  }
  return rows;
}
