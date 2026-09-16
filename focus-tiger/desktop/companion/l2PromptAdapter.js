/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L3 generate prompt prefixes per loaded GGUF family.
 * Qwen3 uses `/no_think`; Gemma4 uses the GGUF chat template (no Qwen token).
 */

import { L0_PROMPT_FAMILY } from './l0Config.js';

/**
 * @param {import('./l0ModelProfiles.js').L0PromptFamily} [family]
 * @returns {string}
 */
export function l3PromptLead(family = L0_PROMPT_FAMILY) {
  return family === 'qwen' ? '/no_think' : '';
}

/**
 * @param {string[]} parts
 * @param {import('./l0ModelProfiles.js').L0PromptFamily} [family]
 * @returns {string}
 */
export function joinL3PromptLines(parts, family = L0_PROMPT_FAMILY) {
  const lead = l3PromptLead(family);
  const rows = parts.filter(Boolean);
  if (!lead) return rows.join('\n');
  if (!rows.length) return lead;
  return `${lead}\n${rows.join('\n')}`;
}
