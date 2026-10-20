/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isQueueGovernanceCoPrAllowed,
  queueGovernanceHotspotError
} from './check-queue-governance-docs.js';

describe('queueGovernanceHotspotError', () => {
  it('allows feature PR with no hotspot files', () => {
    assert.equal(
      queueGovernanceHotspotError(['focus-tiger/src/foo.js']),
      null
    );
  });

  it('allows governance-only PR touching hotspots', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/GLOSSARY_CHANGELOG.md'
      ]),
      null
    );
  });

  it('blocks mixed PR (hotspot + product code)', () => {
    const err = queueGovernanceHotspotError([
      'focus-tiger/docs/GLOSSARY.md',
      'focus-tiger/src/core/confide/foo.js'
    ]);
    assert.ok(err);
    assert.match(err, /GLOSSARY\.md/);
    assert.match(err, /治理/);
  });

  it('blocks mixed PR (hotspot + unrelated docs)', () => {
    const err = queueGovernanceHotspotError([
      'focus-tiger/docs/CONFIDE_NOW.md',
      'focus-tiger/docs/task-briefs/task-x.md'
    ]);
    assert.ok(err);
  });
});

describe('isQueueGovernanceCoPrAllowed', () => {
  it('allows changelog sidecar', () => {
    assert.equal(
      isQueueGovernanceCoPrAllowed('focus-tiger/docs/GLOSSARY_CHANGELOG.md'),
      true
    );
  });
});
