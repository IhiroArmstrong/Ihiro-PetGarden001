/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function loadLocale(name) {
  return JSON.parse(readFileSync(join(here, name), 'utf8'));
}

describe('newsletter card copy', () => {
  it('en mentions known-error fixes and the latest release, not a sales list', () => {
    const en = loadLocale('en.json');
    assert.match(en.NEWSLETTER_CARD_BLURB, /known errors/i);
    assert.match(en.NEWSLETTER_CARD_BLURB, /latest release|better version/i);
    assert.match(en.NEWSLETTER_CARD_BLURB, /mailbox|unsubscribe/i);
    assert.match(en.NEWSLETTER_CARD_OPTIONAL, /new version|fixed/i);
    assert.match(en.NEWSLETTER_CARD_OPTIONAL, /not a sales list/i);
    assert.equal(/don't miss|buy now|limited time/i.test(en.NEWSLETTER_CARD_BLURB), false);
    assert.equal(/don't miss|buy now|limited time/i.test(en.NEWSLETTER_CARD_OPTIONAL), false);
  });

  it('ja mentions 不具合 and 最新版, not a sales roster', () => {
    const ja = loadLocale('ja.json');
    assert.match(ja.NEWSLETTER_CARD_BLURB, /不具合/);
    assert.match(ja.NEWSLETTER_CARD_BLURB, /最新版/);
    assert.match(ja.NEWSLETTER_CARD_OPTIONAL, /新しい版|最新/);
    assert.match(ja.NEWSLETTER_CARD_OPTIONAL, /売り込み/);
  });
});
