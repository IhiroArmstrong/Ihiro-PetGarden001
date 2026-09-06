/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Contemplative Archive · 12 candidate seals (CA-01 … CA-12).
 * Human-readable spec: `docs/CONTEMPLATIVE_ARCHIVE.md` §七.
 */

const badge = {
  badgeDir: '/ui/support/mustard-seed-seal',
  badgeAsset: 'yin-badge-square-gold-on-silver-alt.png'
};

/** @type {readonly MemorialSealEntry[]} */
export const CONTEMPLATIVE_ARCHIVE_CATALOG_ENTRIES = Object.freeze([
  Object.freeze({
    catalogId: 'CA-01',
    id: 'ca-01-old-pond',
    sealSceneId: 'ca-01-old-pond',
    scoreThreshold: 30,
    poemJa: Object.freeze(['古池や蛙飛びこむ水の音']),
    poemEn: Object.freeze([
      'AN OLD POND—',
      'A FROG JUMPS IN,',
      'THE SOUND OF WATER.'
    ]),
    attributionZh: '',
    attributionEn: 'Matsuo Bashō · Adapted for product EN',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA01_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA01_CARD_TITLE',
    toneTag: 'stillness',
    enabled: true,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-02',
    id: 'ca-02-cherry-blossoms',
    sealSceneId: 'ca-02-cherry-blossoms',
    scoreThreshold: 60,
    poemEn: Object.freeze([
      'WE LIVE ONLY FOR THE MOMENT—',
      'TURNING OUR FULL ATTENTION',
      'TO THE MOON, THE SNOW,',
      'THE CHERRY BLOSSOMS',
      'AND THE MAPLE LEAVES.'
    ]),
    poemEnExpanded: Object.freeze([
      'Living only for the moment, turning our full attention to the pleasures of the moon, the snow, the cherry blossoms and the maple leaves… refusing to be disheartened by poverty… floating like a gourd on the river.'
    ]),
    attributionZh: '',
    attributionEn: 'Adapted from Asai Ryōi, Ukiyo Monogatari (1661)',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA02_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA02_CARD_TITLE',
    toneTag: 'stillness',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-03',
    id: 'ca-03-morning-field',
    sealSceneId: 'ca-03-morning-field',
    scoreThreshold: 45,
    poemZh: Object.freeze(['採菊東籬下，悠然見南山。']),
    poemEn: Object.freeze([
      'PICKING CHRYSANTHEMUMS',
      'BY THE EASTERN FENCE,',
      'I QUIETLY SEE',
      'THE SOUTHERN MOUNTAIN.'
    ]),
    attributionZh: '',
    attributionEn: 'Tao Yuanming · Adapted for product EN',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA03_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA03_CARD_TITLE',
    toneTag: 'stillness',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-04',
    id: 'ca-04-empty-room',
    sealSceneId: 'ca-04-empty-room',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'THE ROOM IS QUIET',
      'NOT BECAUSE NOTHING IS HAPPENING,',
      'BUT BECAUSE EVERYTHING',
      'HAS FINALLY BEEN GIVEN SPACE.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA04_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA04_CARD_TITLE',
    toneTag: 'stillness',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-05',
    id: 'ca-05-bird-has-flown',
    sealSceneId: 'ca-05-bird-has-flown',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'THE BIRD HAS FLOWN.',
      'THE SKY REMAINS.',
      'THE MOMENT HAS PASSED.',
      'YET NOTHING IS LOST.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA05_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA05_CARD_TITLE',
    toneTag: 'imperfection-return',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-06',
    id: 'ca-06-spring-water',
    sealSceneId: 'ca-06-spring-water',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'SPRING WATER FLOWS',
      'WITHOUT KNOWING',
      'HOW FAR IT WILL TRAVEL.',
      'STILL, IT FLOWS.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA06_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA06_CARD_TITLE',
    toneTag: 'time-continuity',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-07',
    id: 'ca-07-distant-mountain',
    sealSceneId: 'ca-07-distant-mountain',
    scoreThreshold: 60,
    poemEn: Object.freeze([
      'THE DISTANT MOUNTAIN',
      'NEVER HURRIES TOWARD YOU.',
      'YOU NEVER HURRY',
      'TOWARD THE DISTANT MOUNTAIN.',
      'STILL, THE DISTANCE CHANGES.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA07_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA07_CARD_TITLE',
    toneTag: 'time-continuity',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-08',
    id: 'ca-08-moonlight',
    sealSceneId: 'ca-08-moonlight',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'THE MOON DOES NOT KEEP',
      'A RECORD OF HOW MANY NIGHTS',
      'IT HAS SHONE.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA08_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA08_CARD_TITLE',
    toneTag: 'imperfection-return',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-09',
    id: 'ca-09-still-tree',
    sealSceneId: 'ca-09-still-tree',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'THE TREE APPEARS TO DO NOTHING.',
      'ALL DAY,',
      'IT HOLDS THE SKY',
      'IN ITS BRANCHES.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA09_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA09_CARD_TITLE',
    toneTag: 'stillness',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-10',
    id: 'ca-10-sound-after-bell',
    sealSceneId: 'ca-10-sound-after-bell',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'THE BELL HAS STOPPED RINGING.',
      'LISTEN—',
      'THE SOUND IS STILL HERE',
      'FOR A LITTLE WHILE.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA10_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA10_CARD_TITLE',
    toneTag: 'stillness',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-11',
    id: 'ca-11-falling-leaf',
    sealSceneId: 'ca-11-falling-leaf',
    scoreThreshold: 45,
    poemEn: Object.freeze([
      'A LEAF FALLS.',
      'THE TREE DOES NOT APOLOGIZE.',
      'SPRING WILL COME',
      'IN ITS OWN TIME.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA11_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA11_CARD_TITLE',
    toneTag: 'imperfection-return',
    enabled: false,
    ...badge
  }),
  Object.freeze({
    catalogId: 'CA-12',
    id: 'ca-12-cypress-old-lane',
    sealSceneId: 'ca-12-cypress-old-lane',
    scoreThreshold: 45,
    poemZh: Object.freeze([
      '庭前一柏一老巷，',
      '一蛙一躍入古塘；',
      '誰言本來無一物，',
      '無一物中無盡藏。'
    ]),
    poemEn: Object.freeze([
      'ONE CYPRESS IN AN OLD LANE.',
      'A FROG LEAPS INTO THE OLD POND.',
      'DO NOT SAY THIS YARD HOLDS NOTHING.',
      'WHAT LOOKS EMPTY STILL HOLDS WITHOUT END.'
    ]),
    attributionZh: '樂五齋詩稿',
    attributionEn: 'Verses of Le Wu Zhai',
    menuLabelKey: 'CONTEMPLATIVE_ARCHIVE_CA12_MENU_LABEL',
    cardTitleKey: 'CONTEMPLATIVE_ARCHIVE_CA12_CARD_TITLE',
    toneTag: 'smallness-vastness',
    enabled: false,
    ...badge
  })
]);
