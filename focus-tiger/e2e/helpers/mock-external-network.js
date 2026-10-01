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
 * Matches only non-loopback http(s) URLs.
 * Local documents, scripts, images, and audio must not enter `page.route`,
 * or Playwright proxies every sprite/audio byte and the next navigation stalls.
 */
const EXTERNAL_HTTP_RE =
  /^https?:\/\/(?!(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$))/i;

/**
 * @param {string} url
 * @returns {boolean}
 */
export function shouldMockExternalUrl(url) {
  return EXTERNAL_HTTP_RE.test(url);
}

/**
 * Local ambient tracks are tens of megabytes. Chromium keeps that download
 * on the only sockets to :5199, so the next visibility `page.goto` waits
 * until the 40s navigation timeout. Images and scripts stay on the static server.
 */
const HEAVY_LOCAL_MEDIA_RE =
  /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/[^?#]*\.(?:mp3|m4a|ogg|wav|mp4|webm)(?:[?#]|$)/i;

/** 44-byte silent wav. Enough for a media element; not a product asset. */
const SILENT_WAV = Buffer.from(
  'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  'base64'
);

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isHeavyLocalMediaUrl(url) {
  return HEAVY_LOCAL_MEDIA_RE.test(String(url));
}

/**
 * Fulfill local audio/video inside Playwright so visibility never pulls
 * the ambient library. Other specs keep the real files.
 * @param {import('@playwright/test').Page} page
 */
export async function installHeavyLocalMediaStubs(page) {
  await page.route(HEAVY_LOCAL_MEDIA_RE, async (route) => {
    const url = route.request().url();
    if (!isHeavyLocalMediaUrl(url)) return route.continue();
    const video = /\.(?:mp4|webm)(?:[?#]|$)/i.test(url);
    return route.fulfill({
      status: 200,
      contentType: video ? 'video/webm' : 'audio/wav',
      body: video ? Buffer.alloc(0) : SILENT_WAV
    });
  });
}

/**
 * Stub non-critical third-party traffic so CI network jitter cannot flake DOM tests.
 * Same-origin assets are not routed; they go straight to the static server.
 *
 * Tag a spec `@integration` (grep) when it must hit a real backend; skip those in
 * default CI smoke via `--grep-invert @integration`.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ allowCloud?: boolean }} [opts]
 */
export async function installExternalNetworkMocks(page, opts = {}) {
  const allowCloud = opts.allowCloud === true;
  await page.route(EXTERNAL_HTTP_RE, async (route) => {
    const req = route.request();
    const url = req.url();
    if (!shouldMockExternalUrl(url)) return route.continue();

    const resourceType = req.resourceType();
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
