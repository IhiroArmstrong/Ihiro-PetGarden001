/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  CONFIDE_GENERATE_REPLY_ROUTE,
  CONFIDE_HELP_CENTER_REDIRECT_REPLY_ROUTE,
  CONFIDE_ROUTE
} from './confide/confideRoutes.js';
import { isCoPracticeResearchRouteClass } from './coPracticeResearchEnums.js';

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

  if (route === CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN) {
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
  if (route === CONFIDE_GENERATE_REPLY_ROUTE || route === CONFIDE_ROUTE.FALLBACK) {
    return null;
  }
  if (isCoPracticeResearchRouteClass(route)) return route;
  return null;
}
