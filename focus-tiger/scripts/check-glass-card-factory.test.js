/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLASS_CARD_FACTORY_EXEMPT_IDS } from './glass-card-factory-exemptions.js';
import {
  evaluateGlassCardFactory,
  runGlassCardFactoryCheck,
  sourceUsesGlassFactory
} from './check-glass-card-factory.js';

const here = dirname(fileURLToPath(import.meta.url));

test('missing createGlassCard fails unless grandfathered', () => {
  const result = evaluateGlassCardFactory({
    ids: ['guided-meditation'],
    keepStylesheetZ: new Set(),
    exemptIds: [],
    files: [
      {
        rel: 'src/ui/GuidedMeditationUI.js',
        src: "this.root.id = 'guided-meditation';",
        id: 'x'
      }
    ]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /must call createGlassCard/.test(err)));
});

test('createGlassCard plus leftover exemption fails (list only shrinks)', () => {
  const result = evaluateGlassCardFactory({
    ids: ['guided-meditation'],
    keepStylesheetZ: new Set(),
    exemptIds: ['guided-meditation'],
    files: [
      {
        rel: 'src/ui/GuidedMeditationUI.js',
        src: "createGlassCard({ id: 'guided-meditation', deck: true })",
        id: 'x'
      }
    ]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /still on the exemption list/.test(err)));
});

test('Support keep-stylesheet-z is not required to use the factory', () => {
  const result = evaluateGlassCardFactory({
    ids: ['yin-support-modal'],
    keepStylesheetZ: new Set(['yin-support-modal']),
    exemptIds: [],
    files: [
      {
        rel: 'src/ui/SupportYinModalUI.js',
        src: "this.root.id = 'yin-support-modal';",
        id: 'x'
      }
    ]
  });
  assert.equal(result.ok, true, result.errors.join('; '));
});

test('live tree: factory check green; GM is not grandfathered', () => {
  assert.equal(runGlassCardFactoryCheck(), true);
  assert.equal(GLASS_CARD_FACTORY_EXEMPT_IDS.includes('guided-meditation'), false);
  const src = readFileSync(
    join(here, '../src/ui/GuidedMeditationUI.js'),
    'utf8'
  );
  assert.equal(sourceUsesGlassFactory(src), true);
  assert.match(src, /deck: true/);
  assert.doesNotMatch(src, /rgba\(255,\s*252,\s*245,\s*0\.92\)/);
});
