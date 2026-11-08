/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { STATES } from './StateManager.js';
import { grantCoPracticeResearchConsent } from './coPracticeResearchConsent.js';
import {
  CO_PRACTICE_RESEARCH_FIRST_SIT_COOLDOWN_MS,
  CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS,
  CO_PRACTICE_RESEARCH_FIRST_SIT_PROMPT_KEY,
  evaluateCoPracticeResearchFirstSitPrompt,
  firstSitPromptCopyContainsForbidden,
  recordFirstSitPromptDismiss,
  recordFirstSitPromptLearn,
  readFirstSitPromptState
} from './coPracticeResearchFirstSitPrompt.js';

function memoryStorage() {
  /** @type {Record<string, string>} */
  const bag = {};
  return /** @type {Storage} */ ({
    getItem: (k) => (k in bag ? bag[k] : null),
    setItem: (k, v) => {
      bag[k] = String(v);
    },
    removeItem: (k) => {
      delete bag[k];
    }
  });
}

const baseOk = {
  hasQualifiedPractice: true,
  focusing: false,
  sessionBusy: false,
  inviteVisible: false,
  coldStartGoalOpen: false,
  postSessionOverlayActive: false,
  completionPending: false,
  sessionState: STATES.IDLE,
  nowMs: Date.parse('2026-11-08T12:00:00.000Z')
};

describe('T83 coPracticeResearch first-sit prompt', () => {
  it('blocks until qualified practice exists', () => {
    const storage = memoryStorage();
    const c = evaluateCoPracticeResearchFirstSitPrompt({
      ...baseOk,
      storage,
      hasQualifiedPractice: false
    });
    assert.equal(c.shouldShow, false);
    assert.equal(c.reason, 'no-qualified-practice');
  });

  it('blocks while focusing or celebrate', () => {
    const storage = memoryStorage();
    assert.equal(
      evaluateCoPracticeResearchFirstSitPrompt({
        ...baseOk,
        storage,
        focusing: true
      }).reason,
      'focusing'
    );
    assert.equal(
      evaluateCoPracticeResearchFirstSitPrompt({
        ...baseOk,
        storage,
        sessionState: STATES.CELEBRATE
      }).reason,
      'celebrate'
    );
  });

  it('respects 30-day cooldown and max two auto shows', () => {
    const storage = memoryStorage();
    recordFirstSitPromptDismiss(storage, baseOk.nowMs);
    let state = readFirstSitPromptState(storage);
    assert.equal(state.showCount, 1);

    let c = evaluateCoPracticeResearchFirstSitPrompt({ ...baseOk, storage });
    assert.equal(c.shouldShow, false);
    assert.equal(c.reason, 'cooldown');

    const afterCooldown =
      baseOk.nowMs + CO_PRACTICE_RESEARCH_FIRST_SIT_COOLDOWN_MS + 1000;
    c = evaluateCoPracticeResearchFirstSitPrompt({
      ...baseOk,
      storage,
      nowMs: afterCooldown
    });
    assert.equal(c.shouldShow, true);

    recordFirstSitPromptDismiss(storage, afterCooldown);
    state = readFirstSitPromptState(storage);
    assert.equal(state.showCount, CO_PRACTICE_RESEARCH_FIRST_SIT_MAX_SHOWS);
    assert.equal(state.finished, true);
    c = evaluateCoPracticeResearchFirstSitPrompt({
      ...baseOk,
      storage,
      nowMs: afterCooldown + 1
    });
    assert.equal(c.shouldShow, false);
    assert.equal(c.reason, 'cap-reached');
  });

  it('never shows after T82 consent', () => {
    const storage = memoryStorage();
    grantCoPracticeResearchConsent(storage);
    const c = evaluateCoPracticeResearchFirstSitPrompt({ ...baseOk, storage });
    assert.equal(c.shouldShow, false);
    assert.equal(c.reason, 'already-enrolled');
  });

  it('learn ends auto prompts', () => {
    const storage = memoryStorage();
    recordFirstSitPromptLearn(storage);
    const c = evaluateCoPracticeResearchFirstSitPrompt({ ...baseOk, storage });
    assert.equal(c.shouldShow, false);
    assert.equal(c.reason, 'cap-reached');
  });

  it('forbidden copy scan rejects locked §4.1 banned phrases', () => {
    assert.equal(firstSitPromptCopyContainsForbidden('proven effective'), true);
    assert.equal(
      firstSitPromptCopyContainsForbidden('human–AI co-practice for desk work'),
      false
    );
  });

  it('persists under dedicated local key', () => {
    const storage = memoryStorage();
    recordFirstSitPromptDismiss(storage, baseOk.nowMs);
    assert.ok(storage.getItem(CO_PRACTICE_RESEARCH_FIRST_SIT_PROMPT_KEY));
  });
});
