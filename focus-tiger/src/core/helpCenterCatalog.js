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
  Object.freeze({ id: 'start', labelKey: 'help_center.section.start' }),
  Object.freeze({ id: 'practice', labelKey: 'help_center.section.practice' }),
  Object.freeze({ id: 'data', labelKey: 'help_center.section.data' }),
  Object.freeze({ id: 'companion', labelKey: 'help_center.section.companion' }),
  Object.freeze({ id: 'learn', labelKey: 'help_center.section.learn' })
]);

/** @type {readonly HelpCenterArticle[]} */
export const HELP_CENTER_ARTICLES = Object.freeze([
  Object.freeze({
    id: 'KB-FUNC-0001',
    sectionId: 'start',
    titleKey: 'help_center.article.kb_func_0001.title',
    bodyKey: 'help_center.article.kb_func_0001.body',
    kbTraceId: 'KB-FUNC-0001'
  }),
  Object.freeze({
    id: 'KB-FUNC-0004',
    sectionId: 'start',
    titleKey: 'help_center.article.kb_func_0004.title',
    bodyKey: 'help_center.article.kb_func_0004.body',
    kbTraceId: 'KB-FUNC-0004'
  }),
  Object.freeze({
    id: 'KB-FUNC-0006',
    sectionId: 'practice',
    titleKey: 'help_center.article.kb_func_0006.title',
    bodyKey: 'help_center.article.kb_func_0006.body',
    kbTraceId: 'KB-FUNC-0006'
  }),
  Object.freeze({
    id: 'KB-FUNC-0002',
    sectionId: 'practice',
    titleKey: 'help_center.article.kb_func_0002.title',
    bodyKey: 'help_center.article.kb_func_0002.body',
    kbTraceId: 'KB-FUNC-0002'
  }),
  Object.freeze({
    id: 'KB-FUNC-0020',
    sectionId: 'practice',
    titleKey: 'help_center.article.kb_func_0020.title',
    bodyKey: 'help_center.article.kb_func_0020.body',
    kbTraceId: 'KB-FUNC-0020'
  }),
  Object.freeze({
    id: 'KB-FUNC-0003',
    sectionId: 'data',
    titleKey: 'help_center.article.kb_func_0003.title',
    bodyKey: 'help_center.article.kb_func_0003.body',
    kbTraceId: 'KB-FUNC-0003'
  }),
  Object.freeze({
    id: 'KB-FUNC-0005',
    sectionId: 'companion',
    titleKey: 'help_center.article.kb_func_0005.title',
    bodyKey: 'help_center.article.kb_func_0005.body',
    kbTraceId: 'KB-FUNC-0005'
  }),
  Object.freeze({
    id: 'KB-EDU-0001',
    sectionId: 'learn',
    titleKey: 'help_center.article.kb_edu_0001.title',
    bodyKey: 'help_center.article.kb_edu_0001.body',
    kbTraceId: 'KB-EDU-0001'
  }),
  Object.freeze({
    id: 'KB-EDU-0002',
    sectionId: 'learn',
    titleKey: 'help_center.article.kb_edu_0002.title',
    bodyKey: 'help_center.article.kb_edu_0002.body',
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
