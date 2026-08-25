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
  YPE_COMPANION_STYLE_STORAGE_KEY,
  YPE_FACTORY_COMPANION_STYLE,
  YPE_INSIGHT_MIN_SITS,
  YPE_LAYER_ORDER,
  YPE_RUNTIME_LEVEL,
  discardPersonalizationStatePack,
  evaluateYinPersonalizationPolicy,
  readYpeCompanionStyle,
  resolveLocalCompanionStyle,
  writeYpeCompanionStyle,
  ypeBuildJourneyInsights,
  ypeInsightsForGenerate,
  ypeMayShowMomentWhisper,
  ypeMayUseCompanionGenerate,
  ypeRecallCap,
  ypeRetrieveMemories,
  ypeShouldInjectFormedMemory
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
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('yinPersonalizationEngine L0', () => {
  it('keeps named-only tiers and honors a local style choice', () => {
    assert.deepEqual([...YPE_COMPANION_STYLES], ['quiet', 'default', 'warm']);
    assert.equal(YPE_FACTORY_COMPANION_STYLE, 'default');
    assert.equal(YPE_RUNTIME_LEVEL, 'L1');
    assert.equal(resolveLocalCompanionStyle('warm'), 'warm');
    assert.equal(resolveLocalCompanionStyle('quiet'), 'quiet');
    assert.equal(resolveLocalCompanionStyle('coach'), 'default');
    assert.equal(ypeRecallCap('quiet'), 1);
    assert.equal(ypeRecallCap('default'), 3);
    assert.equal(ypeRecallCap('warm'), 3);
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
      requestedStyle: 'default',
      ...readyOpen,
      route: CONFIDE_ROUTE.FALLBACK
    });
    assert.equal(policy.companionStyle, 'default');
    assert.equal(policy.packOverlayApplied, false);
    assert.equal(policy.runtimeLevel, 'L1');
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

  it('registers only the companion-style key, never a State Pack file', () => {
    const keys = readFileSync(
      join(focusTigerRoot, 'src/core/localStateKeys.js'),
      'utf8'
    );
    assert.match(keys, /focus-tiger\.ype-companion-style\.v1/);
    assert.equal(keys.includes('ype-state-pack'), false);
    assert.equal(YPE_COMPANION_STYLE_STORAGE_KEY, 'focus-tiger.ype-companion-style.v1');
  });

  it('persists quiet/warm and treats usual as off', () => {
    const storage = memoryStorage();
    assert.equal(readYpeCompanionStyle(storage), 'default');
    assert.equal(writeYpeCompanionStyle(storage, 'quiet'), 'quiet');
    assert.equal(readYpeCompanionStyle(storage), 'quiet');
    assert.equal(writeYpeCompanionStyle(storage, 'default'), 'default');
    assert.equal(storage.getItem(YPE_COMPANION_STYLE_STORAGE_KEY), null);
  });

  it('retrieve contract skips low/unrelated, caps quiet at 1, and honors session exclude', () => {
    const now = '2026-08-26T12:00:00.000Z';
    const state = {
      schemaVersion: 1,
      consent: 'granted',
      consentedAt: now,
      memories: [
        {
          id: 'a',
          kind: 'pattern',
          summary: 'Mondays have often felt crowded for you.',
          evidence: 'rule:pattern-monday-crowded;confide',
          confidence: 'high',
          firstSeenAt: now,
          lastSeenAt: now,
          status: 'active',
          sourceRoute: 'confide_fallback'
        },
        {
          id: 'b',
          kind: 'pattern',
          summary: 'You have mentioned quiet rooms.',
          evidence: 'rule:preference-quiet-short;confide',
          confidence: 'medium',
          firstSeenAt: now,
          lastSeenAt: now,
          status: 'active',
          sourceRoute: 'confide_fallback'
        },
        {
          id: 'c',
          kind: 'pattern',
          summary: 'A low-confidence aside.',
          evidence: 'rule:pattern-monday;confide',
          confidence: 'low',
          firstSeenAt: now,
          lastSeenAt: now,
          status: 'active',
          sourceRoute: 'confide_fallback'
        }
      ]
    };
    const text = 'Monday feels crowded and I want it quiet';
    const def = ypeRetrieveMemories({ state, userText: text, companionStyle: 'default' });
    assert.equal(def.summaries.includes('A low-confidence aside.'), false);
    assert.ok(def.ids.includes('a'));
    const quiet = ypeRetrieveMemories({
      state,
      userText: text,
      companionStyle: 'quiet'
    });
    assert.equal(quiet.ids.length, 1);
    const excluded = ypeRetrieveMemories({
      state,
      userText: text,
      companionStyle: 'default',
      sessionExcludeIds: def.ids
    });
    assert.equal(excluded.ids.some((id) => def.ids.includes(id)), false);
    const ranked = ypeRetrieveMemories({
      state,
      userText: text,
      companionStyle: 'default',
      rankHints: [{ memoryId: 'b', rankHint: 0.99 }]
    });
    assert.equal(ranked.ids[0], 'b');
    const safety = ypeRetrieveMemories({
      state,
      userText: text,
      skipYpeOnSafety: true
    });
    assert.deepEqual(safety.summaries, []);
    assert.equal(ypeShouldInjectFormedMemory(state.memories[2]), false);
    assert.equal(ypeShouldInjectFormedMemory(state.memories[0]), true);
  });

  it('builds counting insights only with enough sits and never on quiet generate', () => {
    const sits = [];
    for (let i = 0; i < YPE_INSIGHT_MIN_SITS; i += 1) {
      const hour = i < 7 ? 8 : 20;
      sits.push({
        at: new Date(2026, 7, 10 + i, hour, 0, 0).toISOString(),
        minutes: 20,
        arrive: true,
        reflect: i % 2 === 0
      });
    }
    const insights = ypeBuildJourneyInsights(sits);
    assert.ok(insights.some((row) => row.id === 'morning_settle'));
    assert.equal(
      insights.find((row) => row.id === 'morning_settle').tone,
      'observation'
    );
    assert.deepEqual(ypeInsightsForGenerate('quiet', insights), []);
    assert.deepEqual(ypeInsightsForGenerate('default', insights), []);
    const warm = ypeInsightsForGenerate('warm', insights);
    assert.equal(warm.length, 1);
    assert.equal(warm[0].id, 'morning_settle');
    assert.deepEqual(ypeBuildJourneyInsights(sits.slice(0, 3)), []);
  });
});
