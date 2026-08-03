import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HINT_WIRING_BATCH_CLUSTER,
  validateHintWiringClusters,
  renderHintsWiringInventoryMarkdownBlock
} from '../../scripts/hints-doc-check.js';
import { ONBOARDING_HINT_REGISTRY } from '../core/onboardingHintRegistry.js';

test('every registry hintId has an explicit HINTS_WIRING batch cluster', () => {
  const result = validateHintWiringClusters();
  assert.deepEqual(result.missingCluster, []);
  assert.deepEqual(result.unknownCluster, []);
  assert.equal(result.ok, true);
  assert.equal(
    Object.keys(HINT_WIRING_BATCH_CLUSTER).length,
    ONBOARDING_HINT_REGISTRY.length
  );
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
