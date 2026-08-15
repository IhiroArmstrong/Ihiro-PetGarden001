import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { inflateSync } from 'node:zlib';
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
  });

  it('Sanctuary and Membership card art punch studio backdrop (tea-like alpha)', () => {
    const publicSupport = join(here, '../../public/ui/support');
    for (const name of [
      'sanctuary-preview.png',
      'membership-meditation-preview.png',
      'tea-drinking-preview.png'
    ]) {
      const alpha = pngCornerAlpha(join(publicSupport, name));
      assert.ok(
        alpha.every((a) => a < 16),
        `${name} corners should be transparent, got ${alpha}`
      );
    }
  });
});

/**
 * Read RGBA alpha at the four corners of an 8-bit color-type-6 PNG.
 * @param {string} filePath
 * @returns {number[]}
 */
function pngCornerAlpha(filePath) {
  const buf = readFileSync(filePath);
  if (buf.subarray(0, 8).toString('binary') !== '\x89PNG\r\n\x1a\n') {
    throw new Error(`not a png: ${filePath}`);
  }
  let i = 8;
  const idats = [];
  let w = 0;
  let h = 0;
  let bit = 0;
  let color = 0;
  while (i < buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.subarray(i + 4, i + 8).toString('ascii');
    const data = buf.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bit = data[8];
      color = data[9];
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') {
      break;
    }
    i += 12 + len;
  }
  if (bit !== 8 || color !== 6) {
    throw new Error(`unsupported png ${filePath} bit=${bit} color=${color}`);
  }
  const raw = inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = w * bpp;
  const prev = Buffer.alloc(stride);
  const row = Buffer.alloc(stride);
  let off = 0;
  /** @type {Buffer | null} */
  let first = null;
  /** @type {Buffer | null} */
  let last = null;
  for (let y = 0; y < h; y++) {
    const filter = raw[off];
    off += 1;
    raw.copy(row, 0, off, off + stride);
    off += stride;
    if (filter === 1) {
      for (let x = 0; x < stride; x++) {
        row[x] = (row[x] + (x >= bpp ? row[x - bpp] : 0)) & 255;
      }
    } else if (filter === 2) {
      for (let x = 0; x < stride; x++) {
        row[x] = (row[x] + prev[x]) & 255;
      }
    } else if (filter === 3) {
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? row[x - bpp] : 0;
        row[x] = (row[x] + ((a + prev[x]) >> 1)) & 255;
      }
    } else if (filter === 4) {
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? row[x - bpp] : 0;
        const b = prev[x];
        const c = x >= bpp ? prev[x - bpp] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        row[x] = (row[x] + pr) & 255;
      }
    } else if (filter !== 0) {
      throw new Error(`filter ${filter} in ${filePath}`);
    }
    row.copy(prev);
    if (y === 0) first = Buffer.from(row);
    if (y === h - 1) last = Buffer.from(row);
  }
  if (!first || !last) throw new Error('decode failed');
  return [first[3], first[stride - 1], last[3], last[stride - 1]];
}
