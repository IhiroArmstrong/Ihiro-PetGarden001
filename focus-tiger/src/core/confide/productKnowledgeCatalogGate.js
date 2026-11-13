/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Per-entry export fields for the product-knowledge catalog.
 * Help Center visibility and Confide retrieval are independent exits
 * from one fact file.
 */

/** Live Help Center ids that predate KB-FUNC-* / KB-EDU-* (no new HELP-* ids). */
export const GRANDFATHERED_HELP_CENTER_IDS = Object.freeze([
  'HELP-BREATH-DURATION',
  'HELP-LOTUS-BLOOMS',
  'HELP-BUY-COLLECTIONS',
  'HELP-BADGE-NOT-COIN',
  'HELP-DEVICES-SAFARI',
  'HELP-APPLE-HEALTH-LOG'
]);

export const HELP_ONLY_BACKFILL_IDS = Object.freeze([
  'KB-FUNC-0006',
  'HELP-DEVICES-SAFARI',
  'HELP-APPLE-HEALTH-LOG',
  'KB-FUNC-0040',
  'KB-FUNC-0041'
]);

const HELP_SECTIONS = new Set(['start', 'practice', 'data', 'companion', 'learn']);

/**
 * @param {string} id
 * @returns {boolean}
 */
export function isGrandfatheredHelpCenterId(id) {
  return GRANDFATHERED_HELP_CENTER_IDS.includes(id);
}

/**
 * @param {string} id
 * @returns {boolean}
 */
export function isAllowedCatalogId(id) {
  const raw = String(id || '');
  if (raw.startsWith('KB-PSY-DRAFT-')) return false;
  if (raw.startsWith('KB-FUNC-') || raw.startsWith('KB-EDU-')) return true;
  return isGrandfatheredHelpCenterId(raw);
}

/**
 * @param {{ yinMayRetrieve?: unknown, helpCenterVisible?: unknown }} entry
 * @returns {boolean}
 */
export function isYinRetrievableCatalogEntry(entry) {
  return entry?.yinMayRetrieve === true;
}

/**
 * @param {{ helpCenterVisible?: unknown }} entry
 * @returns {boolean}
 */
export function isHelpCenterVisibleCatalogEntry(entry) {
  return entry?.helpCenterVisible === true;
}

/**
 * @param {object} entry
 * @returns {string | null} error message
 */
export function catalogEntryExportError(entry) {
  if (!entry || typeof entry !== 'object') return 'entry must be an object';
  if (!isAllowedCatalogId(entry.id)) {
    return `${entry.id}: id must be KB-FUNC-* / KB-EDU-* (or a grandfathered HELP-* id)`;
  }
  if (typeof entry.yinMayRetrieve !== 'boolean') {
    return `${entry.id}: yinMayRetrieve must be boolean`;
  }
  if (typeof entry.helpCenterVisible !== 'boolean') {
    return `${entry.id}: helpCenterVisible must be boolean`;
  }
  if (entry.yinMayRetrieve === true && entry.helpCenterVisible === false) {
    return `${entry.id}: yinMayRetrieve true with helpCenterVisible false is forbidden`;
  }
  if (entry.yinMayRetrieve === false && entry.helpCenterVisible === false) {
    return `${entry.id}: both export flags false must not be in the catalog file`;
  }
  if (typeof entry.shortAnswerEn !== 'string' || !entry.shortAnswerEn.trim()) {
    return `${entry.id}: shortAnswerEn required`;
  }
  if (entry.helpCenterVisible === true) {
    if (!HELP_SECTIONS.has(entry.helpSectionId)) {
      return `${entry.id}: helpSectionId required for help-visible rows`;
    }
    if (!Number.isFinite(entry.helpCenterOrder)) {
      return `${entry.id}: helpCenterOrder required for help-visible rows`;
    }
  }
  return null;
}

/**
 * @param {{ entries?: object[] }} catalog
 * @returns {object[]}
 */
export function listYinRetrievableCatalogEntries(catalog) {
  return (catalog?.entries || []).filter(isYinRetrievableCatalogEntry);
}

/**
 * @param {{ entries?: object[] }} catalog
 * @returns {object[]}
 */
export function listHelpCenterVisibleCatalogEntries(catalog) {
  return (catalog?.entries || [])
    .filter(isHelpCenterVisibleCatalogEntry)
    .slice()
    .sort((a, b) => (a.helpCenterOrder ?? 0) - (b.helpCenterOrder ?? 0));
}

/**
 * Locale key stem for a catalog / Help Center article id.
 * @param {string} id
 * @returns {string}
 */
export function helpCenterLocaleStem(id) {
  return `HELP_CENTER_ARTICLE_${String(id || '').replaceAll('-', '_')}`;
}
