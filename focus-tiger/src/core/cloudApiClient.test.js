/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_CLOUD_API_BASE_URL,
  getCloudApiBaseUrl,
  postCloudJson
} from './cloudApiClient.js';

describe('postCloudJson desktop IPC', () => {
  it('getCloudApiBaseUrl is non-empty in the desktop shell without Vite env', () => {
    const url = getCloudApiBaseUrl({ desktopShell: { isDesktop: true } });
    assert.equal(url, DEFAULT_CLOUD_API_BASE_URL);
  });

  it('unwraps the main-process success envelope', async () => {
    const body = await postCloudJson(
      '/api/create-tip-checkout-session',
      { body: '{"email":"a@b.c"}' },
      {
        desktopShell: {
          isDesktop: true,
          cloudPostJson: async (path, raw) => {
            assert.equal(path, '/api/create-tip-checkout-session');
            assert.equal(raw, '{"email":"a@b.c"}');
            return {
              ok: true,
              body: { url: 'https://checkout.stripe.com/c/pay/cs_test' }
            };
          }
        }
      }
    );
    assert.equal(body.url, 'https://checkout.stripe.com/c/pay/cs_test');
  });

  it('surfaces envelope failures with HTTP status for existing UI catch paths', async () => {
    await assert.rejects(
      () =>
        postCloudJson(
          '/api/restore/request-otp',
          { body: '{}' },
          {
            desktopShell: {
              cloudPostJson: async () => ({
                ok: false,
                status: 429,
                detail: 'HTTP 429',
                body: { detail: 'rate limited' }
              })
            }
          }
        ),
      (err) => {
        assert.equal(err.message, 'HTTP 429');
        assert.equal(err.status, 429);
        assert.equal(err.body.detail, 'rate limited');
        return true;
      }
    );
  });

  it('still surfaces thrown IPC failures so UI catch paths can show an error', async () => {
    await assert.rejects(
      () =>
        postCloudJson(
          '/api/restore/request-otp',
          { body: '{}' },
          {
            desktopShell: {
              cloudPostJson: async () => {
                const err = new Error('HTTP 429');
                err.status = 429;
                throw err;
              }
            }
          }
        ),
      (err) => {
        assert.equal(err.message, 'HTTP 429');
        assert.equal(err.status, 429);
        return true;
      }
    );
  });
});
