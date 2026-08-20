/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { L2_MAX_REPLY_CHARS } from './l2Persona.js';

const BANNED = [
  /you should/i,
  /try (to )?breathe/i,
  /\bdiagnos/i,
  /here('s| is) (a |the )?list/i,
  /as an ai/i,
  /你应该/,
  /深呼吸/,
  /诊断/,
  /呼吸练习/,
  /すべき/
];

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function sanitizeCompanionL2Reply(raw) {
  let text = String(raw || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\/?think>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  if (text.length > L2_MAX_REPLY_CHARS) {
    text = text.slice(0, L2_MAX_REPLY_CHARS).replace(/\s+\S*$/, '').trim();
  }
  if (!text) return null;
  if (BANNED.some((re) => re.test(text))) return null;
  return text;
}
