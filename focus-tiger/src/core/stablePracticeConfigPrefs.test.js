/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { createDefaultSittingRecipe } from './ritualRecipe/ritualRecipeSchema.js';
import { applyOfficialSittingTemplate } from './ritualRecipe/officialSittingTemplateSelection.js';
import { OFFICIAL_SITTING_TEMPLATE_ID } from './ritualRecipe/officialSittingTemplates.js';
import { readStablePrefsState } from './stablePrefsStore.js';
import {
  notePracticeConfigManualChange,
  onPracticeConfigSessionBegin,
  resolveStablePracticeConfigForContinue
} from './stablePracticeConfigPrefs.js';

function memStorage() {
  /** @type {Map<string, string>} */
  const map = new Map();
  return /** @type {Storage} */ ({
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    }
  });
}

describe('stablePracticeConfigPrefs T77', () => {
  /** @type {Storage} */
  let storage;

  beforeEach(() => {
    storage = memStorage();
  });

  it('promotes practice config after 3 qualifying begins', () => {
    applyOfficialSittingTemplate(OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT, storage);
    const templateIds = [
      OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT,
      OFFICIAL_SITTING_TEMPLATE_ID.DEEP,
      OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT,
      OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT
    ];
    let t = 0;
    for (const id of templateIds) {
      applyOfficialSittingTemplate(id, storage);
      notePracticeConfigManualChange(storage);
      onPracticeConfigSessionBegin({
        recipe: applyOfficialSittingTemplate(id, storage),
        storage,
        at: (t += 1)
      });
    }
    const stable = resolveStablePracticeConfigForContinue(storage, 10);
    assert.ok(stable);
    assert.equal(stable?.templateId, OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT);
    const st = readStablePrefsState(storage);
    assert.equal(st.practiceVoteWindow?.length, 4);
  });

  it('does not vote without manual recipe change flag', () => {
    const recipe = createDefaultSittingRecipe();
    onPracticeConfigSessionBegin({ recipe, storage, at: 1 });
    const st = readStablePrefsState(storage);
    assert.equal(st.practiceVoteWindow?.length ?? 0, 0);
  });
});
