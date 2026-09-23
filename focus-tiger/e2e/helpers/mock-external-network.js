/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/** @typedef {'cloud-api' | 'newsletter' | 'payment' | 'other'} ExternalMockKind */

const CLOUD_HOST_RE =
  /focus-tiger-cloud\.ihiro\.workers\.dev|\/api\/(tip|sanctuary|practice|taste|growth)/i;
const NEWSLETTER_RE = /newsletter|mailchimp|sendgrid|mailgun/i;
const PAYMENT_RE = /stripe\.com|paypal\.com|checkout/i;

/**
 * Stub non-critical third-party traffic so CI network jitter cannot flake DOM tests.
 * Local static server + same-origin assets are always passed through.
 *
 * Tag a spec `@integration` (grep) when it must hit a real backend; skip those in
 * default CI smoke via `--grep-invert @integration`.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ allowCloud?: boolean }} [opts]
 */
export async function installExternalNetworkMocks(page, opts = {}) {
  const allowCloud = opts.allowCloud === true;
  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    const resourceType = req.resourceType();

    if (resourceType === 'document' || resourceType === 'script' || resourceType === 'stylesheet') {
      return route.continue();
    }

    const isLocal =
      /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url) ||
      url.startsWith('data:') ||
      url.startsWith('blob:');
    if (isLocal) return route.continue();

    const kind = classifyExternalUrl(url);
    if (kind === 'cloud-api' && allowCloud) return route.continue();
    if (kind === 'other' && resourceType === 'fetch') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}'
      });
    }
    if (kind !== 'other') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, mocked: true, kind })
      });
    }
    return route.continue();
  });
}

/**
 * @param {string} url
 * @returns {ExternalMockKind}
 */
function classifyExternalUrl(url) {
  if (CLOUD_HOST_RE.test(url)) return 'cloud-api';
  if (NEWSLETTER_RE.test(url)) return 'newsletter';
  if (PAYMENT_RE.test(url)) return 'payment';
  return 'other';
}
