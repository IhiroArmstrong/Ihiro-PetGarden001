import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { formatSupportPrice } from '../ui/SupportYinModalUI.js';
import { MEMBERSHIP_PRICE_DISPLAY } from '../core/membershipCheckout.js';

const here = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(
  readFileSync(join(here, '../locales/en.json'), 'utf8')
);
const zh = JSON.parse(
  readFileSync(join(here, '../locales/zh.json'), 'utf8')
);
const ja = JSON.parse(
  readFileSync(join(here, '../locales/ja.json'), 'utf8')
);

const REQUIRED_SUPPORT_KEYS = [
  'SUPPORT_FAB_LABEL',
  'SUPPORT_FAB_ARIA',
  'SUPPORT_MODAL_TITLE',
  'SUPPORT_MODAL_SUBTITLE',
  'SUPPORT_MODAL_CLOSE',
  'SUPPORT_SANCTUARY_TITLE',
  'SUPPORT_SANCTUARY_BLURB',
  'SUPPORT_SANCTUARY_BADGE',
  'SUPPORT_SANCTUARY_PRICE',
  'SUPPORT_SANCTUARY_CTA',
  'SUPPORT_SANCTUARY_IMG_ALT',
  'SUPPORT_MEMBERSHIP_TITLE',
  'SUPPORT_MEMBERSHIP_BLURB',
  'SUPPORT_MEMBERSHIP_PRICE',
  'SUPPORT_MEMBERSHIP_CTA',
  'SUPPORT_MEMBERSHIP_IMG_ALT',
  'SUPPORT_TEA_TITLE',
  'SUPPORT_TEA_BLURB',
  'SUPPORT_TEA_BENEFIT_1',
  'SUPPORT_TEA_BENEFIT_2',
  'SUPPORT_TEA_BENEFIT_3',
  'SUPPORT_TEA_PRICE',
  'SUPPORT_TEA_CTA',
  'SUPPORT_TEA_IMG_ALT'
];

describe('SupportYinModalUI helpers', () => {
  it('formatSupportPrice replaces {price} inside ${price} templates', () => {
    assert.equal(
      formatSupportPrice('About ${price} · One-time Lifetime', '89.99'),
      'About $89.99 · One-time Lifetime'
    );
  });

  it('en/zh/ja include Support modal copy keys', () => {
    for (const pack of [en, zh, ja]) {
      for (const key of REQUIRED_SUPPORT_KEYS) {
        assert.equal(typeof pack[key], 'string');
        assert.ok(pack[key].length > 0, key);
      }
    }
  });

  it('tea benefits stay ritual thank-you (no unlock wording)', () => {
    for (const pack of [en, zh, ja]) {
      const joined = [
        pack.SUPPORT_TEA_BENEFIT_1,
        pack.SUPPORT_TEA_BENEFIT_2,
        pack.SUPPORT_TEA_BENEFIT_3
      ].join(' ');
      assert.match(joined, /badge|徽章|バッジ/i);
      assert.doesNotMatch(joined, /unlock deeper|解锁更深|より深い音/i);
    }
    assert.match(en.SUPPORT_TEA_BENEFIT_3, /no unlocks/i);
    assert.equal(en.SUPPORT_MODAL_CLOSE, 'Maybe later');
    assert.equal(en.SUPPORT_SANCTUARY_BADGE, 'Suggested');
    assert.match(en.SUPPORT_SANCTUARY_PRICE, /One-time Lifetime/i);
    assert.equal(en.SUPPORT_TEA_CTA, 'Support Us');
    assert.match(en.SUPPORT_MEMBERSHIP_PRICE, /About \$\{price\}/);
    assert.match(en.SUPPORT_MEMBERSHIP_PRICE, /billed monthly/i);
    assert.match(zh.SUPPORT_MEMBERSHIP_PRICE, /\$\{price\}/);
    assert.match(ja.SUPPORT_MEMBERSHIP_PRICE, /\$\{price\}/);
    assert.equal(
      formatSupportPrice(en.SUPPORT_MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_DISPLAY),
      `About $${MEMBERSHIP_PRICE_DISPLAY} · billed monthly`
    );
    assert.match(MEMBERSHIP_PRICE_DISPLAY, /^\d+\.\d{2}$/);
  });

  it('membership preview points at closed-eye meditation asset', () => {
    const src = readFileSync(
      join(here, '../ui/SupportYinModalUI.js'),
      'utf8'
    );
    assert.match(src, /membership-meditation-preview\.png/);
    assert.match(src, /ctaVariant:\s*'cushion'/);
    assert.match(src, /ctaVariant:\s*'beige'/);
    assert.match(src, /yin-support-card__art/);
    assert.match(src, /MEMBERSHIP_PRICE_DISPLAY/);
    assert.match(src, /#e8dfd2/);
  });
});

