/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A13 glass-card e2e: assert visibility from product gates, not a hard-coded
 * “this card must exist” list.
 */

import {
  CONFIDE_USER_MOUNT_ENABLED,
  isConfideDevHarness,
  isConfideLocaleAllowed
} from './confide/confideUserVisibilityGate.js'

/**
 * @param {import('./glassCardVisualSurfaces.js').A13GlassVisualSurface | null | undefined} surface
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {boolean} [opts.mountEnabled]
 * @param {string} [opts.locale]
 * @returns {boolean}
 */
export function shouldAssertA13SurfaceVisible(
  surface,
  {
    search = '',
    mountEnabled = CONFIDE_USER_MOUNT_ENABLED,
    locale = 'en'
  } = {}
) {
  if (!surface || surface.visibilityDependsOn !== 'confide-user-or-harness') {
    return true
  }
  const harnessSearch =
    surface.shellQuery && surface.shellQuery.confide === '1'
      ? 'confide=1'
      : search
  if (!isConfideLocaleAllowed(locale)) return false
  return mountEnabled === true || isConfideDevHarness(harnessSearch)
}
