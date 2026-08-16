/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPRITE_DISPLAY_REFERENCE,
  computeSpriteDisplayTransform,
  contentScreenRect,
  spriteDisplayTransformCss
} from './spriteDisplayFit.js';
import { SPRITE_SEQUENCES } from './spriteManifest.js';

const PALMS_FIT = SPRITE_SEQUENCES.palmsTogether.displayFit;

describe('spriteDisplayFit', () => {
  it('leaves reference-sized sources unscaled', () => {
    const t = computeSpriteDisplayTransform(SPRITE_DISPLAY_REFERENCE, {
      width: 800,
      height: 600
    });
    assert.deepEqual(t, { scale: 1, tx: 0, ty: 0 });
    assert.equal(spriteDisplayTransformCss(t), '');
  });

  it('scales palms-together so content height and cushion anchor match idle', () => {
    const container = { width: 800, height: 600 };
    const t = computeSpriteDisplayTransform(PALMS_FIT, container);
    assert.ok(t.scale > 1.1 && t.scale < 1.2);

    const ref = contentScreenRect(SPRITE_DISPLAY_REFERENCE, 800, 600);
    const src = contentScreenRect(PALMS_FIT, 800, 600);
    const palmsH = src.height * t.scale;
    const palmsBottom = src.anchorY * t.scale + t.ty;
    const palmsAx = src.anchorX * t.scale + t.tx;

    assert.ok(Math.abs(palmsH - ref.height) < 0.5);
    assert.ok(Math.abs(palmsBottom - ref.anchorY) < 0.5);
    assert.ok(Math.abs(palmsAx - ref.anchorX) < 0.5);
  });

  it('also shrinks palms on tall phone containers where 1:1 was oversized', () => {
    const t = computeSpriteDisplayTransform(PALMS_FIT, {
      width: 390,
      height: 844
    });
    assert.ok(t.scale < 1);
    assert.ok(t.scale > 0.85);
  });

  it('registers displayFit on palmsTogether', () => {
    assert.equal(PALMS_FIT.width, 960);
    assert.equal(PALMS_FIT.height, 960);
    assert.equal(PALMS_FIT.content.h, 734);
  });

  it('waveHelloPingpong displayFit uses scaleMul 1.5 and cushion re-anchor', () => {
    const waveFit = SPRITE_SEQUENCES.waveHelloPingpong.displayFit;
    assert.equal(waveFit?.width, 960);
    assert.equal(waveFit?.scaleMul, 1.5);
    const container = { width: 800, height: 600 };
    const t = computeSpriteDisplayTransform(waveFit, container);
    const withoutMul = computeSpriteDisplayTransform(
      { ...waveFit, scaleMul: 1 },
      container
    );
    assert.ok(Math.abs(t.scale / withoutMul.scale - 1.5) < 0.001);

    const ref = contentScreenRect(SPRITE_DISPLAY_REFERENCE, 800, 600);
    const src = contentScreenRect(waveFit, 800, 600);
    const bottom = src.anchorY * t.scale + t.ty;
    const ax = src.anchorX * t.scale + t.tx;
    assert.ok(Math.abs(bottom - ref.anchorY) < 0.5);
    assert.ok(Math.abs(ax - ref.anchorX) < 0.5);
  });
});
