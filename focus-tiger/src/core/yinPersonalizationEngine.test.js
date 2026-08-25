/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import { shouldUseDesktopCompanionGenerate } from './desktopCompanionL2Route.js';
import {
  MOMENT_WHISPERS_SEEN_KEY,
  shouldShowMomentWhisper
} from './momentWhispersGate.js';
import {
  YPE_COMPANION_STYLES,
  YPE_FACTORY_COMPANION_STYLE,
  YPE_LAYER_ORDER,
  YPE_RUNTIME_LEVEL,
  discardPersonalizationStatePack,
  evaluateYinPersonalizationPolicy,
  resolveLocalCompanionStyle,
  ypeMayShowMomentWhisper,
  ypeMayUseCompanionGenerate
} from './yinPersonalizationEngine.js';

const here = dirname(fileURLToPath(import.meta.url));
const focusTigerRoot = join(here, '../..');

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    }
  };
}

describe('yinPersonalizationEngine L0', () => {
  it('keeps factory default style and named-only tiers', () => {
    assert.deepEqual([...YPE_COMPANION_STYLES], ['quiet', 'default', 'warm']);
    assert.equal(YPE_FACTORY_COMPANION_STYLE, 'default');
    assert.equal(YPE_RUNTIME_LEVEL, 'L0');
    assert.equal(resolveLocalCompanionStyle('warm'), 'default');
    assert.equal(resolveLocalCompanionStyle('quiet'), 'default');
  });

  it('never applies a State Pack overlay', () => {
    const sketch = {
      schemaVersion: 1,
      packVersion: 27,
      companionStyle: 'warm',
      memoryRankHints: [{ memoryId: 'm1', rankHint: 0.9 }]
    };
    assert.deepEqual(discardPersonalizationStatePack(sketch), {
      applied: false,
      reason: 'l0-local-only'
    });
    const policy = evaluateYinPersonalizationPolicy({
      pack: sketch,
      requestedStyle: 'warm',
      ...readyOpen,
      route: CONFIDE_ROUTE.FALLBACK
    });
    assert.equal(policy.companionStyle, 'default');
    assert.equal(policy.packOverlayApplied, false);
    assert.equal('speakProbability' in policy, false);
    assert.equal('intervention_probability' in policy, false);
  });

  it('locks layer order Safety > corpus > memory > qwen', () => {
    assert.deepEqual([...YPE_LAYER_ORDER], [
      'safety',
      'corpus',
      'memory',
      'qwen'
    ]);
  });

  it('matches existing Confide generate parity', () => {
    const cases = [
      { ...readyOpen, route: CONFIDE_ROUTE.FALLBACK },
      { ...readyOpen, route: CONFIDE_ROUTE.SAFETY_REDIRECT },
      { ...readyOpen, route: CONFIDE_ROUTE.SAD },
      {
        generateEnabled: false,
        generateLayerOpen: true,
        hasGenerateFn: true,
        route: CONFIDE_ROUTE.FALLBACK
      }
    ];
    for (const opts of cases) {
      assert.equal(
        ypeMayUseCompanionGenerate(opts),
        shouldUseDesktopCompanionGenerate(opts),
        JSON.stringify(opts)
      );
    }
  });

  it('matches existing Moment Whisper parity', () => {
    const storage = memoryStorage();
    assert.equal(
      ypeMayShowMomentWhisper(storage, 'arrive', { busy: false }),
      shouldShowMomentWhisper(storage, 'arrive', { busy: false })
    );
    assert.equal(
      ypeMayShowMomentWhisper(storage, 'arrive', { busy: true }),
      shouldShowMomentWhisper(storage, 'arrive', { busy: true })
    );
    assert.equal(
      ypeMayShowMomentWhisper(storage, 'transition'),
      shouldShowMomentWhisper(storage, 'transition')
    );
  });

  it('skips YPE extras on safety without changing the generate false', () => {
    const policy = evaluateYinPersonalizationPolicy({
      ...readyOpen,
      route: CONFIDE_ROUTE.SAFETY_REDIRECT,
      whisperStorage: memoryStorage(),
      whisperKey: 'arrive'
    });
    assert.equal(policy.skipYpeOnSafety, true);
    assert.equal(policy.mayGenerate, false);
  });


  it('product UIs call YPE wrappers, not the leaf helpers directly', () => {
    const confide = readFileSync(
      join(focusTigerRoot, 'src/ui/ConfideToYinUI.js'),
      'utf8'
    );
    const whisper = readFileSync(
      join(focusTigerRoot, 'src/ui/MomentWhisperUI.js'),
      'utf8'
    );
    assert.match(confide, /ypeMayUseCompanionGenerate/);
    assert.equal(confide.includes('shouldUseDesktopCompanionGenerate'), false);
    assert.match(whisper, /ypeMayShowMomentWhisper/);
    assert.equal(whisper.includes('shouldShowMomentWhisper'), false);
  });

  it('does not add a localStorage key', () => {
    const keys = readFileSync(
      join(focusTigerRoot, 'src/core/localStateKeys.js'),
      'utf8'
    );
    assert.equal(keys.includes('yin-personalization'), false);
    assert.equal(keys.includes('ype-state-pack'), false);
    assert.match(keys, /focus-tiger\.moment-whispers-seen\.v1/);
  });
});
