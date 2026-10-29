/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { AMBIENT_TRACKS } from '../../audio/AmbientSoundscapeController.js';
import { RITUAL_RECIPE_SOUND_IDS } from './ritualRecipeAssets.js';

test('recipe sound whitelist matches live AMBIENT_TRACKS ids', () => {
  assert.deepEqual(
    [...RITUAL_RECIPE_SOUND_IDS],
    AMBIENT_TRACKS.map((track) => track.id)
  );
});
