import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hintsSrc = readFileSync(
  join(here, '../ui/OnboardingHintsUI.js'),
  'utf8'
);

describe('purpose card hover grace + left-ball no mint', () => {
  it('defines PURPOSE_HOVER_HIDE_GRACE_MS in the 200–500ms bridge band', () => {
    const m = hintsSrc.match(
      /export const PURPOSE_HOVER_HIDE_GRACE_MS\s*=\s*(\d+)/
    );
    assert.ok(m, 'PURPOSE_HOVER_HIDE_GRACE_MS export missing');
    const ms = Number(m[1]);
    assert.ok(ms >= 200);
    assert.ok(ms <= 500);
  });

  it('schedules hide on leave and cancels on re-enter (source contract)', () => {
    assert.match(hintsSrc, /_schedulePurposeHoverHide/);
    assert.match(hintsSrc, /_cancelPurposeHoverHide/);
    assert.match(hintsSrc, /NO_MINT_PULSE_HINT_IDS/);
    assert.match(hintsSrc, /'quick-start'/);
  });
});
