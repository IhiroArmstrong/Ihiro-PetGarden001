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
    id: 'KB-FUNC-0007',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0007_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0007_BODY',
    kbTraceId: 'KB-FUNC-0007'
  }),
  Object.freeze({
    id: 'KB-FUNC-0008',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0008_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0008_BODY',
    kbTraceId: 'KB-FUNC-0008'
  }),
  Object.freeze({
    id: 'KB-FUNC-0011',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0011_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0011_BODY',
    kbTraceId: 'KB-FUNC-0011'
  }),
  Object.freeze({
    id: 'KB-FUNC-0029',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0029_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0029_BODY',
    kbTraceId: 'KB-FUNC-0029'
  }),
  Object.freeze({
    id: 'KB-FUNC-0030',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0030_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0030_BODY',
    kbTraceId: 'KB-FUNC-0030'
  }),
  Object.freeze({
    id: 'KB-FUNC-0031',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0031_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0031_BODY',
    kbTraceId: 'KB-FUNC-0031'
  }),
  Object.freeze({
    id: 'KB-FUNC-0032',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0032_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0032_BODY',
    kbTraceId: 'KB-FUNC-0032'
  }),
  Object.freeze({
    id: 'KB-FUNC-0034',
    sectionId: 'start',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0034_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0034_BODY',
    kbTraceId: 'KB-FUNC-0034'
  }),
  Object.freeze({
    id: 'KB-FUNC-0002',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0002_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0002_BODY',
    kbTraceId: 'KB-FUNC-0002'
  }),
  Object.freeze({
    id: 'KB-FUNC-0006',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0006_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0006_BODY',
    kbTraceId: 'KB-FUNC-0006'
  }),
  Object.freeze({
    id: 'KB-FUNC-0013',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0013_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0013_BODY',
    kbTraceId: 'KB-FUNC-0013'
  }),
  Object.freeze({
    id: 'KB-FUNC-0019',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0019_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0019_BODY',
    kbTraceId: 'KB-FUNC-0019'
  }),
  Object.freeze({
    id: 'KB-FUNC-0020',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0020_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0020_BODY',
    kbTraceId: 'KB-FUNC-0020'
  }),
  Object.freeze({
    id: 'KB-FUNC-0021',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0021_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0021_BODY',
    kbTraceId: 'KB-FUNC-0021'
  }),
  Object.freeze({
    id: 'KB-FUNC-0022',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0022_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0022_BODY',
    kbTraceId: 'KB-FUNC-0022'
  }),
  Object.freeze({
    id: 'KB-FUNC-0023',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0023_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0023_BODY',
    kbTraceId: 'KB-FUNC-0023'
  }),
  Object.freeze({
    id: 'KB-FUNC-0024',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0024_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0024_BODY',
    kbTraceId: 'KB-FUNC-0024'
  }),
  Object.freeze({
    id: 'KB-FUNC-0025',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0025_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0025_BODY',
    kbTraceId: 'KB-FUNC-0025'
  }),
  Object.freeze({
    id: 'KB-FUNC-0026',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0026_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0026_BODY',
    kbTraceId: 'KB-FUNC-0026'
  }),
  Object.freeze({
    id: 'KB-FUNC-0027',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0027_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0027_BODY',
    kbTraceId: 'KB-FUNC-0027'
  }),
  Object.freeze({
    id: 'KB-FUNC-0028',
    sectionId: 'practice',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0028_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0028_BODY',
    kbTraceId: 'KB-FUNC-0028'
  }),
  Object.freeze({
    id: 'KB-FUNC-0003',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0003_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0003_BODY',
    kbTraceId: 'KB-FUNC-0003'
  }),
  Object.freeze({
    id: 'KB-FUNC-0012',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0012_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0012_BODY',
    kbTraceId: 'KB-FUNC-0012'
  }),
  Object.freeze({
    id: 'KB-FUNC-0015',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0015_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0015_BODY',
    kbTraceId: 'KB-FUNC-0015'
  }),
  Object.freeze({
    id: 'KB-FUNC-0018',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0018_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0018_BODY',
    kbTraceId: 'KB-FUNC-0018'
  }),
  Object.freeze({
    id: 'KB-FUNC-0033',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0033_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0033_BODY',
    kbTraceId: 'KB-FUNC-0033'
  }),
  Object.freeze({
    id: 'KB-FUNC-0035',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0035_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0035_BODY',
    kbTraceId: 'KB-FUNC-0035'
  }),
  Object.freeze({
    id: 'KB-FUNC-0036',
    sectionId: 'data',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0036_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0036_BODY',
    kbTraceId: 'KB-FUNC-0036'
  }),
  Object.freeze({
    id: 'KB-FUNC-0005',
    sectionId: 'companion',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0005_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0005_BODY',
    kbTraceId: 'KB-FUNC-0005'
  }),
  Object.freeze({
    id: 'KB-FUNC-0010',
    sectionId: 'companion',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0010_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0010_BODY',
    kbTraceId: 'KB-FUNC-0010'
  }),
  Object.freeze({
    id: 'KB-FUNC-0014',
    sectionId: 'companion',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0014_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0014_BODY',
    kbTraceId: 'KB-FUNC-0014'
  }),
  Object.freeze({
    id: 'KB-FUNC-0016',
    sectionId: 'companion',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0016_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0016_BODY',
    kbTraceId: 'KB-FUNC-0016'
  }),
  Object.freeze({
    id: 'KB-FUNC-0017',
    sectionId: 'companion',
    titleKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0017_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_FUNC_0017_BODY',
    kbTraceId: 'KB-FUNC-0017'
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
  }),
  Object.freeze({
    id: 'KB-EDU-0003',
    sectionId: 'learn',
    titleKey: 'HELP_CENTER_ARTICLE_KB_EDU_0003_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_EDU_0003_BODY',
    kbTraceId: 'KB-EDU-0003'
  }),
  Object.freeze({
    id: 'KB-EDU-0004',
    sectionId: 'learn',
    titleKey: 'HELP_CENTER_ARTICLE_KB_EDU_0004_TITLE',
    bodyKey: 'HELP_CENTER_ARTICLE_KB_EDU_0004_BODY',
    kbTraceId: 'KB-EDU-0004'
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
