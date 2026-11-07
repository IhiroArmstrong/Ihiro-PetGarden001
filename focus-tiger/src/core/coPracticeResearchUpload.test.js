/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY,
  grantCoPracticeResearchConsent,
  readCoPracticeResearchConsent
} from './coPracticeResearchConsent.js';
import {
  buildCoPracticeResearchConsentPreviewJson,
  buildCoPracticeResearchUploadPayload,
  deleteCoPracticeResearchIngest,
  flushCoPracticeResearchIngest,
  probeCoPracticeResearchReceive,
  revokeCoPracticeResearchAndDeleteRemote
} from './coPracticeResearchUpload.js';
import { CO_PRACTICE_RESEARCH_LAB_UPLOAD_QUERY } from './coPracticeResearchReceive.js';
import {
  coPracticeResearchPayloadEqual,
  serializeCoPracticeResearchPayload
} from './coPracticeResearchSerialize.js';
import {
  buildCoPracticeResearchGoldenStorageEntries,
  CO_PRACTICE_RESEARCH_GOLDEN_CONSENTED_AT,
  CO_PRACTICE_RESEARCH_GOLDEN_NOW,
  CO_PRACTICE_RESEARCH_GOLDEN_OBJECT,
  CO_PRACTICE_RESEARCH_GOLDEN_WEEK
} from './coPracticeResearchGoldenFixture.js';

/** @param {Record<string, string>} [entries] */
function memoryStorage(entries = {}) {
  const map = new Map(Object.entries(entries));
  return /** @type {Storage} */ ({
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    get length() {
      return map.size;
    },
    key() {
      return null;
    }
  });
}

describe('T81 S4(c)(d) coPracticeResearch upload consent gate', () => {
  it('flush and probe issue zero network without consent', async () => {
    const storage = memoryStorage();
    let posts = 0;
    let fetches = 0;
    const result = await flushCoPracticeResearchIngest({
      storage,
      postJson: async () => {
        posts += 1;
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(result.skipped, true);
    assert.equal(posts, 0);
    const probe = probeCoPracticeResearchReceive({
      storage,
      search: `?${CO_PRACTICE_RESEARCH_LAB_UPLOAD_QUERY}=1`,
      receiveConfigured: true
    });
    assert.equal(probe.skipped, true);
    assert.equal(fetches, 0);
  });

  it('lab query does not bypass missing consent', async () => {
    const storage = memoryStorage();
    let posts = 0;
    await flushCoPracticeResearchIngest({
      storage,
      search: `?${CO_PRACTICE_RESEARCH_LAB_UPLOAD_QUERY}=1`,
      postJson: async () => {
        posts += 1;
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(posts, 0);
  });

  it('posts after consent and skips identical serialized body', async () => {
    const storage = memoryStorage(buildCoPracticeResearchGoldenStorageEntries());
    grantCoPracticeResearchConsent(storage, {
      studyId: CO_PRACTICE_RESEARCH_GOLDEN_OBJECT.studyId,
      now: () => new Date(CO_PRACTICE_RESEARCH_GOLDEN_CONSENTED_AT)
    });
    let posts = 0;
    const first = await flushCoPracticeResearchIngest({
      storage,
      postJson: async () => {
        posts += 1;
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(first.ok, true);
    assert.equal(posts, 1);
    const second = await flushCoPracticeResearchIngest({
      storage,
      postJson: async () => {
        posts += 1;
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(second.skipped, true);
    assert.equal(posts, 1);
  });

  it('revoke clears studyId and blocks further POST', async () => {
    const storage = memoryStorage();
    grantCoPracticeResearchConsent(storage, {
      studyId: CO_PRACTICE_RESEARCH_GOLDEN_OBJECT.studyId
    });
    let posts = 0;
    let deletes = 0;
    const revoked = await revokeCoPracticeResearchAndDeleteRemote({
      storage,
      getBaseUrl: () => 'https://example.test',
      fetchFn: async () => {
        deletes += 1;
        return new Response('', { status: 204 });
      }
    });
    assert.equal(revoked.studyId, CO_PRACTICE_RESEARCH_GOLDEN_OBJECT.studyId);
    assert.equal(readCoPracticeResearchConsent(storage).studyId, null);
    assert.equal(storage.getItem(CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY), null);
    assert.equal(deletes, 1);
    await flushCoPracticeResearchIngest({
      storage,
      postJson: async () => {
        posts += 1;
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(posts, 0);
    const probe = probeCoPracticeResearchReceive({
      storage,
      receiveConfigured: true
    });
    assert.equal(probe.skipped, true);
  });

  it('deleteCoPracticeResearchIngest is no-op without studyId', async () => {
    let called = 0;
    const result = await deleteCoPracticeResearchIngest({
      studyId: '',
      fetchFn: async () => {
        called += 1;
        return { ok: true };
      },
      getBaseUrl: () => 'https://example.test'
    });
    assert.equal(result.skipped, true);
    assert.equal(called, 0);
  });
});

describe('T81 S4(e) preview and upload share serializer + golden', () => {
  it('preview JSON equals upload payload and matches golden SSOT', () => {
    const storage = memoryStorage(buildCoPracticeResearchGoldenStorageEntries());
    grantCoPracticeResearchConsent(storage, {
      studyId: CO_PRACTICE_RESEARCH_GOLDEN_OBJECT.studyId,
      now: () => new Date(CO_PRACTICE_RESEARCH_GOLDEN_CONSENTED_AT)
    });
    const previewJson = buildCoPracticeResearchConsentPreviewJson({
      storage,
      previewOnly: true,
      previewStudyId: CO_PRACTICE_RESEARCH_GOLDEN_OBJECT.studyId,
      consentedAt: CO_PRACTICE_RESEARCH_GOLDEN_CONSENTED_AT,
      consentVersion: 1,
      platform: 'mac',
      locale: 'en',
      week: CO_PRACTICE_RESEARCH_GOLDEN_WEEK,
      now: () => new Date(CO_PRACTICE_RESEARCH_GOLDEN_NOW)
    });
    const uploadObj = buildCoPracticeResearchUploadPayload({
      storage,
      platform: 'mac',
      locale: 'en',
      week: CO_PRACTICE_RESEARCH_GOLDEN_WEEK,
      now: () => new Date(CO_PRACTICE_RESEARCH_GOLDEN_NOW)
    });
    assert.ok(previewJson);
    assert.ok(uploadObj);
    assert.equal(previewJson, JSON.stringify(JSON.parse(previewJson)));
    assert.equal(previewJson, serializeCoPracticeResearchPayload(uploadObj));
    assert.ok(
      coPracticeResearchPayloadEqual(
        JSON.parse(previewJson),
        CO_PRACTICE_RESEARCH_GOLDEN_OBJECT
      )
    );
  });
});
