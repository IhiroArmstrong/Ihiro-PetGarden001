/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Locale-agnostic chitchat lab helpers (re-export + path resolver).
 */

export {
  JA_CHITCHAT_LAB_ROOT as CHITCHAT_LAB_ROOT,
  JA_CHITCHAT_LOCALE,
  appendJaChitchatTurn as appendChitchatTurn,
  buildChitchatProbeRow,
  buildJaChitchatProbeRow,
  errorMessage,
  historySourceFromDataSource,
  processChitchatSend,
  processJaChitchatSend,
  resolveChitchatHit,
  resolveChitchatLabRoute,
  resolveJaChitchatHit,
  resolveJaChitchatLabRoute,
  resolveJaChitchatRepeatCount,
  resolveJaChitchatRunCount,
  runChitchatL2Generate
} from './l0-ja-chitchat-probe-shared.js';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { L0_MODEL_FILENAME } from '../companion/l0Config.js';

const defaultGguf = path.join(
  os.homedir(),
  'Library/Application Support/Focus Tiger/companion-l0',
  L0_MODEL_FILENAME
);

const UNSLOTH_GEMMA4_DEFAULT = path.join(
  '/tmp/ft-l0-lab',
  'Gemma-4-E4B-it-UD-Q4_K_XL-unsloth.gguf'
);

/**
 * @returns {string | null}
 */
export function resolveChitchatModelPath() {
  const fromEnv = process.env.FT_CHITCHAT_GGUF || process.env.FT_TOOL_CALL_GGUF;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  if (fs.existsSync(defaultGguf)) return defaultGguf;
  return null;
}

/**
 * @param {'jc' | 'un'} source
 * @returns {string | null}
 */
export function resolveGemma4QuantModelPath(source) {
  if (source === 'un') {
    const fromEnv = process.env.FT_GEMMA4_UNSLOTH_GGUF;
    if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
    if (fs.existsSync(UNSLOTH_GEMMA4_DEFAULT)) return UNSLOTH_GEMMA4_DEFAULT;
    return null;
  }
  const jcEnv = process.env.FT_GEMMA4_JC_GGUF;
  if (jcEnv && fs.existsSync(jcEnv)) return jcEnv;
  if (fs.existsSync(defaultGguf)) return defaultGguf;
  return null;
}
