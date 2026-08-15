import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createWorkerNewsletterProvider } from './workerNewsletterProvider.js';

describe('createWorkerNewsletterProvider', () => {
  it('posts email + locale and maps ok', async () => {
    /** @type {{ path: string, init: RequestInit }[]} */
    const calls = [];
    const provider = createWorkerNewsletterProvider({
      getApiBaseUrl: () => 'https://focus-tiger-cloud.ihiro.workers.dev',
      getLocaleFn: () => 'ja',
      postJson: async (path, init) => {
        calls.push({ path, init });
        return { ok: true };
      }
    });
    const result = await provider.subscribe('Friend@Example.com', {
      locale: 'en'
    });
    assert.deepEqual(result, { ok: true });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, '/api/newsletter/subscribe');
    assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
      email: 'Friend@Example.com',
      locale: 'en'
    });
  });

  it('falls back to i18n locale and maps 400 / unconfigured', async () => {
    const provider = createWorkerNewsletterProvider({
      getApiBaseUrl: () => '',
      postJson: async () => {
        throw new Error('should not fetch');
      }
    });
    assert.deepEqual(await provider.subscribe('a@b.co'), {
      ok: false,
      error: 'unconfigured'
    });

    const failing = createWorkerNewsletterProvider({
      getApiBaseUrl: () => 'http://127.0.0.1:8787',
      getLocaleFn: () => 'zh',
      postJson: async () => {
        const err = new Error('email looks invalid');
        /** @type {any} */ (err).status = 400;
        throw err;
      }
    });
    assert.deepEqual(await failing.subscribe('nope'), {
      ok: false,
      error: 'invalid_email'
    });

    const unsent = createWorkerNewsletterProvider({
      getApiBaseUrl: () => 'http://127.0.0.1:8787',
      getLocaleFn: () => 'en',
      postJson: async () => {
        const err = new Error('validation_error');
        /** @type {any} */ (err).status = 502;
        throw err;
      }
    });
    assert.deepEqual(await unsent.subscribe('friend@example.com'), {
      ok: false,
      error: 'welcome_unsent'
    });
  });
});

describe('zero coupling', () => {
  it('worker provider must not import tip/sanctuary/entitlement gates', async () => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const src = await readFile(fileURLToPath(new URL('./workerNewsletterProvider.js', import.meta.url)), 'utf8');
    assert.equal(/from\s+['"].*tipJarGate/.test(src), false);
    assert.equal(/from\s+['"].*sanctuaryEntitlementGate/.test(src), false);
    assert.equal(/from\s+['"].*entitlementGate/.test(src), false);
  });
});
