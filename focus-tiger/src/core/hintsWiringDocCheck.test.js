import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HINT_WIRING_BATCH_CLUSTER,
  listHintIdsForWiringCluster,
  validateHintWiringClusters,
  renderHintsWiringInventoryMarkdownBlock
} from '../../scripts/hints-doc-check.js';
import { ONBOARDING_HINT_REGISTRY } from '../core/onboardingHintRegistry.js';

test('listHintIdsForWiringCluster returns sorted cluster A ids', () => {
  assert.deepEqual(listHintIdsForWiringCluster('A'), [
    'honesty-optional',
    'how-shall-we-sit',
    'idle-after-session',
    'quick-start',
    'sit-button'
  ]);
});

test('HINTS_WIRING inventory markdown lists every registry id', () => {
  const block = renderHintsWiringInventoryMarkdownBlock();
  for (const entry of ONBOARDING_HINT_REGISTRY) {
    assert.ok(
      block.includes(`\`${entry.id}\``),
      `inventory missing ${entry.id}`
    );
  }
  assert.ok(block.includes('hints-wiring-registry:inventory:begin'));
});
