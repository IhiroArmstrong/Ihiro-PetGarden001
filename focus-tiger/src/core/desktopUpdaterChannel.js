/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Desktop self-hosted updater channel gate (compile-time / env).
 * Only `direct` enables electron-updater; Setapp / MAS must compile it off.
 */

/** @typedef {'direct' | 'setapp' | 'mas'} DesktopUpdateChannel */

/**
 * @param {Record<string, string | undefined>} [env]
 * @returns {DesktopUpdateChannel}
 */
export function resolveUpdateChannel(env = {}) {
  const raw = String(env.FT_UPDATE_CHANNEL || 'direct').trim().toLowerCase();
  if (raw === 'setapp' || raw === 'mas') return raw;
  return 'direct';
}

/**
 * @param {DesktopUpdateChannel | string} channel
 * @returns {boolean}
 */
export function isSelfHostedUpdaterEnabled(channel) {
  return channel === 'direct';
}
