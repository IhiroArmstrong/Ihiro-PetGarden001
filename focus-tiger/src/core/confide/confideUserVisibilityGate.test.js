import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canOpenConfidePanel,
  isConfideDevHarness,
  isConfideUserVisible
} from './confideUserVisibilityGate.js';

test('user-visible requires safety ok (currently closed)', () => {
  assert.equal(isConfideUserVisible(), false);
  assert.equal(isConfideUserVisible({ safetyOk: () => false }), false);
  assert.equal(isConfideUserVisible({ safetyOk: () => true }), true);
});

test('dev harness ?confide=1 does not imply user-visible', () => {
  assert.equal(isConfideDevHarness('?confide=1'), true);
  assert.equal(isConfideDevHarness('product=1&confide=1'), true);
  assert.equal(isConfideDevHarness('?product=1'), false);
  assert.equal(isConfideUserVisible(), false);
});

test('canOpenConfidePanel: harness OR user-visible', () => {
  assert.equal(canOpenConfidePanel({ search: '' }), false);
  assert.equal(canOpenConfidePanel({ search: '?confide=1' }), true);
  assert.equal(
    canOpenConfidePanel({ search: '', safetyOk: () => true }),
    true
  );
});
