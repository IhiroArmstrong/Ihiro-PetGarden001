import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'ActiveRecoverAnchorUI.js'), 'utf8');

test('cooldown re-tap is wired to onCooldownTap (not a silent return)', () => {
  assert.match(src, /onCooldownTap/);
  assert.match(src, /this\.handlers\.onCooldownTap\?\.\(\)/);
  assert.equal(
    src.includes('if (!this._focusing || this._cooldown) return'),
    false,
    'cooldown must not silently swallow the click'
  );
});

test('cooldown hides glow and hint but keeps an invisible hit', () => {
  assert.match(src, /is-cooldown/);
  assert.match(src, /this\.glow\.hidden = cooling/);
  assert.match(src, /this\.hint\.hidden = cooling/);
  assert.match(src, /this\.root\.hidden = !focusing/);
  assert.match(src, /isHitArmed/);
});

test('recover hint sits near Yin, not in the Fullscreen companion bottom band', () => {
  assert.match(src, /top: 64%/);
  assert.match(src, /bottom: auto/);
  assert.equal(src.includes('homeClearanceBottomCss'), false);
});
