/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Merge per-feature locale slices onto the frozen en/zh/ja bases.
 * Two slices must not own the same key. A slice may override a base key.
 */

export const SLICE_LOCALES = Object.freeze(['en', 'zh', 'ja']);
export const SLICE_KEY_RE = /^[A-Z][A-Z0-9_]*$/;

/**
 * @param {string} filename
 * @param {unknown} data
 * @returns {{ errors: string[], keys: string[] }}
 */
export function validateLocaleSlice(filename, data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { errors: [`${filename}: 须是含 en、zh、ja 的对象`], keys: [] };
  }
  /** @type {Record<string, Record<string, string>>} */
  const bags = {};
  for (const locale of SLICE_LOCALES) {
    const bag = /** @type {Record<string, unknown>} */ (data)[locale];
    if (!bag || typeof bag !== 'object' || Array.isArray(bag)) {
      errors.push(`${filename}: 缺少 ${locale} 对象`);
      bags[locale] = {};
      continue;
    }
    /** @type {Record<string, string>} */
    const clean = {};
    for (const [key, value] of Object.entries(bag)) {
      if (!SLICE_KEY_RE.test(key)) {
        errors.push(`${filename}: 键 ${key} 须为大写蛇形`);
        continue;
      }
      if (typeof value !== 'string' || value.length === 0) {
        errors.push(`${filename}: ${locale}.${key} 须为非空字符串`);
        continue;
      }
      clean[key] = value;
    }
    bags[locale] = clean;
  }
  const enKeys = Object.keys(bags.en).sort();
  for (const locale of ['zh', 'ja']) {
    const keys = Object.keys(bags[locale]).sort();
    if (keys.join('\n') !== enKeys.join('\n')) {
      errors.push(`${filename}: ${locale} 的键必须和 en 一致`);
    }
  }
  return { errors, keys: enKeys };
}

/**
 * @param {Record<string, Record<string, string>>} bases
 * @param {{ filename: string, data: unknown }[]} slices
 * @returns {{ dictionaries: Record<string, Record<string, string>>, errors: string[] }}
 */
export function mergeLocalePack(bases, slices) {
  const errors = [];
  /** @type {Map<string, string>} */
  const owners = new Map();
  const ordered = [...slices].sort((a, b) =>
    a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0
  );
  /** @type {{ filename: string, data: Record<string, Record<string, string>> }[]} */
  const ready = [];
  for (const slice of ordered) {
    const result = validateLocaleSlice(slice.filename, slice.data);
    errors.push(...result.errors);
    for (const key of result.keys) {
      const prior = owners.get(key);
      if (prior) {
        errors.push(`${key} 同时写在 ${prior} 和 ${slice.filename}`);
      } else {
        owners.set(key, slice.filename);
      }
    }
    if (result.errors.length === 0 && slice.data && typeof slice.data === 'object') {
      ready.push({
        filename: slice.filename,
        data: /** @type {Record<string, Record<string, string>>} */ (slice.data)
      });
    }
  }
  /** @type {Record<string, Record<string, string>>} */
  const dictionaries = {};
  for (const locale of SLICE_LOCALES) {
    dictionaries[locale] = { ...(bases[locale] || {}) };
  }
  for (const slice of ready) {
    for (const locale of SLICE_LOCALES) {
      Object.assign(dictionaries[locale], slice.data[locale]);
    }
  }
  return { dictionaries, errors };
}

export const LOCALE_HOTSPOTS = Object.freeze([
  'focus-tiger/src/locales/en.json',
  'focus-tiger/src/locales/zh.json',
  'focus-tiger/src/locales/ja.json'
]);

/**
 * @param {string[]} paths
 * @returns {string | null}
 */
export function localeHotspotError(paths) {
  const hit = paths.filter((path) => LOCALE_HOTSPOTS.includes(path));
  if (hit.length === 0) return null;
  return `不要改 ${hit.join('、')}。新文案写 focus-tiger/src/locales/slices/<name>.json`;
}
