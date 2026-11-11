/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { STATES } from '../StateManager.js';
import { enablePracticeBackupOptIn } from './practiceBackupSync.js';
import {
  EMAIL_JOURNEY_SIT_COMPLETE_PROMPT_KEY,
  evaluateEmailJourneySitCompletePrompt,
  recordEmailJourneySitCompletePromptDismiss
} from './emailJourneySitCompletePrompt.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
    }
  };
}

const ready = {
  hasQualifiedPractice: true,
  focusing: false,
  sessionBusy: false,
  inviteVisible: false,
  otherPostSitInviteVisible: false,
  coldStartGoalOpen: false,
  postSessionOverlayActive: false,
  completionPending: false,
  supportModalOpen: false,
  sessionState: STATES.IDLE,
  channel: 'direct'
};

describe('emailJourneySitCompletePrompt · T93 D4', () => {
  it('shows once after a sit when unbound, then forever-dismiss hides it', () => {
    const storage = memoryStorage();
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({ ...ready, storage }).shouldShow,
      true
    );
    recordEmailJourneySitCompletePromptDismiss(storage);
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({ ...ready, storage }).reason,
      'dismissed'
    );
    assert.ok(storage.getItem(EMAIL_JOURNEY_SIT_COMPLETE_PROMPT_KEY));
  });

  it('does not show before a sit, while celebrating, or when already bound', () => {
    const storage = memoryStorage();
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({
        ...ready,
        storage,
        hasQualifiedPractice: false
      }).reason,
      'no-qualified-practice'
    );
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({
        ...ready,
        storage,
        sessionState: STATES.CELEBRATE
      }).reason,
      'celebrate'
    );
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({ ...ready, storage }).reason,
      'already-bound'
    );
  });

  it('yields to store channels, support, and the research first-sit invite', () => {
    const storage = memoryStorage();
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({
        ...ready,
        storage,
        channel: 'setapp'
      }).reason,
      'store-channel'
    );
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({
        ...ready,
        storage,
        supportModalOpen: true
      }).reason,
      'support-modal'
    );
    assert.equal(
      evaluateEmailJourneySitCompletePrompt({
        ...ready,
        storage,
        otherPostSitInviteVisible: true
      }).reason,
      'other-post-sit'
    );
  });
});
