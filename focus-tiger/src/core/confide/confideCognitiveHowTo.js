/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T30 · CR-47 how-to tighten.
 * Closed set of *shapes* (cognitive verbs after how-to), not topics.
 * `understand` / `know` are not click / open / set / buy / back up.
 */

import { normalizeConfideIntentText } from './confideBoundaryRespect.js';

/**
 * How-to whose first verb is cognitive. Not an app operation.
 * Locator / control verbs after that verb keep the product path
 * (`how do I know where the backup is`).
 */
const COGNITIVE_HOW_TO_RE =
  /\bhow\s+(?:do(?:\s+i)?|can(?:\s+i)?|to)\s+(?:to\s+)?(?:understand|know|comprehend|grasp|learn(?:\s+about)?|realize)\b/i;

const AFTER_COGNITIVE_STILL_OPERATIONAL_RE =
  /\b(?:where|which|button|menu|drawer|click|open|set|buy|turn|find|backup|export|restore|enable|disable|reminder)\b|\bback\s+up\b/i;

const COGNITIVE_HOW_TO_ZH_RE = /怎么(?:理解|知道|认识)|如何(?:理解|知道|认识)/;

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideCognitiveHowToShape(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  const spaced = raw.replace(/\s+/g, ' ').trim();
  if (COGNITIVE_HOW_TO_ZH_RE.test(spaced)) {
    return !AFTER_COGNITIVE_STILL_OPERATIONAL_RE.test(spaced);
  }
  if (!COGNITIVE_HOW_TO_RE.test(spaced)) return false;
  const after = spaced.replace(COGNITIVE_HOW_TO_RE, ' ');
  return !AFTER_COGNITIVE_STILL_OPERATIONAL_RE.test(after);
}
