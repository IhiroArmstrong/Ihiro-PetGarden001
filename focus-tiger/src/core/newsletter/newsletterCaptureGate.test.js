import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  NEWSLETTER_CAPTURE_STORAGE_KEY,
  clearNewsletterCaptureState,
  hasSubmittedNewsletter,
  isPlausibleNewsletterEmail,
  markNewsletterSubmitted,
  normalizeNewsletterCaptureState,
  readNewsletterCaptureState
} from './newsletterCaptureGate.js';
import { createMockNewsletterProvider } from './mockNewsletterProvider.js';
import {
  getNewsletterProvider,
  setNewsletterProvider
} from './newsletterProvider.js';

function memoryStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
    removeItem: (k) => {
      delete map[k];
    }
  };
}

describe('newsletterCaptureGate', () => {
  it('normalize defaults and reads submitted flag only', () => {
    assert.deepEqual(normalizeNewsletterCaptureState(null), {
      submitted: false
    });
    assert.deepEqual(
      normalizeNewsletterCaptureState({
        submitted: true,
        email: 'secret@example.com'
      }),
      { submitted: true }
    );
  });

  it('mark submitted never persists email', () => {
    const storage = memoryStorage();
    markNewsletterSubmitted(storage);
    const raw = JSON.parse(storage.getItem(NEWSLETTER_CAPTURE_STORAGE_KEY));
    assert.equal(raw.submitted, true);
    assert.equal('email' in raw, false);
    assert.equal(hasSubmittedNewsletter({ storage }), true);
    clearNewsletterCaptureState(storage);
    assert.equal(readNewsletterCaptureState(storage).submitted, false);
  });

  it('isPlausibleNewsletterEmail rejects junk', () => {
    assert.equal(isPlausibleNewsletterEmail('a@b.co'), true);
    assert.equal(isPlausibleNewsletterEmail('not-an-email'), false);
    assert.equal(isPlausibleNewsletterEmail('a@b'), false);
    assert.equal(isPlausibleNewsletterEmail(''), false);
  });
});

describe('mockNewsletterProvider', () => {
  it('succeeds for plausible email', async () => {
    const provider = createMockNewsletterProvider({ delayMs: 0 });
    const ok = await provider.subscribe('friend@example.com');
    assert.deepEqual(ok, { ok: true });
  });

  it('fails when configured to fail', async () => {
    const provider = createMockNewsletterProvider({ delayMs: 0, fail: true });
    const bad = await provider.subscribe('friend@example.com');
    assert.equal(bad.ok, false);
  });
});

describe('newsletterProvider registry', () => {
  it('set/get active provider', () => {
    const prev = getNewsletterProvider();
    const mock = createMockNewsletterProvider({ delayMs: 0 });
    setNewsletterProvider(mock);
    assert.equal(getNewsletterProvider(), mock);
    setNewsletterProvider(prev);
  });
});

describe('zero coupling', () => {
  it('newsletter modules must not import tip/sanctuary/entitlement gates', async () => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const dir = dirname(fileURLToPath(import.meta.url));
    for (const name of [
      'newsletterCaptureGate.js',
      'newsletterProvider.js',
      'mockNewsletterProvider.js',
      'workerNewsletterProvider.js'
    ]) {
      const src = await readFile(join(dir, name), 'utf8');
      assert.equal(/from\s+['"].*tipJarGate/.test(src), false, name);
      assert.equal(/from\s+['"].*sanctuaryEntitlementGate/.test(src), false, name);
      assert.equal(/from\s+['"].*entitlementGate/.test(src), false, name);
    }
  });
});
