/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Art Collection sheet list.
 * Public URLs are watermarked previews only.
 * `hdId` is a new filename stem. The bytes stay out of this public repo.
 */

/** @type {number} Suggested price. Not a live charge. */
export const ART_COLLECTION_PRICE_USD = 1.99;

export const ART_COLLECTION_SETS = Object.freeze([
  Object.freeze({ id: 'song-porcelain', labelKey: 'ART_SET_SONG_PORCELAIN' }),
  Object.freeze({ id: 'song-ge-ware', labelKey: 'ART_SET_SONG_GE' }),
  Object.freeze({ id: 'tixi-lacquer', labelKey: 'ART_SET_TIXI' })
]);

/** Withdrawn. Must not be listed or sold. */
export const WITHDRAWN_ART_SHEET_IDS = Object.freeze([
  'celadon-garlic-mouth-ring-bottle',
  'ge-dragon-handle-he'
]);

/**
 * @param {string} setId
 * @param {string} id
 * @param {string} hdId
 * @param {string} nameEn
 * @param {string} nameZh
 * @param {string} storyEn
 * @param {string} storyZh
 */
function sheet(setId, id, hdId, nameEn, nameZh, storyEn, storyZh) {
  return Object.freeze({
    id,
    setId,
    hdId,
    nameEn,
    nameZh,
    storyEn,
    storyZh,
    previewSrc: `/ui/art-collection/${setId}/preview-${id}.png`
  });
}

export const ART_COLLECTION_SHEETS = Object.freeze([
  sheet(
    'song-porcelain',
    'celadon-taotie-gu',
    'hd-sp-01',
    'Celadon taotie gu',
    '青瓷兽面纹觚',
    'A tall beaker: flared mouth, narrow stem, taotie bands, and a square knop in the middle.',
    '高觚：敞口、细腰、兽面纹，腰间有一方节。'
  ),
  sheet(
    'song-porcelain',
    'celadon-taotie-zun',
    'hd-sp-02',
    'Celadon taotie zun',
    '青瓷兽面纹尊',
    'A zun with a wide trumpet mouth and a taotie frieze around the waist.',
    '喇叭口尊，腰间一圈兽面纹。'
  ),
  sheet(
    'song-porcelain',
    'celadon-floral-ring-hu',
    'hd-sp-03',
    'Celadon floral ring hu',
    '青瓷卷草纹衔环壶',
    'A round hu. Animal masks hold loose rings; the body carries scrolling flowers.',
    '圆壶。兽首衔环，身上是卷草纹。'
  ),
  sheet(
    'song-porcelain',
    'celadon-dragon-ring-fanghu',
    'hd-sp-04',
    'Celadon dragon-ring fanghu',
    '青瓷龙耳衔环方壶',
    'A square jar. Dragons on the shoulder hold rings.',
    '方壶。肩上的龙衔着环。'
  ),
  sheet(
    'song-porcelain',
    'celadon-taotie-gui',
    'hd-sp-05',
    'Celadon taotie gui',
    '青瓷兽面纹簋',
    'A gui: round bowl, flared rim, two handles, and a taotie band.',
    '簋：圆腹、敞沿、双耳，一圈兽面纹。'
  ),
  sheet(
    'song-porcelain',
    'celadon-taotie-ding',
    'hd-sp-06',
    'Celadon taotie ding',
    '青瓷兽面纹鼎',
    'A round ding on three legs, with a lid and upright flanges.',
    '圆鼎，三足，有盖，口沿立着扉棱。'
  ),
  sheet(
    'song-porcelain',
    'celadon-beast-foot-pan',
    'hd-sp-07',
    'Celadon beast-foot pan',
    '青瓷兽足盘',
    'A wide pan on a ring foot. Small beasts stand under the rim.',
    '宽盘，圈足，沿下立着小兽。'
  ),
  sheet(
    'song-porcelain',
    'jun-moon-white-dragon-fanghu',
    'hd-sp-08',
    'Jun moon-white dragon fanghu',
    '月白釉龙耳方壶',
    'Moon-white Jun glaze, not Longquan celadon. A lidded square jar with dragon handles.',
    '月白釉钧窑，不是龙泉青瓷。带盖方壶，龙形耳。'
  ),
  sheet(
    'song-ge-ware',
    'ge-taotie-li',
    'hd-sg-01',
    'Ge taotie li',
    '哥窑兽面纹鬲',
    'A li: three hollow legs, a taotie band, and crackle across the glaze.',
    '鬲：三只袋足，兽面纹，釉上开片。'
  ),
  sheet(
    'song-ge-ware',
    'ge-dragon-zun',
    'hd-sg-02',
    'Ge dragon zun',
    '哥窑龙纹尊',
    'A trumpet-mouth zun with raised dragons on the body.',
    '喇叭口尊，身上有凸起的龙。'
  ),
  sheet(
    'song-ge-ware',
    'ge-hunting-stem-bowl',
    'hd-sg-03',
    'Ge hunting-scene dou',
    '哥窑狩猎纹豆',
    'A stemmed bowl with a lid and two ring handles. Animals run around the bowl.',
    '带盖豆，双环耳，一圈奔走的动物。'
  ),
  sheet(
    'song-ge-ware',
    'ge-beast-ring-hu',
    'hd-sg-04',
    'Ge beast-ring hu',
    '哥窑兽首衔环壶',
    'A globular hu. Beast heads at the shoulder hold rings.',
    '圆腹壶。肩上兽首衔环。'
  ),
  sheet(
    'song-ge-ware',
    'ge-upright-ear-ding',
    'hd-sg-05',
    'Ge upright-ear ding',
    '哥窑立耳兽面鼎',
    'A ding with two upright handles and three legs shaped as animal masks.',
    '鼎，双立耳，三足做成兽面。'
  ),
  sheet(
    'song-ge-ware',
    'ge-taotie-gu',
    'hd-sg-06',
    'Ge taotie gu',
    '哥窑兽面纹觚',
    'A gu in crackled glaze, with a square taotie knop on the stem.',
    '开片釉觚，腰间一方兽面节。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-dragon-yi',
    'hd-tx-01',
    'Tixi dragon yi',
    '剔犀龙柄匜',
    'A pouring yi. The handle ends in a dragon head; the feet are short and carved.',
    '匜。柄端是龙头，足矮而有刻纹。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-cloud-ge',
    'hd-tx-02',
    'Tixi cloud-scroll ge',
    '剔犀云纹戈',
    'A dagger-axe covered in cloud scrolls. The hole in the blade is part of the weapon.',
    '戈，满身云纹。刃上的孔是兵器本身的。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-taotie-gu',
    'hd-tx-03',
    'Tixi taotie gu',
    '剔犀兽面纹觚',
    'A lacquer gu: flared mouth, taotie panels, and a square mid-section.',
    '漆觚：敞口、兽面、腰间一段方形。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-four-ram-zun',
    'hd-tx-04',
    'Tixi four-ram zun',
    '剔犀四羊方尊',
    'A square zun. Four rams stand at the corners and share the body.',
    '方尊。四角各一只羊，身子连在一起。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-upright-ear-ding',
    'hd-tx-05',
    'Tixi upright-ear ding',
    '剔犀立耳兽面鼎',
    'A lacquer ding with upright handles and animal-mask legs.',
    '漆鼎，立耳，足是兽面。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-taotie-li',
    'hd-tx-06',
    'Tixi taotie li',
    '剔犀兽面纹鬲',
    'A li in carved lacquer, three legs, taotie panels.',
    '剔犀鬲，三足，兽面纹。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-dragon-ring-hu',
    'hd-tx-07',
    'Tixi dragon-ring hu',
    '剔犀龙耳衔环壶',
    'A hu. Dragons on the shoulder hold rings; cloud bands circle the neck.',
    '壶。肩上龙衔环，颈上一圈云纹。'
  ),
  sheet(
    'tixi-lacquer',
    'tixi-dragon-ear-gui',
    'hd-tx-08',
    'Tixi dragon-ear gui',
    '剔犀龙耳簋',
    'A gui with dragon-head handles and a taotie face on the belly.',
    '簋。龙首耳，腹上兽面。'
  )
]);

/**
 * @param {string} id
 * @returns {(typeof ART_COLLECTION_SHEETS)[number] | null}
 */
export function findArtSheet(id) {
  return ART_COLLECTION_SHEETS.find((row) => row.id === id) || null;
}

/**
 * @param {'en' | 'zh' | string} locale
 * @param {{ nameEn: string, nameZh: string }} sheetRow
 * @returns {string}
 */
export function artSheetName(locale, sheetRow) {
  return locale === 'zh' ? sheetRow.nameZh : sheetRow.nameEn;
}

/**
 * @param {'en' | 'zh' | string} locale
 * @param {{ storyEn: string, storyZh: string }} sheetRow
 * @returns {string}
 */
export function artSheetStory(locale, sheetRow) {
  return locale === 'zh' ? sheetRow.storyZh : sheetRow.storyEn;
}
