/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDefaultSittingRecipe } from './ritualRecipe/ritualRecipeSchema.js';
import { buildPracticeConfigSignature } from './practiceConfigSignature.js';
import { OFFICIAL_SITTING_TEMPLATE_ID } from './ritualRecipe/officialSittingTemplates.js';

describe('practiceConfigSignature', () => {
  it('resolves official template signature', () => {
    const recipe = createDefaultSittingRecipe();
    const built = buildPracticeConfigSignature(recipe);
    assert.equal(built.templateId, OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT);
    assert.match(built.signature, /^tmpl:/);
  });
});
