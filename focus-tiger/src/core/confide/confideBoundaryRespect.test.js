/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, afterEach } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { confideClassify } from './confideClassify.js';
import {
  formatConfideBoundaryReply,
  isConfideBoundaryIntent,
  shouldHandleConfideBoundary
} from './confideBoundaryRespect.js';
import { CONFIDE_CORPUS } from './confideCorpus.js';
import {
  CONFIDE_COPY_CORPUS_IDS,
  parseConfideCopyOverlay,
  resetTasteLayerOverlayForTests,
  setTasteConfideCopyOverlay
} from '../tasteLayerOverlay.js';
import en from '../../locales/en.json' with { type: 'json' };
import { applyYinMemoryConsent } from '../yinPersonalMemory/yinPersonalMemoryConsent.js';
import { emptyYinPersonalMemoryState } from '../yinPersonalMemory/yinPersonalMemorySchema.js';
import {
  isVerbalForgetIntent,
  shouldHandleVerbalForget
} from '../yinPersonalMemory/yinPersonalMemoryVerbalForget.js';
import { isInlineMemorySuppressIntent } from '../yinPersonalMemory/yinPersonalMemorySuppress.js';

const DUAL_MATCH =
  "Please forget what I said about Monday. I'd rather not get into that.";
const AE_BOUNDARY = "I'm not sure whether I want to talk about it.";
const AG_FORGET = 'Please forget what I said about Monday';
const SUPPRESS_WITH_BOUNDARY = "Don't save this. I'd rather not get into that.";

const grantedState = () =>
  applyYinMemoryConsent(emptyYinPersonalMemoryState(), true, '2026-09-01T00:00:00.000Z');

describe('confideBoundaryRespect', () => {
  afterEach(() => {
    resetTasteLayerOverlayForTests();
  });
  it('matches Gate 0.D boundary utterance and close paraphrases', () => {
    assert.equal(
      isConfideBoundaryIntent("I'm not sure whether I want to talk about it."),
      true
    );
    assert.equal(
      isConfideBoundaryIntent('I’m not sure if I want to talk about it.'),
      true
    );
    assert.equal(
      isConfideBoundaryIntent("I don't want to talk about it."),
      true
    );
    assert.equal(isConfideBoundaryIntent('不确定要不要谈这件事。'), true);
    assert.equal(isConfideBoundaryIntent("What's the weather like?"), false);
    assert.equal(isConfideBoundaryIntent("Don't keep this one."), false);
    assert.equal(isConfideBoundaryIntent("I'd rather not get into that."), true);
    assert.equal(isConfideBoundaryIntent("Let's leave that alone for now."), true);
    assert.equal(isConfideBoundaryIntent("Not today, if that's okay."), true);
    assert.equal(
      isConfideBoundaryIntent("I don't think I'm up for that conversation."),
      true
    );
    assert.equal(isConfideBoundaryIntent('Can we come back to that another time?'), true);
    assert.equal(isConfideBoundaryIntent("I'd prefer to keep this light today."), true);
    assert.equal(isConfideBoundaryIntent("Let's not open that door right now."), true);
    assert.equal(isConfideBoundaryIntent("I think I'll pass on that one."), true);
    assert.equal(isConfideBoundaryIntent("I'm just tired of everything."), false);
    assert.equal(isConfideBoundaryIntent("This is just a hard week."), false);
  });

  it('only intercepts fallback — never safety or emotion buckets', () => {
    const boundary = "I'm not sure whether I want to talk about it.";
    assert.equal(confideClassify(boundary), CONFIDE_ROUTE.FALLBACK);
    assert.equal(
      shouldHandleConfideBoundary({ route: CONFIDE_ROUTE.FALLBACK, text: boundary }),
      true
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.SAD,
        text: 'I feel sad. I am not sure whether I want to talk about it.'
      }),
      false
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.SAFETY_REDIRECT,
        text: boundary
      }),
      false
    );
  });

  it('uses a dedicated locale key without curiosity labels', () => {
    const line = formatConfideBoundaryReply((key) => key);
    assert.equal(line, 'CONFIDE_BOUNDARY_RESPECT');
    assert.equal(/curious/i.test(line), false);
  });

  it('overlay replaces boundary template value without changing the key contract', () => {
    const parsed = parseConfideCopyOverlay({
      schemaVersion: 1,
      locale: 'en',
      templates: [
        { key: 'CONFIDE_BOUNDARY_RESPECT', text: 'We can leave it. Overlay Yin stays.' },
        { key: 'CONFIDE_COMPANION_PRESENCE', text: en.CONFIDE_COMPANION_PRESENCE },
        { key: 'CONFIDE_PREFERENCE_HONESTY', text: en.CONFIDE_PREFERENCE_HONESTY }
      ],
      corpus: CONFIDE_COPY_CORPUS_IDS.map((id) => {
        const line = CONFIDE_CORPUS.find((row) => row.id === id);
        return { id, text: line.en };
      })
    });
    assert.ok(parsed);
    setTasteConfideCopyOverlay(parsed);
    const line = formatConfideBoundaryReply((key) => key);
    assert.equal(line, 'We can leave it. Overlay Yin stays.');
    assert.equal(/curious/i.test(line), false);
  });

  it('AE pure boundary still intercepts when forget cannot run', () => {
    assert.equal(isVerbalForgetIntent(AE_BOUNDARY), false);
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.FALLBACK,
        text: AE_BOUNDARY,
        memoryState: grantedState(),
        hasBridge: true
      }),
      true
    );
  });

  it('AG pure forget is not a boundary intercept', () => {
    assert.equal(isConfideBoundaryIntent(AG_FORGET), false);
    assert.equal(
      shouldHandleVerbalForget({
        route: CONFIDE_ROUTE.FALLBACK,
        state: grantedState(),
        text: AG_FORGET,
        hasBridge: true
      }),
      true
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.FALLBACK,
        text: AG_FORGET,
        memoryState: grantedState(),
        hasBridge: true
      }),
      false
    );
  });

  it('1f suppress still is not verbal forget even with a boundary clause', () => {
    assert.equal(isInlineMemorySuppressIntent(SUPPRESS_WITH_BOUNDARY), true);
    assert.equal(
      shouldHandleVerbalForget({
        route: CONFIDE_ROUTE.FALLBACK,
        state: grantedState(),
        text: SUPPRESS_WITH_BOUNDARY,
        hasBridge: true
      }),
      false
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.FALLBACK,
        text: SUPPRESS_WITH_BOUNDARY,
        memoryState: grantedState(),
        hasBridge: true
      }),
      true
    );
  });

  it('dual-match yields to CI-01 when forget can run, keeps boundary on Web', () => {
    assert.equal(isConfideBoundaryIntent(DUAL_MATCH), true);
    assert.equal(isVerbalForgetIntent(DUAL_MATCH), true);
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.FALLBACK,
        text: DUAL_MATCH,
        memoryState: grantedState(),
        hasBridge: true
      }),
      false
    );
    assert.equal(
      shouldHandleVerbalForget({
        route: CONFIDE_ROUTE.FALLBACK,
        state: grantedState(),
        text: DUAL_MATCH,
        hasBridge: true
      }),
      true
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.FALLBACK,
        text: DUAL_MATCH,
        hasBridge: false
      }),
      true
    );
  });
});
