/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A set is the sales unit: five pieces, one payment.
 * An edition is how many of that set are recorded: 100 sets, then stop.
 * The tea gift is not a member of any set and does not use this count.
 */

/** @type {number} */
export const ART_EDITION_LIMIT = 100;

/** @type {number} One set of five. Five times the old per-sheet price. */
export const ART_EDITION_PRICE_USD = 9.95;

/** @type {number} */
export const ART_EDITION_PRICE_CENTS = 995;

export const TEA_GIFT_ART = Object.freeze({
  id: 'gold-duck-yi',
  nameEn: 'Gold duck yi',
  nameZh: '金鸭形匜',
  storyEn: 'A duck-headed pouring cup. It stays with the tea, outside every set for sale.',
  storyZh: '鸭首金匜。它留在请茶这边，不进任何在售套装。',
  captionEn: 'A piece left with the tea',
  captionZh: '请茶留下的一张',
  previewSrc: '/ui/tea-gift/preview-gold-duck-yi.png',
  hdId: 'hd-tg-01'
});

/**
 * @param {string} id
 * @param {string} nameEn
 * @param {string} nameZh
 * @param {string} storyEn
 * @param {string} storyZh
 */
function editionSheet(setId, id, nameEn, nameZh, storyEn, storyZh) {
  return Object.freeze({
    id,
    nameEn,
    nameZh,
    storyEn,
    storyZh,
    previewSrc: `/ui/art-collection/${setId}/preview-${id}.png`
  });
}

export const CELADON_RELIEF_FIVE = Object.freeze({
  id: 'celadon-relief-five',
  editionLimit: ART_EDITION_LIMIT,
  priceUsd: ART_EDITION_PRICE_USD,
  nameEn: 'Celadon relief five',
  nameZh: '青瓷浮雕五件',
  storyEn:
    'Five relief vessels, bought together. This edition records 100 sets, then stops adding more.',
  storyZh: '五件浮雕器物，一次买齐。这一版记下 100 套之后，不再加印。',
  sheets: Object.freeze([
    editionSheet(
      'celadon-relief-five',
      'celadon-relief-dragon-gu',
      'Celadon relief dragon gu',
      '青瓷浮雕龙耳觚',
      'A tall celadon beaker with a dragon-shaped handle and relief bands.',
      '高觚，龙形把，身上是浅浮雕纹。'
    ),
    editionSheet(
      'celadon-relief-five',
      'moon-white-floral-tiered-box',
      'Moon-white floral tiered box',
      '月白釉花卉多层盒',
      'A square moon-white box in stacked tiers, carved with flowers.',
      '月白釉方盒，一层一层，刻着花。'
    ),
    editionSheet(
      'celadon-relief-five',
      'celadon-cloud-square-box',
      'Celadon cloud square box',
      '青瓷云纹方盒',
      'A lidded square box. The lid and body carry scrolling clouds.',
      '带盖方盒，盖上和身上是云纹。'
    ),
    editionSheet(
      'celadon-relief-five',
      'celadon-peony-vase',
      'Celadon peony vase',
      '青瓷牡丹纹瓶',
      'A round vase. Peonies stand in relief on the neck and the belly.',
      '圆腹瓶，颈上和腹上是浮雕牡丹。'
    ),
    editionSheet(
      'celadon-relief-five',
      'celadon-ice-crack-hu',
      'Celadon ice-crack hu',
      '青瓷冰裂纹壶',
      'A square-mouthed hu. The glaze is cut by an ice-crack pattern.',
      '方口壶，釉上是冰裂纹。'
    )
  ])
});

export const CIZHOU_RED_GREEN_FIVE = Object.freeze({
  id: 'cizhou-red-green-five',
  editionLimit: ART_EDITION_LIMIT,
  priceUsd: ART_EDITION_PRICE_USD,
  nameEn: 'Cizhou red-green five',
  nameZh: '磁州窑红绿彩五件',
  storyEn:
    'Five Cizhou vessels in red and green. Bought together. This edition records 100 sets, then stops adding more.',
  storyZh: '五件磁州窑红绿彩，一次买齐。这一版记下 100 套之后，不再加印。',
  sheets: Object.freeze([
    editionSheet(
      'cizhou-red-green-five',
      'cizhou-twin-fanghu',
      'Cizhou twin fanghu',
      '磁州窑红绿彩方壶一对',
      'A matched pair of square hu. Red and green scroll on a pale ground.',
      '一对方壶，浅地红绿缠枝。'
    ),
    editionSheet(
      'cizhou-red-green-five',
      'cizhou-covered-ding',
      'Cizhou covered ding',
      '磁州窑红绿彩盖鼎',
      'A tripod ding with its lid. Bands of red and green on cream slip.',
      '带盖三足鼎，红绿彩带绕腹。'
    ),
    editionSheet(
      'cizhou-red-green-five',
      'cizhou-flower-rim-plate',
      'Cizhou flower-rim plate',
      '磁州窑红绿彩花口盘',
      'A lobed dish on a black ground. The rim opens like petals.',
      '黑地花口盘，口沿像花瓣。'
    ),
    editionSheet(
      'cizhou-red-green-five',
      'cizhou-dragon-fish-gu',
      'Cizhou dragon-fish gu',
      '磁州窑龙把鱼纹觚',
      'A gu with a dragon handle. Fish swim in red and green bands.',
      '龙把觚，红绿鱼纹绕身。'
    ),
    editionSheet(
      'cizhou-red-green-five',
      'cizhou-changchun-square-plate',
      'Cizhou Changchun square plate',
      '磁州窑长春万岁方盘',
      'A square dish. The center reads Changchun wansui in regular script.',
      '方盘，中心楷书「长春万岁」。'
    )
  ])
});

export const GE_CRACKLE_1010_G1 = Object.freeze({
  id: 'ge-crackle-1010-g1',
  editionLimit: ART_EDITION_LIMIT,
  priceUsd: ART_EDITION_PRICE_USD,
  nameEn: 'Ge crackle five (I)',
  nameZh: '哥窑开片五件（壹）',
  storyEn:
    'Five Ge-crackle vessels from grouping G1. Bought together. This edition records 100 sets, then stops adding more.',
  storyZh: '哥窑开片五件·分组壹，一次买齐。这一版记下 100 套之后，不再加印。',
  sheets: Object.freeze([
    editionSheet(
      'ge-crackle-1010-g1',
      'ge-g1-hunting-stem-bowl',
      'Ge hunting-scene dou',
      '哥窑狩猎纹豆',
      'A stemmed bowl with a lid and two ring handles. Animals run around the bowl.',
      '带盖豆，双环耳，一圈奔走的动物。'
    ),
    editionSheet(
      'ge-crackle-1010-g1',
      'ge-g1-taotie-gu',
      'Ge taotie gu',
      '哥窑兽面纹觚',
      'A gu in crackled glaze, with a square taotie knop on the stem.',
      '开片釉觚，腰间一方兽面节。'
    ),
    editionSheet(
      'ge-crackle-1010-g1',
      'ge-g1-beast-ring-hu',
      'Ge beast-ring hu',
      '哥窑兽首衔环壶',
      'A globular hu. Beast heads at the shoulder hold rings.',
      '圆腹壶。肩上兽首衔环。'
    ),
    editionSheet(
      'ge-crackle-1010-g1',
      'ge-g1-upright-ear-ding',
      'Ge upright-ear ding',
      '哥窑立耳兽面鼎',
      'A ding with two upright handles and three legs shaped as animal masks.',
      '鼎，双立耳，三足做成兽面。'
    ),
    editionSheet(
      'ge-crackle-1010-g1',
      'ge-g1-dragon-zun',
      'Ge dragon zun',
      '哥窑龙纹尊',
      'A trumpet-mouth zun with raised dragons on the body.',
      '喇叭口尊，身上有凸起的龙。'
    )
  ])
});

export const GE_CRACKLE_1010_G2 = Object.freeze({
  id: 'ge-crackle-1010-g2',
  editionLimit: ART_EDITION_LIMIT,
  priceUsd: ART_EDITION_PRICE_USD,
  nameEn: 'Ge crackle five (II)',
  nameZh: '哥窑开片五件（贰）',
  storyEn:
    'Five Ge-crackle vessels from grouping G2. Bought together. This edition records 100 sets, then stops adding more.',
  storyZh: '哥窑开片五件·分组贰，一次买齐。这一版记下 100 套之后，不再加印。',
  sheets: Object.freeze([
    editionSheet(
      'ge-crackle-1010-g2',
      'ge-g2-taotie-li',
      'Ge taotie li',
      '哥窑兽面纹鬲',
      'A li: three hollow legs, a taotie band, and crackle across the glaze.',
      '鬲：三只袋足，兽面纹，釉上开片。'
    ),
    editionSheet(
      'ge-crackle-1010-g2',
      'ge-g2-dragon-zun',
      'Ge dragon zun',
      '哥窑龙纹尊',
      'A trumpet-mouth zun with raised dragons on the body.',
      '喇叭口尊，身上有凸起的龙。'
    ),
    editionSheet(
      'ge-crackle-1010-g2',
      'ge-g2-hunting-stem-bowl',
      'Ge hunting-scene dou',
      '哥窑狩猎纹豆',
      'A stemmed bowl with a lid and two ring handles. Animals run around the bowl.',
      '带盖豆，双环耳，一圈奔走的动物。'
    ),
    editionSheet(
      'ge-crackle-1010-g2',
      'ge-g2-taotie-gu',
      'Ge taotie gu',
      '哥窑兽面纹觚',
      'A gu in crackled glaze, with a square taotie knop on the stem.',
      '开片釉觚，腰间一方兽面节。'
    ),
    editionSheet(
      'ge-crackle-1010-g2',
      'ge-g2-crackle-fanghu',
      'Ge crackle fanghu',
      '哥窑开片方壶',
      'Ge crackle on a Shang–Zhou lidded square fanghu. Dragon handles and geometric relief on the belly.',
      '哥窑开片釉。仿商周带盖方壶，龙形耳，腹上几何浮雕纹。'
    )
  ])
});

export const ART_EDITION_SETS = Object.freeze([
  CELADON_RELIEF_FIVE,
  CIZHOU_RED_GREEN_FIVE,
  GE_CRACKLE_1010_G1,
  GE_CRACKLE_1010_G2
]);

/**
 * @param {string} id
 * @returns {(typeof ART_EDITION_SETS)[number] | null}
 */
export function findArtEditionSet(id) {
  return ART_EDITION_SETS.find((row) => row.id === id) || null;
}

/**
 * @param {string} artId
 * @returns {string[]}
 */
export function artIdsGrantedByEdition(artId) {
  const set = findArtEditionSet(artId);
  if (!set) return [];
  return [set.id, ...set.sheets.map((row) => row.id)];
}

/**
 * @param {number} sold
 * @param {number} limit
 * @returns {{ ok: true, next: number } | { ok: false, reason: 'edition_closed' }}
 */
export function decideEditionSale(sold, limit) {
  const count = Number.isInteger(sold) && sold > 0 ? sold : 0;
  if (count >= limit) return { ok: false, reason: 'edition_closed' };
  return { ok: true, next: count + 1 };
}

/**
 * @param {number} sold
 * @returns {number}
 */
export function decideEditionRelease(sold) {
  const count = Number.isInteger(sold) && sold > 0 ? sold : 0;
  return count > 0 ? count - 1 : 0;
}
