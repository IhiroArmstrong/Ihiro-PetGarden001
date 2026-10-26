/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { T54_RESEARCH_CONSENT_STORAGE_KEY, setT54ResearchConsent } from './t54ResearchLedger.js';
import {
  buildT54ResearchUploadPayload,
  flushT54ResearchIngest,
  LAST_POST_FINGERPRINT_KEY
} from './t54ResearchUpload.js';

function mem() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

test('flush posts whitelist after consent and skips identical payload', async () => {
  const storage = mem();
  setT54ResearchConsent(storage, true, () => new Date('2026-10-26T00:00:00.000Z'));
  const payload = buildT54ResearchUploadPayload(storage);
  assert.equal(payload.studyId, 't54-product-improve');
  assert.ok(payload.localResearchCode);
  assert.equal(payload.email, undefined);
  let posts = 0;
  const postJson = async () => {
    posts += 1;
  };
  const first = await flushT54ResearchIngest({
    storage,
    postJson,
    getBaseUrl: () => 'https://example.test'
  });
  assert.equal(first.ok, true);
  assert.equal(posts, 1);
  const second = await flushT54ResearchIngest({
    storage,
    postJson,
    getBaseUrl: () => 'https://example.test'
  });
  assert.equal(second.skipped, true);
  assert.equal(posts, 1);
  assert.ok(storage.getItem(LAST_POST_FINGERPRINT_KEY));
});

test('flush does not post without consent even if receive is configured', async () => {
  const storage = mem();
  let posts = 0;
  const result = await flushT54ResearchIngest({
    storage,
    postJson: async () => {
      posts += 1;
    },
    getBaseUrl: () => 'https://example.test'
  });
  assert.equal(result.ok, false);
  assert.equal(posts, 0);
  assert.equal(storage.getItem(T54_RESEARCH_CONSENT_STORAGE_KEY), null);
});

test('locale slice has locked copy and no forbidden substrings', () => {
  const slicePath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../locales/slices/t54-research-consent.json'
  );
  const slice = JSON.parse(readFileSync(slicePath, 'utf8'));
  assert.equal(
    slice.en.T54_RESEARCH_CONSENT_LABEL,
    'Share optional practice-effect counts (research)'
  );
  assert.equal(
    slice.zh.T54_RESEARCH_CONSENT_LABEL,
    '分享可选的练习效果计数（研究）'
  );
  const blob = JSON.stringify(slice).toLowerCase();
  for (const bad of [
    'training',
    'train the model',
    '已证明',
    '不带您的任何隐私痕迹',
    'intervention'
  ]) {
    assert.equal(blob.includes(bad.toLowerCase()), false, bad);
  }
});
