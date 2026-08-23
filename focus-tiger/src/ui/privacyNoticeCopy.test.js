/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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

  it('en + ja wellness disclaimer states practice, not clinical care', () => {
    const en = loadLocale('en.json');
    const ja = loadLocale('ja.json');
    assert.match(en.HINT_APP_PURPOSE_WELLNESS_TITLE, /not therapy|medical/i);
    assert.match(
      en.HINT_APP_PURPOSE_WELLNESS_SUMMARY,
      /mindfulness tool|not medical/i
    );
    assert.match(
      en.HINT_APP_PURPOSE_WELLNESS_BODY,
      /focus skill|mindfulness|everyday stress/i
    );
    assert.match(
      en.HINT_APP_PURPOSE_WELLNESS_BODY,
      /not a medical device|not psychotherapy/i
    );
    assert.match(
      en.HINT_APP_PURPOSE_WELLNESS_BODY,
      /counselor|therapist|doctor/i
    );
    assert.match(
      en.HINT_APP_PURPOSE_WELLNESS_BODY,
      /not intended to diagnose, treat, cure, or prevent any disease/i
    );
    assert.match(en.PRIVACY_SHEET_WELLNESS_LINK, /Not therapy or medical care/i);
    assert.match(
      ja.HINT_APP_PURPOSE_WELLNESS_TITLE,
      /心理療法|医療/
    );
    assert.match(
      ja.HINT_APP_PURPOSE_WELLNESS_BODY,
      /集中力|マインドフルネス|ストレス/
    );
    assert.match(en.HINT_APP_PURPOSE_DESKTOP_RAM_BODY, /8 GB of RAM/i);
    assert.match(en.HINT_APP_PURPOSE_DESKTOP_RAM_BODY, /Mac and Windows/i);
    assert.match(en.SUPPORT_DESKTOP_RAM_NOTE, /8 GB of RAM/i);
    assert.match(ja.HINT_APP_PURPOSE_DESKTOP_RAM_BODY, /8GB/);
    assert.match(ja.HINT_APP_PURPOSE_DESKTOP_RAM_BODY, /Windows/);
    assert.match(ja.HINT_APP_PURPOSE_WELLNESS_BODY, /医療機器ではありません/);
    assert.match(
      ja.HINT_APP_PURPOSE_WELLNESS_BODY,
      /カウンセラー|セラピスト|医師/
    );
    assert.match(
      ja.HINT_APP_PURPOSE_WELLNESS_BODY,
      /診断・治療・治癒・予防/
    );
  });

  it('en + ja + zh purpose colophon is creator-first English credit', () => {
    for (const file of ['en.json', 'ja.json', 'zh.json']) {
      const map = loadLocale(file);
      assert.equal(map.HINT_APP_PURPOSE_COLOPHON_MARK, 'Focus Tiger™');
      assert.equal(
        map.HINT_APP_PURPOSE_COLOPHON_BYLINE,
        'Created by Ihiro Armstrong Hao Hoh / Twinsology'
      );
      assert.equal(
        map.HINT_APP_PURPOSE_COLOPHON_COPYRIGHT,
        '© 2026 Ihiro Armstrong Hao Hoh. All rights reserved.'
      );
    }
  });

  it('desktop RAM note is gated to Electron in purpose + Support source', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const purpose = readFileSync(join(here, 'OnboardingHintsUI.js'), 'utf8');
    const support = readFileSync(join(here, 'SupportYinModalUI.js'), 'utf8');
    assert.match(purpose, /onboarding-purpose-desktop-ram/);
    assert.match(purpose, /isDesktopShellRuntime/);
    assert.match(purpose, /HINT_APP_PURPOSE_DESKTOP_RAM_BODY/);
    assert.match(support, /yin-support-desktop-ram/);
    assert.match(support, /SUPPORT_DESKTOP_RAM_NOTE/);
  });
});
