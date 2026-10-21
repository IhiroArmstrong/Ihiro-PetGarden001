/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { CONFIDE_ROUTE } from './confide/confideRoutes.js';

/**
 * Sprite emotion key after a confide reply is fully shown (and TTS finished when used).
 *
 * @param {{ route?: string }} ctx
 * @returns {'nodBow' | 'mindfulAcknowledge' | null}
 */
export function confideReplyAckEmotionKey({ route } = {}) {
  const id = String(route || '');
  if (id === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) return null;
  if (id === CONFIDE_ROUTE.SAFETY_REDIRECT) return 'nodBow';
  return 'mindfulAcknowledge';
}
