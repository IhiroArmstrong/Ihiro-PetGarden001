/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyPracticeDeepLinkSearch,
  resolvePracticeDeepLinkApply
} from './practiceDeepLinkApply.js';

const idleSit = {
  uiReady: true,
  overlayBusy: false,
  sessionState: 'IDLE',
  completionPending: false,
  deferColdStart: false,
  alreadyOnSitPath: false,
  sitAction: 'start-arrival'
};

describe('classifyPracticeDeepLinkSearch', () => {
  it('ignores pages with no start param', () => {
    assert.deepEqual(classifyPracticeDeepLinkSearch('?product=1'), {
      kind: 'none'
    });
  });

  it('checkout query wins over sit', () => {
    assert.deepEqual(
      classifyPracticeDeepLinkSearch(
        '?product=1&pro_session=cs_test&start=sit&min=5'
      ),
      { kind: 'checkout' }
    );
  });

  it('unknown start is invalid (whole link)', () => {
    assert.deepEqual(
      classifyPracticeDeepLinkSearch('?start=hack&min=5'),
      { kind: 'invalid' }
    );
  });

  it('breath/micro parse but are unsupported on B slice', () => {
    assert.equal(
      classifyPracticeDeepLinkSearch('?start=breath&min=1').kind,
      'unsupported'
    );
    assert.equal(
      classifyPracticeDeepLinkSearch('?start=micro&min=3').kind,
      'unsupported'
    );
  });

  it('accepts sit whitelist minutes', () => {
    assert.deepEqual(classifyPracticeDeepLinkSearch('?start=sit&min=5'), {
      kind: 'sit',
      intent: { start: 'sit', minutes: 5 }
    });
  });
});

describe('resolvePracticeDeepLinkApply', () => {
  const sit = classifyPracticeDeepLinkSearch('?start=sit&min=5');

  it('applies sit when idle and Sit would start arrival', () => {
    assert.deepEqual(resolvePracticeDeepLinkApply({ ...idleSit, classified: sit }), {
      action: 'apply-sit',
      intent: { start: 'sit', minutes: 5 }
    });
  });

  it('defers while cold-start / first paint is open', () => {
    assert.equal(
      resolvePracticeDeepLinkApply({
        ...idleSit,
        classified: sit,
        deferColdStart: true
      }).action,
      'defer'
    );
  });

  it('rejects overlayBusy and focusing with a busy toast (no queue)', () => {
    assert.equal(
      resolvePracticeDeepLinkApply({
        ...idleSit,
        classified: sit,
        overlayBusy: true
      }).action,
      'toast-busy'
    );
    assert.equal(
      resolvePracticeDeepLinkApply({
        ...idleSit,
        classified: sit,
        sessionState: 'FOCUSING'
      }).action,
      'toast-busy'
    );
    assert.equal(
      resolvePracticeDeepLinkApply({
        ...idleSit,
        classified: sit,
        sitAction: 'ignore'
      }).action,
      'toast-busy'
    );
  });

  it('quietly consumes when already on the Sit path after defer', () => {
    assert.equal(
      resolvePracticeDeepLinkApply({
        ...idleSit,
        classified: sit,
        alreadyOnSitPath: true
      }).action,
      'consume-quiet'
    );
  });

  it('toasts discard for invalid/unsupported once UI is ready', () => {
    const invalid = classifyPracticeDeepLinkSearch('?start=hack&min=5');
    assert.equal(
      resolvePracticeDeepLinkApply({ ...idleSit, classified: invalid }).action,
      'toast-discard'
    );
    assert.equal(
      resolvePracticeDeepLinkApply({
        ...idleSit,
        classified: invalid,
        uiReady: false
      }).action,
      'discard-silent'
    );
  });
});
