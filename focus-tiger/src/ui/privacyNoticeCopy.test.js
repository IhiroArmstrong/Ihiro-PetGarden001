import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  PRIVACY_SHEET_BODY_KEYS,
  findPrivacyKeysWithForbiddenCloudBrand,
  privacyCopyMentionsForbiddenCloudBrand
} from './privacyNoticeCopy.js';

const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, '../locales');

function loadLocale(name) {
  return JSON.parse(readFileSync(join(localesDir, name), 'utf8'));
}

describe('privacyNoticeCopy', () => {
  it('lists stable sheet body keys', () => {
    assert.equal(PRIVACY_SHEET_BODY_KEYS.length >= 4, true);
    assert.ok(PRIVACY_SHEET_BODY_KEYS.includes('PRIVACY_SHEET_INTRO'));
  });

  it('detects forbidden iCloud brand in free text', () => {
    assert.equal(privacyCopyMentionsForbiddenCloudBrand('via iCloud sync'), true);
    assert.equal(privacyCopyMentionsForbiddenCloudBrand('stays on this device'), false);
  });

  it('en + ja purpose/privacy keys never promise iCloud', () => {
    for (const file of ['en.json', 'ja.json']) {
      const map = loadLocale(file);
      const bad = findPrivacyKeysWithForbiddenCloudBrand(map);
      assert.deepEqual(bad, [], `${file} must not mention iCloud: ${bad.join(',')}`);
      assert.match(map.HINT_APP_PURPOSE_BODY, /no ads|広告/i);
      assert.ok(
        /device|端末|this device/i.test(map.HINT_APP_PURPOSE_BODY) ||
          /device|端末/i.test(map.PRIVACY_SHEET_INTRO)
      );
    }
  });
});
