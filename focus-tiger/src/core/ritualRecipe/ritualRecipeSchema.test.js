/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultSittingRecipe,
  clampFocusDurationSec,
  migrateAndNormalizeRecipe,
  RITUAL_RECIPE_MAX_BYTES,
  RITUAL_RECIPE_REJECT,
  RECOVER_COOLDOWN_SEC,
  utf8ByteLength,
  validateRitualRecipeInput
} from './ritualRecipeSchema.js';

function fixture(overrides = {}) {
  return {
    schemaVersion: 1,
    id: 'rcp_keepme',
    title: 'Evening close',
    locale: 'en',
    authorType: 'official',
    companion: 'yin',
    soundId: 'rain',
    roomId: 'room.default',
    moments: {
      arrive: { promptId: 'arrive.soft' },
      focus: { durationSec: 600, mode: 'fixed', promptId: null },
      recover: { cooldownSec: 180 },
      transition: { promptId: 'transition.hand' },
      reflect: { promptId: 'reflect.line' }
    },
    notes: 'A quiet way to end the day.',
    share: { enabled: true, visibility: 'public' },
    moderation: { status: 'published' },
    ...overrides
  };
}

test('Default sitting matches pre-change Focus 10m / null sound / Recover 180', () => {
  const recipe = createDefaultSittingRecipe();
  assert.equal(recipe.title, 'Default sitting');
  assert.equal(recipe.companion, 'yin');
  assert.equal(recipe.soundId, null);
  assert.equal(recipe.roomId, 'room.default');
  assert.equal(recipe.moments.focus.mode, 'fixed');
  assert.equal(recipe.moments.focus.durationSec, 600);
  assert.equal(recipe.moments.recover.cooldownSec, RECOVER_COOLDOWN_SEC);
  assert.equal(recipe.moments.arrive.promptId, null);
  assert.equal(recipe.moments.transition.promptId, null);
  assert.equal(recipe.moments.reflect.promptId, null);
});

test('§5 size over 8KB is rejected', () => {
  const huge = JSON.stringify({
    ...fixture(),
    notes: 'n'.repeat(RITUAL_RECIPE_MAX_BYTES)
  });
  assert.ok(utf8ByteLength(huge) > RITUAL_RECIPE_MAX_BYTES);
  const result = validateRitualRecipeInput(huge);
  assert.equal(result.ok, false);
  assert.equal(result.reason, RITUAL_RECIPE_REJECT.SIZE);
});

test('§5 invalid JSON is parse reject', () => {
  const result = validateRitualRecipeInput('{not json');
  assert.equal(result.reason, RITUAL_RECIPE_REJECT.PARSE);
});

test('§5 schemaVersion too high is version reject', () => {
  const result = validateRitualRecipeInput(fixture({ schemaVersion: 99 }));
  assert.equal(result.reason, RITUAL_RECIPE_REJECT.VERSION);
});

test('§5 missing moments is structure reject', () => {
  const raw = fixture();
  delete raw.moments.reflect;
  const result = validateRitualRecipeInput(raw);
  assert.equal(result.reason, RITUAL_RECIPE_REJECT.STRUCTURE);
});

test('import regenerates id, forces user author, resets share', () => {
  const result = validateRitualRecipeInput(fixture(), { regenerateId: true });
  assert.equal(result.ok, true);
  assert.notEqual(result.recipe?.id, 'rcp_keepme');
  assert.equal(result.recipe?.authorType, 'user');
  assert.equal(result.recipe?.share.enabled, false);
  assert.equal(result.recipe?.moderation.status, 'draft');
});

test('client drops retired fields and migrates Recover durationSec', () => {
  const raw = fixture({
    moments: {
      arrive: { promptId: null, durationSec: 12, skippable: true, soundId: 'rain' },
      focus: { durationSec: 720, mode: 'fixed', promptId: null },
      recover: { durationSec: 90, promptId: 'recover.toast' },
      transition: { promptId: null, durationSec: 10, skippable: false },
      reflect: { promptId: null, skippable: true }
    }
  });
  const result = migrateAndNormalizeRecipe(raw, { regenerateId: false });
  assert.equal(result.ok, true);
  assert.equal(result.recipe?.moments.recover.cooldownSec, 180);
  assert.equal(result.recipe?.moments.focus.durationSec, 600);
  assert.ok(result.warnings.includes('recover_durationSec_migrated'));
  assert.ok(result.warnings.includes('dropped_arrive_skippable'));
  assert.ok(result.warnings.includes('dropped_recover_promptId'));
  assert.ok(!('skippable' in result.recipe.moments.arrive));
  assert.ok(!('promptId' in result.recipe.moments.recover));
});

test('client unknown ids degrade; server POST rejects assets', () => {
  const raw = fixture({
    soundId: 'snd.not-a-track',
    roomId: 'room.paid-unknown',
    moments: {
      arrive: { promptId: 'arrive.does-not-exist' },
      focus: { durationSec: 600, mode: 'fixed', promptId: null },
      recover: { cooldownSec: 180 },
      transition: { promptId: null },
      reflect: { promptId: null }
    }
  });
  const client = validateRitualRecipeInput(raw, { role: 'client' });
  assert.equal(client.ok, true);
  assert.equal(client.recipe?.soundId, null);
  assert.equal(client.recipe?.roomId, 'room.default');
  assert.equal(client.recipe?.moments.arrive.promptId, null);

  const server = validateRitualRecipeInput(raw, { role: 'server' });
  assert.equal(server.ok, false);
  assert.equal(server.reason, RITUAL_RECIPE_REJECT.ASSET);
});

test('user-* sound ids are forbidden and degrade on client', () => {
  const result = validateRitualRecipeInput(
    fixture({ soundId: 'user-abc' }),
    { role: 'client' }
  );
  assert.equal(result.ok, true);
  assert.equal(result.recipe?.soundId, null);
});

test('open mode is kept; Focus chips clamp to nearest', () => {
  assert.equal(clampFocusDurationSec(800), 900);
  const open = migrateAndNormalizeRecipe(
    fixture({
      moments: {
        arrive: { promptId: null },
        focus: { durationSec: 9999, mode: 'open', promptId: null },
        recover: { cooldownSec: 180 },
        transition: { promptId: null },
        reflect: { promptId: null }
      }
    }),
    { regenerateId: false }
  );
  assert.equal(open.recipe?.moments.focus.mode, 'open');
});

test('strips markup in title and notes', () => {
  const result = migrateAndNormalizeRecipe(
    fixture({
      title: '<b>Hi</b> evening',
      notes: 'a <script>x</script> note'
    }),
    { regenerateId: false }
  );
  assert.equal(result.recipe?.title, 'Hi evening');
  assert.equal(result.recipe?.notes, 'a x note');
});
