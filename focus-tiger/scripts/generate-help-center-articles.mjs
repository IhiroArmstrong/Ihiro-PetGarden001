/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One-shot generator: approved productKnowledgeCatalog → help center manifest + locale slice.
 * Run: node scripts/generate-help-center-articles.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(
  readFileSync(join(root, 'src/core/confide/productKnowledgeCatalog.json'), 'utf8')
);

/** @type {Record<string, string>} */
const SECTION_BY_ID = {
  'KB-FUNC-0001': 'start',
  'KB-FUNC-0004': 'start',
  'KB-FUNC-0007': 'start',
  'KB-FUNC-0008': 'start',
  'KB-FUNC-0011': 'start',
  'KB-FUNC-0029': 'start',
  'KB-FUNC-0030': 'start',
  'KB-FUNC-0031': 'start',
  'KB-FUNC-0032': 'start',
  'KB-FUNC-0034': 'start',
  'KB-FUNC-0002': 'practice',
  'KB-FUNC-0006': 'practice',
  'KB-FUNC-0013': 'practice',
  'KB-FUNC-0019': 'practice',
  'KB-FUNC-0020': 'practice',
  'KB-FUNC-0021': 'practice',
  'KB-FUNC-0022': 'practice',
  'KB-FUNC-0023': 'practice',
  'KB-FUNC-0024': 'practice',
  'KB-FUNC-0025': 'practice',
  'KB-FUNC-0026': 'practice',
  'KB-FUNC-0027': 'practice',
  'KB-FUNC-0028': 'practice',
  'KB-FUNC-0003': 'data',
  'KB-FUNC-0012': 'data',
  'KB-FUNC-0015': 'data',
  'KB-FUNC-0018': 'data',
  'KB-FUNC-0033': 'data',
  'KB-FUNC-0035': 'data',
  'KB-FUNC-0036': 'data',
  'KB-FUNC-0005': 'companion',
  'KB-FUNC-0010': 'companion',
  'KB-FUNC-0014': 'companion',
  'KB-FUNC-0016': 'companion',
  'KB-FUNC-0017': 'companion',
  'KB-EDU-0001': 'learn',
  'KB-EDU-0002': 'learn',
  'KB-EDU-0003': 'learn',
  'KB-EDU-0004': 'learn'
};

/** @type {Record<string, { en: string; zh: string; ja: string }>} */
const TITLE_BY_ID = {
  'KB-FUNC-0007': {
    en: 'How to end a sit (Rise)',
    zh: '如何结束同坐（起身）',
    ja: '同坐を終える（Rise）'
  },
  'KB-FUNC-0008': {
    en: 'How Shall We Sit?',
    zh: '这次怎么陪你',
    ja: 'どのように坐りますか？'
  },
  'KB-FUNC-0010': {
    en: 'Opening Confide to Yin',
    zh: '向阿寅倾诉从哪里开',
    ja: '寅に話すを開く'
  },
  'KB-FUNC-0011': {
    en: 'Breath practice vs Sit with Yin',
    zh: '呼吸练习和同坐的区别',
    ja: '呼吸練習と Sit の違い'
  },
  'KB-FUNC-0012': {
    en: 'Journey log',
    zh: '旅程留痕（练习记录）',
    ja: '旅の記録'
  },
  'KB-FUNC-0013': {
    en: 'Presence moments',
    zh: 'Presence moments',
    ja: '気配のひととき'
  },
  'KB-FUNC-0014': {
    en: 'What Yin remembers',
    zh: '阿寅记得什么',
    ja: '寅が覚えていること'
  },
  'KB-FUNC-0015': {
    en: 'Backup file format',
    zh: '备份文件格式',
    ja: 'バックアップの形式'
  },
  'KB-FUNC-0016': {
    en: 'Confide while you Sit',
    zh: '同坐时与倾诉',
    ja: '同坐中の話す'
  },
  'KB-FUNC-0017': {
    en: 'Desktop app vs browser',
    zh: '桌面版与浏览器',
    ja: 'デスクトップとブラウザ'
  },
  'KB-FUNC-0018': {
    en: 'Earning focus coins',
    zh: '如何获得寅币',
    ja: 'フォーカスコイン'
  },
  'KB-FUNC-0019': {
    en: 'The 5 Moments',
    zh: '五个时刻',
    ja: '五つの時間'
  },
  'KB-FUNC-0021': {
    en: 'A Quiet Line',
    zh: '一句静语',
    ja: '今日のひとこと'
  },
  'KB-FUNC-0022': {
    en: 'Zen Cinema',
    zh: '禅意影院',
    ja: '禅シネマ'
  },
  'KB-FUNC-0023': {
    en: 'Wallpapers',
    zh: '壁纸',
    ja: '壁紙'
  },
  'KB-FUNC-0024': {
    en: 'Morning Ritual',
    zh: '早晨仪式',
    ja: '朝の儀式'
  },
  'KB-FUNC-0025': {
    en: 'Emotional Reset',
    zh: '情绪重置',
    ja: 'こころのリセット'
  },
  'KB-FUNC-0026': {
    en: 'Work Transition',
    zh: '下班过渡',
    ja: '仕事からの移行'
  },
  'KB-FUNC-0027': {
    en: 'Quiet together worldwide',
    zh: '全球同坐',
    ja: '世界の静かな同席'
  },
  'KB-FUNC-0028': {
    en: 'My circle (Focus Circle)',
    zh: '我的小圈',
    ja: '私の輪'
  },
  'KB-FUNC-0029': {
    en: "Today's direction",
    zh: '今日方向',
    ja: '今日の方向'
  },
  'KB-FUNC-0030': {
    en: 'Navigate sanctuary',
    zh: '栖居导航',
    ja: '栖居ナビ'
  },
  'KB-FUNC-0031': {
    en: 'Join our community',
    zh: '加入社区',
    ja: 'コミュニティ'
  },
  'KB-FUNC-0032': {
    en: 'Yin Membership',
    zh: '会员订阅',
    ja: 'メンバーシップ'
  },
  'KB-FUNC-0033': {
    en: 'Practice reminders',
    zh: '练习提醒',
    ja: 'リマインダー'
  },
  'KB-FUNC-0034': {
    en: 'Pomodoro in Focus Tiger',
    zh: '番茄钟在这里指什么',
    ja: 'ポモドーロ'
  },
  'KB-FUNC-0035': {
    en: 'Downloading a Focus Coin badge',
    zh: '下载寅币徽章',
    ja: 'コイン風バッジの保存'
  },
  'KB-FUNC-0036': {
    en: 'Downloading your badge',
    zh: '下载我的徽章',
    ja: 'バッジをダウンロード'
  },
  'KB-EDU-0003': {
    en: 'Focus sit vs meditation',
    zh: '专注与冥想的说法',
    ja: 'Focus sit と瞑想'
  },
  'KB-EDU-0004': {
    en: 'Where practices live in the app',
    zh: '概念对应哪些入口',
    ja: '練習の入口一覧'
  }
};

function idToLocaleStem(id) {
  const m = id.match(/^KB-(FUNC|EDU)-(\d+)$/);
  if (!m) throw new Error(`bad id ${id}`);
  return `HELP_CENTER_ARTICLE_KB_${m[1]}_${m[2]}`;
}

function formatBodyEn(text) {
  return text
    .replace(/。/g, '.')
    .replace(/\. ([A-Z])/g, '.\n\n$1')
    .replace(/\n\n(Yin only points)/g, '\n\n$1');
}

/** @type {Record<string, { zh: string; ja: string }>} */
const BODY_ZH_JA = {
  'KB-FUNC-0007': {
    zh: '同坐中点底部「起身」结束本场；随时可再开始同坐。',
    ja: '同坐中は下の Rise で終えます。いつでも再開できます。'
  },
  'KB-FUNC-0008': {
    zh: '点同坐后可能出现「这次怎么陪你」；也可在菜单练习里再开。选模式后点开始。',
    ja: 'Sit の後に How Shall We Sit? が出ることがあります。⋯ → 練習からも開けます。'
  },
  'KB-FUNC-0010': {
    zh: '菜单练习 → 向阿寅倾诉；宽屏另有耳朵快捷。桌面本机生成；浏览器能力有限。',
    ja: '⋯ → 練習 → 寅に話す。ワイド画面には耳ショートカットも。'
  },
  'KB-FUNC-0011': {
    zh: '同坐从 10 分钟起；更短停顿用左侧呼吸球，不是完整同坐。',
    ja: 'Sit は10分から。短い休憩は左オーブの呼吸練習。'
  },
  'KB-FUNC-0012': {
    zh: '菜单练习 → 旅程留痕，看本机练习轨迹；倾诉里也可问练了多久。',
    ja: '⋯ → 練習 → Journey log。'
  },
  'KB-FUNC-0013': {
    zh: '菜单练习 → Presence moments，本机小签到；倾诉里可问近期情绪趋势。',
    ja: '⋯ → 練習 → Presence moments。'
  },
  'KB-FUNC-0014': {
    zh: '打开倾诉，点卡片内「阿寅记得什么」；可逐条忘掉。',
    ja: '話すを開き、What Yin remembers をタップ。'
  },
  'KB-FUNC-0015': {
    zh: '本地备份为未加密 JSON，请自行妥善保管；含练习、情绪、记忆等，不含环境音上传。',
    ja: 'バックアップは暗号化されない JSON です。'
  },
  'KB-FUNC-0016': {
    zh: '桌面同坐时本机模型会卸载以保持流畅；先起身再开倾诉。',
    ja: '同坐中はモデルがアンロードされます。Rise 後に話す。'
  },
  'KB-FUNC-0017': {
    zh: '本机生成在 Mac/Windows 桌面版；浏览器可练习，但无本机模型下载与生成。',
    ja: 'オンデバイス AI はデスクトップアプリのみ。'
  },
  'KB-FUNC-0018': {
    zh: '同坐或呼吸可攒寅币；坚持越久越多，有每日安静上限。在阿寅收藏处查看。',
    ja: '同坐・呼吸でコイン。コレクションで確認。'
  },
  'KB-FUNC-0019': {
    zh: '菜单练习 → 五个时刻；宽屏也可点右球。罗盘可跳到各时刻，例如反思开旅程留痕。',
    ja: '⋯ → The 5 Moments。右オーブからも。'
  },
  'KB-FUNC-0021': {
    zh: '菜单灵感 → 一句静语；今日一句本机选取，可保存图片。',
    ja: '⋯ → インスピレーション → 今日のひとこと。端末に画像を保存できます。'
  },
  'KB-FUNC-0022': {
    zh: '菜单灵感 → 禅意影院；在浏览器打开精选短片，不在应用内播放。',
    ja: '⋯ → Zen Cinema。YouTube で視聴。'
  },
  'KB-FUNC-0023': {
    zh: '菜单灵感 → 壁纸；选静帧保存到本机，无需账号。',
    ja: '⋯ → Wallpapers。画像を保存。'
  },
  'KB-FUNC-0024': {
    zh: '菜单仪式 → 早晨仪式；会员或终身通行证解锁。阿寅只指路，不念步骤。',
    ja: '⋯ → Rituals → Morning Ritual（要メンバー）。'
  },
  'KB-FUNC-0025': {
    zh: '菜单仪式 → 情绪重置，或五时刻罗盘 Recover；会员场景。',
    ja: '⋯ → 儀式 → こころのリセット。五つの時間の「回復」からも開けます（要メンバー）。'
  },
  'KB-FUNC-0026': {
    zh: '菜单仪式 → 下班过渡；会员场景，与五时刻免费过渡叠层不同。',
    ja: '⋯ → 儀式 → 仕事からの移行。五つの時間の短い切り替えとは別の多段シーンです。'
  },
  'KB-FUNC-0027': {
    zh: '菜单你不孤单 → 全球同坐；匿名灯笼，默认开，隐私里可关。',
    ja: '⋯ → ひとりじゃない → 世界の静かな同席。匿名の灯。プライバシーでオフにできます。'
  },
  'KB-FUNC-0028': {
    zh: '菜单你不孤单 → 我的小圈；最多八人，站外六码邀请，无聊天。',
    ja: '⋯ → ひとりじゃない → 私の輪。最大8人、合言葉招待、チャットなし。'
  },
  'KB-FUNC-0029': {
    zh: '偏好设置可重选今日方向，或点首页 Today 球；跳过也不影响同坐。',
    ja: '⋯ → 今日の方向を選び直す。'
  },
  'KB-FUNC-0030': {
    zh: '练习与时刻 → 栖居导航；宽屏也可点指南针球，在 Home/日历/收藏间走。',
    ja: '⋯ → 練習とひととき → サンクチュアリ案内。ワイド画面ではコンパス球からも。'
  },
  'KB-FUNC-0031': {
    zh: '偏好设置 → 加入社区，打开站外社区页；可选，不同坐无关。',
    ja: '⋯ → 設定 → コミュニティに参加。ブラウザで公開ページが開きます。'
  },
  'KB-FUNC-0032': {
    zh: '菜单仪式上方会员行；可选订阅，随时可取消；请茶不解锁高级场景。',
    ja: '⋯ の Subscribe for more scenes。'
  },
  'KB-FUNC-0033': {
    zh: '偏好设置 → 何时提醒你；开提醒并选每日时间；页顶温和提示，非浏览器通知。',
    ja: '⋯ → 設定 → いつリマインドしますか。ページ上部のやさしいメモ（ブラウザ通知ではありません）。'
  },
  'KB-FUNC-0034': {
    zh: '此处番茄钟指 25 分钟同坐；不含短休息循环；语音可说 start a pomodoro。',
    ja: 'ポモドーロ＝25分の Sit。休憩サイクルなし。'
  },
  'KB-FUNC-0035': {
    zh: '可下载的是酷似寅币的徽章；已有徽章时在展示框内点按下载。',
    ja: 'コイン風バッジを枠内タップで保存。'
  },
  'KB-FUNC-0036': {
    zh: '已有徽章时，在徽章展示框内点按即可下载。',
    ja: 'バッジを枠内タップでダウンロード。'
  },
  'KB-EDU-0003': {
    zh: '冥想、专注、正念在日常说法里相近但不相同；本产品主路径是与阿寅同坐。',
    ja: '言葉の違いの説明。本製品の主路は Sit with Yin。'
  },
  'KB-EDU-0004': {
    zh: '同坐→主钮；短呼吸→左球；接地练习→菜单接地。此处只对照入口。',
    ja: 'Sit／呼吸／グラウンディングの入口対応。'
  }
};

const catalogById = new Map(catalog.entries.map((e) => [e.id, e]));

const articleIds = [
  ...catalog.entries.map((e) => e.id),
  'KB-FUNC-0006'
];

const sectionOrder = ['start', 'practice', 'data', 'companion', 'learn'];
const sortedIds = [...articleIds].sort((a, b) => {
  const sa = SECTION_BY_ID[a] ?? 'start';
  const sb = SECTION_BY_ID[b] ?? 'start';
  const ia = sectionOrder.indexOf(sa);
  const ib = sectionOrder.indexOf(sb);
  if (ia !== ib) return ia - ib;
  return a.localeCompare(b, undefined, { numeric: true });
});

const existingSlice = JSON.parse(
  readFileSync(join(root, 'src/locales/slices/help-center.json'), 'utf8')
);

const shellKeys = Object.keys(existingSlice.en).filter(
  (k) => !k.startsWith('HELP_CENTER_ARTICLE_')
);

/** @type {Record<string, Record<string, string>>} */
const locales = { en: {}, zh: {}, ja: {} };
for (const lang of ['en', 'zh', 'ja']) {
  for (const k of shellKeys) {
    locales[lang][k] = existingSlice[lang][k];
  }
}

for (const id of sortedIds) {
  const stem = idToLocaleStem(id);
  const titleKey = `${stem}_TITLE`;
  const bodyKey = `${stem}_BODY`;
  const entry = catalogById.get(id);
  const titles = TITLE_BY_ID[id];

  if (id === 'KB-FUNC-0006') {
    locales.en[titleKey] = existingSlice.en[titleKey];
    locales.zh[titleKey] = existingSlice.zh[titleKey];
    locales.ja[titleKey] = existingSlice.ja[titleKey];
    locales.en[bodyKey] = existingSlice.en[bodyKey];
    locales.zh[bodyKey] = existingSlice.zh[bodyKey];
    locales.ja[bodyKey] = existingSlice.ja[bodyKey];
    continue;
  }

  if (!entry) throw new Error(`missing catalog ${id}`);
  if (existingSlice.en[titleKey] && !titles) {
    locales.en[titleKey] = existingSlice.en[titleKey];
    locales.zh[titleKey] = existingSlice.zh[titleKey];
    locales.ja[titleKey] = existingSlice.ja[titleKey];
    locales.en[bodyKey] = existingSlice.en[bodyKey];
    locales.zh[bodyKey] = existingSlice.zh[bodyKey];
    locales.ja[bodyKey] = existingSlice.ja[bodyKey];
    continue;
  }

  locales.en[titleKey] = titles?.en ?? entry.id;
  locales.zh[titleKey] = titles?.zh ?? locales.en[titleKey];
  locales.ja[titleKey] = titles?.ja ?? locales.en[titleKey];
  locales.en[bodyKey] = formatBodyEn(entry.shortAnswerEn);
  const zj = BODY_ZH_JA[id];
  locales.zh[bodyKey] = zj?.zh ?? locales.en[bodyKey];
  locales.ja[bodyKey] = zj?.ja ?? locales.en[bodyKey];
}

writeFileSync(
  join(root, 'src/locales/slices/help-center.json'),
  `${JSON.stringify(locales, null, 2)}\n`,
  'utf8'
);

const articleLines = sortedIds.map((id) => {
  const stem = idToLocaleStem(id);
  const sectionId = SECTION_BY_ID[id];
  return `  Object.freeze({
    id: '${id}',
    sectionId: '${sectionId}',
    titleKey: '${stem}_TITLE',
    bodyKey: '${stem}_BODY',
    kbTraceId: '${id}'
  })`;
});

const catalogJs = readFileSync(join(root, 'src/core/helpCenterCatalog.js'), 'utf8');
const replaced = catalogJs.replace(
  /export const HELP_CENTER_ARTICLES = Object\.freeze\(\[[\s\S]*?\]\);/,
  `export const HELP_CENTER_ARTICLES = Object.freeze([\n${articleLines.join(',\n')}\n]);`
);
writeFileSync(join(root, 'src/core/helpCenterCatalog.js'), replaced, 'utf8');

console.log(`help center articles: ${sortedIds.length}`);
