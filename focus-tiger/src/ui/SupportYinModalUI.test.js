import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { formatSupportPrice } from '../ui/SupportYinModalUI.js';

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
  'SUPPORT_SANCTUARY_PRICE',
  'SUPPORT_SANCTUARY_CTA',
  'SUPPORT_SANCTUARY_IMG_ALT',
  'SUPPORT_TEA_TITLE',
  'SUPPORT_TEA_BLURB',
  'SUPPORT_TEA_PRICE',
  'SUPPORT_TEA_CTA',
  'SUPPORT_TEA_IMG_ALT'
];

describe('SupportYinModalUI helpers', () => {
  it('formatSupportPrice replaces {price} inside ${price} templates', () => {
    assert.equal(
      formatSupportPrice('About ${price} · Lifetime', '89.99'),
      'About $89.99 · Lifetime'
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
});
