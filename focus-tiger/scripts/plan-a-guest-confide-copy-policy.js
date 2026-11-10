/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Plan A option 1: guest-visible copy must not promise Confide / on-device chat is open now.
 */

/** Keys that are short labels / section titles — not purchase promises by themselves. */
export const PLAN_A_KEY_LABEL_ALLOWLIST = new Set([
  'HELP_CENTER_SECTION_COMPANION',
  'SUPPORT_COMPANION_ADDON_TITLE',
  'SUPPORT_COMPANION_ADDON_IMG_ALT',
  'HINT_APP_PURPOSE_DESKTOP_RAM_TITLE'
]);

export const PLAN_A_GUEST_COPY_KEY_PREFIXES = [
  'HELP_CENTER_',
  'HINT_APP_PURPOSE_',
  'PRIVACY_SHEET_',
  'SUPPORT_',
  'CONTENT_UNLOCK_COMPANION_'
];

/** @type {RegExp} */
export const PLAN_A_CONFIDE_TOPIC_RE =
  /confide|倾诉|コンファイド|local ai|本机.*(倾诉|陪伴|模型|生成)|端末内.*(ai|コンパニオン|生成)|companion add-on|ai companion|unlock.*companion|companion.*unlock|向阿寅倾诉|unlock it.*yin/i;

/** @type {RegExp[]} */
export const PLAN_A_SAFE_PHRASES = [
  /not open to guests/i,
  /not open in this release/i,
  /not open yet/i,
  /not available until Confide opens/i,
  /checkout is paused/i,
  /intended path only/i,
  /when Confide opens/i,
  /when it opens/i,
  /尚未对客人开放/,
  /本版本尚未开放/,
  /入口尚未开放/,
  /对客人开放后/,
  /开放后/,
  /新结账现已暂停/,
  /暂停/,
  /预期路径/,
  /ゲストに開いていません/,
  /ゲストに未公開/,
  /この版では未公開/,
  /開いた後/,
  /決済は停止/,
  /将来の経路/,
  /ゲスト向けに開くまで/,
  /not available in this build/i,
  /checkout is not available/i,
  /does not read them aloud in Confide/i,
  /hides the entry by default/i,
  /入口を出しません/,
  /初期状態で入口/
];

/** @type {RegExp[]} */
export const PLAN_A_FORBIDDEN_WITHOUT_SAFE = [
  /after you unlock/i,
  /解锁后.*(倾诉|阿寅|本机|打开)/,
  /解开.*倾诉/,
  /confide with on-device/i,
  /talk with yin locally/i,
  /才能在本机与阿寅倾诉/,
  /話せます/,
  /open confide to yin/i,
  /open confide,/i,
  /打开「向阿寅倾诉」/,
  /unlock companion/i,
  /unlock ai companion/i,
  /解锁 ai 陪伴/i,
  /companion.*immediately/i,
  /立即使用.*倾诉/
];

/**
 * @param {string} key
 * @param {string} text
 */
export function isPlanAGuestCopyKey(key) {
  return PLAN_A_GUEST_COPY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/**
 * @param {string} key
 * @param {string} text
 */
export function isPlanAPrivacyArchivalConfideMention(key, text) {
  if (!key.startsWith('PRIVACY_SHEET_')) return false;
  if (!PLAN_A_CONFIDE_TOPIC_RE.test(text)) return false;
  return !/\b(open|unlock|解锁|解放|现已|available now)\b/i.test(text);
}

/**
 * @param {string} text
 */
export function hasPlanASafePhrase(text) {
  return PLAN_A_SAFE_PHRASES.some((re) => re.test(text));
}

/**
 * @param {string} key
 * @param {string} text
 * @returns {{ ok: boolean, reason?: string }}
 */
export function assessPlanAGuestConfideLine(key, text) {
  const value = String(text ?? '');
  if (PLAN_A_KEY_LABEL_ALLOWLIST.has(key)) {
    return { ok: true };
  }
  if (!isPlanAGuestCopyKey(key)) {
    return { ok: true };
  }
  if (!PLAN_A_CONFIDE_TOPIC_RE.test(value)) {
    return { ok: true };
  }
  if (isPlanAPrivacyArchivalConfideMention(key, value)) {
    return { ok: true };
  }
  if (hasPlanASafePhrase(value)) {
    const forbidden = PLAN_A_FORBIDDEN_WITHOUT_SAFE.find((re) => re.test(value));
    if (forbidden && !hasPlanASafePhrase(value)) {
      return { ok: false, reason: `forbidden phrase: ${forbidden}` };
    }
    return { ok: true };
  }
  const forbidden = PLAN_A_FORBIDDEN_WITHOUT_SAFE.find((re) => re.test(value));
  if (forbidden) {
    return { ok: false, reason: `forbidden without safe caveat: ${forbidden}` };
  }
  return {
    ok: false,
    reason: 'mentions Confide/companion without Plan A closed-to-guests caveat'
  };
}
