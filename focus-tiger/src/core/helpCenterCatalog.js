/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * User-facing Help Center manifest (explicit allowlist).
 * SSOT for browsable articles — NOT the Confide retrieval catalog.
 *
 * @see docs/task-briefs/task-user-help-center.md
 * @see docs/product-knowledge-base.md (KB ids for traceability only)
 */

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

/** @type {readonly HelpCenterArticle[]} */
export const HELP_CENTER_ARTICLES = Object.freeze([
  Object.freeze({
    id: 'KB-FUNC-0001',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0001_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0001_BODY',
    kbTraceId: 'KB-FUNC-0001'
  }),
  Object.freeze({
    id: 'KB-FUNC-0004',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0004_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0004_BODY',
    kbTraceId: 'KB-FUNC-0004'
  }),
  Object.freeze({
    id: 'KB-FUNC-0006',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0006_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0006_BODY',
    kbTraceId: 'KB-FUNC-0006'
  }),
  Object.freeze({
    id: 'KB-FUNC-0002',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0002_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0002_BODY',
    kbTraceId: 'KB-FUNC-0002'
  }),
  Object.freeze({
    id: 'KB-FUNC-0020',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0020_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0020_BODY',
    kbTraceId: 'KB-FUNC-0020'
  }),
  Object.freeze({
    id: 'KB-FUNC-0003',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0003_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0003_BODY',
    kbTraceId: 'KB-FUNC-0003'
  }),
  Object.freeze({
    id: 'KB-FUNC-0005',
    sectionId: 'companion',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0005_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0005_BODY',
    kbTraceId: 'KB-FUNC-0005'
  }),
  Object.freeze({
    id: 'KB-EDU-0001',
    sectionId: 'learn',
    titleKey: 'HELP_CENTER_ARTICLE_KB_EDU_0001_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_EDU_0001_BODY',
    kbTraceId: 'KB-EDU-0001'
  }),
  Object.freeze({
    id: 'KB-EDU-0002',
    sectionId: 'learn',
    titleKey: 'HELP_CENTER_ARTICLE_KB_EDU_0002_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_EDU_0002_BODY',
    kbTraceId: 'KB-EDU-0002'
  })
]);

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
