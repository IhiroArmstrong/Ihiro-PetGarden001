/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * User-facing Help Center manifest — generated from catalog
 * `helpCenterVisible` rows. Fact sentences live in
 * `productKnowledgeCatalog.json`.
 *
 * @see docs/task-briefs/task-kb-help-single-source.md
 * @see docs/task-briefs/task-user-help-center.md
 */

import catalog from './confide/productKnowledgeCatalog.json' with { type: 'json' };
import {
  helpCenterLocaleStem,
  listHelpCenterVisibleCatalogEntries
} from './confide/productKnowledgeCatalogGate.js';

/**
 * @typedef {object} HelpCenterSection
 * @property {string} id
 * @property {string} labelKey
 */

/**
 * @typedef {object} HelpCenterArticle
 * @property {string} id Stable slug (often matches KB id)
 * @property {string} sectionId
 * @property {string} titleKey
 * @property {string} bodyKey
 * @property {string} [kbTraceId] Optional KB-FUNC / KB-EDU id for docs sync
 */

/** @type {readonly HelpCenterSection[]} */
export const HELP_CENTER_SECTIONS = Object.freeze([
  Object.freeze({ id: 'start', labelKey: 'HELP_CENTER_SECTION_START' }),
  Object.freeze({ id: 'practice', labelKey: 'HELP_CENTER_SECTION_PRACTICE' }),
  Object.freeze({ id: 'data', labelKey: 'HELP_CENTER_SECTION_DATA' }),
  Object.freeze({ id: 'companion', labelKey: 'HELP_CENTER_SECTION_COMPANION' }),
  Object.freeze({ id: 'learn', labelKey: 'HELP_CENTER_SECTION_LEARN' })
]);

/**
 * @param {object} entry
 * @returns {HelpCenterArticle}
 */
function articleFromCatalogEntry(entry) {
  const stem = helpCenterLocaleStem(entry.id);
  /** @type {HelpCenterArticle} */
  const row = {
    id: entry.id,
    sectionId: entry.helpSectionId,
    titleKey: `${stem}_TITLE`,
    bodyKey: `${stem}_BODY`
  };
  if (String(entry.id).startsWith('KB-')) {
    row.kbTraceId = entry.id;
  }
  return Object.freeze(row);
}

/** @type {readonly HelpCenterArticle[]} */
export const HELP_CENTER_ARTICLES = Object.freeze(
  listHelpCenterVisibleCatalogEntries(catalog).map(articleFromCatalogEntry)
);

/**
 * Help article count must equal catalog `helpCenterVisible: true` rows.
 * @returns {{ articleCount: number, helpVisibleCount: number, delta: number }}
 */
export function reconcileHelpCenterArticleCount() {
  const helpVisibleCount = listHelpCenterVisibleCatalogEntries(catalog).length;
  const articleCount = HELP_CENTER_ARTICLES.length;
  return {
    articleCount,
    helpVisibleCount,
    delta: articleCount - helpVisibleCount
  };
}

/**
 * @param {string} sectionId
 * @returns {readonly HelpCenterArticle[]}
 */
export function listHelpCenterArticlesForSection(sectionId) {
  return HELP_CENTER_ARTICLES.filter((row) => row.sectionId === sectionId);
}

/**
 * @param {string} articleId
 * @returns {HelpCenterArticle | null}
 */
export function findHelpCenterArticle(articleId) {
  return HELP_CENTER_ARTICLES.find((row) => row.id === articleId) ?? null;
}
