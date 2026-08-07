/**
 * Unit locks for Hints visual-guardrail color predicates (no browser).
 * @see e2e/helpers/hints-visual-guardrail.js
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HELP_BUTTON_CREAM_RGB,
  HINT_MINT_RGB,
  TIP_PANEL_MINT_RGB,
  isMintDotNotCream,
  isTipPanelMintNotCream,
  parseCssRgb,
  parseHexRgb,
  rgbNear
} from '../../e2e/helpers/hints-visual-guardrail.js';

test('parseCssRgb / parseHexRgb', () => {
  assert.deepEqual(parseCssRgb('rgb(109, 179, 160)'), HINT_MINT_RGB);
  assert.deepEqual(parseHexRgb('#eef6f1'), TIP_PANEL_MINT_RGB);
});

test('mint dot accepts #6db3a0 and rejects cream', () => {
  assert.equal(isMintDotNotCream(HINT_MINT_RGB), true);
  assert.equal(isMintDotNotCream(HELP_BUTTON_CREAM_RGB), false);
  assert.equal(rgbNear(HINT_MINT_RGB, { r: 110, g: 180, b: 161 }, 5), true);
});

test('tip panel accepts #eef6f1 and rejects cream help fill', () => {
  assert.equal(isTipPanelMintNotCream(TIP_PANEL_MINT_RGB), true);
  assert.equal(isTipPanelMintNotCream(HELP_BUTTON_CREAM_RGB), false);
  assert.equal(isTipPanelMintNotCream({ r: 240, g: 223, b: 196 }), false);
});
