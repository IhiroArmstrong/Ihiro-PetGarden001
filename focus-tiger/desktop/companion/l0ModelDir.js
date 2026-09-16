/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Production GGUF cache dir shared by lab probes and Electron L1.
 * Darwin uses `Focus Tiger/companion-l0`, not Electron `userData`
 * (`focus-tiger-desktop`), which would re-download a model already on disk.
 */

import path from 'node:path';

export const L0_DARWIN_APP_SUPPORT_NAME = 'Focus Tiger';
export const L0_MODEL_DIRNAME = 'companion-l0';

/**
 * @param {{
 *   env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
 *   platform?: NodeJS.Platform | string,
 *   homedir?: string,
 *   userDataDir?: string,
 *   desktopRoot?: string
 * }} [opts]
 * @returns {string}
 */
export function resolveCompanionL0ModelDir(opts = {}) {
  const env = opts.env || {};
  const fromEnv = String(
    env.FT_COMPANION_L1_MODEL_DIR || env.FT_COMPANION_L0_MODEL_DIR || ''
  ).trim();
  if (fromEnv) return fromEnv;

  const platform = opts.platform || '';
  const homedir = String(opts.homedir || '').trim();
  if (platform === 'darwin' && homedir) {
    return path.join(
      homedir,
      'Library',
      'Application Support',
      L0_DARWIN_APP_SUPPORT_NAME,
      L0_MODEL_DIRNAME
    );
  }

  const userDataDir = String(opts.userDataDir || '').trim();
  if (userDataDir) return path.join(userDataDir, L0_MODEL_DIRNAME);

  const desktopRoot = String(opts.desktopRoot || '').trim();
  if (desktopRoot) return path.join(desktopRoot, '.l0-cache');
  return path.join('.', '.l0-cache');
}
