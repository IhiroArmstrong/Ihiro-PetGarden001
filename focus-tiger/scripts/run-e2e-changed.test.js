/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unit tests for local e2e changed hard budget (e2e-local-budget).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectSpecTargets,
  evaluateLocalChangedBudget
} from './run-e2e-changed.js';

describe('collectSpecTargets', () => {
  it('keeps a single *.spec.* and ignores flags', () => {
    assert.deepEqual(
      collectSpecTargets([
        'e2e/micro-ritual.spec.js',
        '--grep',
        'foo',
        '--reporter=line'
      ]),
      ['e2e/micro-ritual.spec.js']
    );
  });

  it('collects multiple specs', () => {
    assert.deepEqual(
      collectSpecTargets([
        'e2e/a.spec.js',
        'e2e/b.spec.ts',
        '--workers=1'
      ]),
      ['e2e/a.spec.js', 'e2e/b.spec.ts']
    );
  });

  it('treats bare e2e directory as a target', () => {
    assert.deepEqual(collectSpecTargets(['e2e/', '--grep', 'x']), ['e2e/']);
    assert.deepEqual(collectSpecTargets(['e2e']), ['e2e']);
  });
});

describe('evaluateLocalChangedBudget', () => {
  it('allows exactly one spec locally', () => {
    const d = evaluateLocalChangedBudget(['e2e/foo.spec.js'], {});
    assert.equal(d.allowed, true);
    assert.equal(d.reason, 'ok');
    assert.equal(d.bypassWarn, false);
  });

  it('blocks multiple specs locally', () => {
    const d = evaluateLocalChangedBudget(
      ['e2e/a.spec.js', 'e2e/b.spec.js'],
      {}
    );
    assert.equal(d.allowed, false);
    assert.equal(d.reason, 'multi');
  });

  it('blocks bare e2e directory locally', () => {
    const d = evaluateLocalChangedBudget(['e2e/'], {});
    assert.equal(d.allowed, false);
    assert.equal(d.reason, 'dir-or-nonspec');
  });

  it('blocks grep-only / empty path targets locally', () => {
    const d = evaluateLocalChangedBudget(['--grep', 'Arrival'], {});
    assert.equal(d.allowed, false);
    assert.equal(d.reason, 'empty');
  });

  it('allows multi-spec when CI=true', () => {
    const d = evaluateLocalChangedBudget(
      ['e2e/a.spec.js', 'e2e/b.spec.js'],
      { CI: 'true' }
    );
    assert.equal(d.allowed, true);
    assert.equal(d.reason, 'ci');
    assert.equal(d.bypassWarn, false);
  });

  it('allows multi-spec when RUN_E2E_LOCAL=true and sets bypassWarn', () => {
    const d = evaluateLocalChangedBudget(
      ['e2e/a.spec.js', 'e2e/b.spec.js', 'e2e/'],
      { RUN_E2E_LOCAL: 'true' }
    );
    assert.equal(d.allowed, true);
    assert.equal(d.reason, 'run-e2e-local');
    assert.equal(d.bypassWarn, true);
  });
});
