/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A shell that is already showing a page must stay on that page.
 * Cold start still loads once, with the checkout query attached.
 *
 * @param {{ pageUrl?: unknown, isLoading?: unknown, search?: unknown }} input
 * @returns {{ mode: 'in-page' | 'load', search: string }}
 */
export function planDesktopCheckoutReturn(input = {}) {
  const params = new URLSearchParams(String(input.search || '').replace(/^\?/, ''));
  if (!params.has('product')) params.set('product', '1');
  const search = params.toString();
  const url = String(input.pageUrl || '');
  const hasDocument =
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('focus-tiger:');
  if (hasDocument && input.isLoading !== true) {
    return { mode: 'in-page', search };
  }
  return { mode: 'load', search };
}
