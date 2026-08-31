/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { L2_MAX_REPLY_CHARS } from './l2Persona.js';

/** One-word model misfires (e.g. Qwen acknowledging a prompt) — fall back to corpus. */
const TRIVIAL_ONLY_REPLIES = /^(?:yes|no|ok|okay|sure|yep|nope|是|嗯|好|对)\.?$/iu;

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
  if (TRIVIAL_ONLY_REPLIES.test(text)) return null;
  if (BANNED.some((re) => re.test(text))) return null;
  return text;
}
