/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { isCoPracticeResearchRouteClass } from './coPracticeResearchEnums.js';

/**
 * Functional reply stamps only (DATA_DICTIONARY · co-practice research S0).
 * Duplicated here so upload graph does not import confideRoutes / emotion buckets.
 */
const CONFIDE_GENERATE_REPLY_ROUTE = 'generate';
const CONFIDE_HELP_CENTER_REDIRECT_REPLY_ROUTE = 'help_center_redirect';
const CONFIDE_LANGUAGE_NOT_YET_OPEN_ROUTE = 'language_not_yet_open';
const CONFIDE_FALLBACK_ROUTE = 'fallback';

const QUERY_PRACTICE_DURATION_TOOL = 'query_practice_duration';

/**
 * Map a shown Confide reply stamp to an uploadable route.class (or null).
 * Never reads user text.
 *
 * @param {{ route?: string, source?: string, toolId?: string | null }} shown
 */
export function mapConfideReplyToResearchRouteClass(shown) {
  if (!shown || typeof shown !== 'object') return null;
  const route = typeof shown.route === 'string' ? shown.route : '';
  const source = typeof shown.source === 'string' ? shown.source : '';
  const toolId = typeof shown.toolId === 'string' ? shown.toolId : '';

  if (route === CONFIDE_LANGUAGE_NOT_YET_OPEN_ROUTE) {
    return 'language_not_yet_open';
  }
  if (
    route === CONFIDE_HELP_CENTER_REDIRECT_REPLY_ROUTE ||
    source === CONFIDE_HELP_CENTER_REDIRECT_REPLY_ROUTE ||
    source === 'help_center_redirect'
  ) {
    return 'help_center_redirect';
  }
  if (
    toolId === QUERY_PRACTICE_DURATION_TOOL ||
    source === 'practice_facts' ||
    source === QUERY_PRACTICE_DURATION_TOOL
  ) {
    return 'query_practice_duration';
  }
  if (route === CONFIDE_GENERATE_REPLY_ROUTE || route === CONFIDE_FALLBACK_ROUTE) {
    return null;
  }
  if (isCoPracticeResearchRouteClass(route)) return route;
  return null;
}
