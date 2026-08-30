/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron Checkout must return via `focus-tiger://app` (not Safari loopback).
 * Worker rewrites success/cancel URLs when `returnSurface: desktop` is posted.
 */

import { isDesktopShellRuntime } from './desktopShell.js';

/** @typedef {'desktop'} DesktopCheckoutReturnSurface */

/**
 * @param {Record<string, unknown>} [extra]
 * @returns {Record<string, unknown>}
 */
export function buildCheckoutSessionBody(extra = {}) {
  const body = { ...extra };
  if (isDesktopShellRuntime()) {
    body.returnSurface = 'desktop';
  }
  return body;
}
