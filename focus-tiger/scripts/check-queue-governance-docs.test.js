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

  it('allows kb-live-gap machine block rewritten by docs:check', () => {
    assert.equal(
      isQueueGovernanceCoPrAllowed('focus-tiger/docs/kb-live-gap-audit.md'),
      true
    );
  });

  it('allows T67 gift-art lock and join-ledger Brief with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/CO_PRACTICE_GIFT_ART.md',
        'focus-tiger/docs/task-briefs/task-co-practice-session-join-ledger.md',
        'focus-tiger/docs/task-entries/t67-co-practice-session-join-ledger.md'
      ]),
      null
    );
  });

  it('allows T66 step2 shelved shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/GLOSSARY_CHANGELOG.md',
        'focus-tiger/docs/SCHEDULING_CHANGELOG.md',
        'focus-tiger/docs/task-briefs/task-mindflow-nebula-step2-embedding-presets.md',
        'focus-tiger/docs/task-entries/t66-mindflow-nebula-step2-embedding-presets.md',
        'focus-tiger/docs/tracker-entries/docs-t66-mindflow-nebula-step2-brief.md',
        'focus-tiger/docs/TEST_TRACKER.md'
      ]),
      null
    );
  });

  it('allows T66 mindflow nebula v0 task shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/task-briefs/task-mindflow-nebula-v0.md',
        'focus-tiger/docs/task-entries/t66-mindflow-nebula-v0.md'
      ]),
      null
    );
  });

  it('allows T80 co-practice research pack with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/CO_PRACTICE_POSITIONING.md',
        'focus-tiger/docs/drafts/co-practice-research-data-pack-v0.1.md',
        'focus-tiger/docs/task-briefs/task-co-practice-research-upload.md',
        'focus-tiger/docs/task-entries/t80-co-practice-research-pack.md',
        'focus-tiger/docs/tracker-entries/docs-t80-co-practice-research-pack.md'
      ]),
      null
    );
  });

  it('allows T79 contemplative inquiry Brief with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/CO_PRACTICE_POSITIONING.md',
        'focus-tiger/docs/task-briefs/task-t79-contemplative-inquiry.md',
        'focus-tiger/docs/task-entries/t79-contemplative-inquiry.md',
        'focus-tiger/docs/tracker-entries/docs-t79-contemplative-inquiry.md',
        'focus-tiger/docs/drafts/koan-parents-before-birth-copy-for-review-en.md',
        'focus-tiger/docs/drafts/koan-parents-before-birth-copy-locked-zh.md'
      ]),
      null
    );
  });

  it('allows T76 quiet-sit Brief with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/task-briefs/task-t76-cold-start-quiet-sit.md',
        'focus-tiger/docs/task-entries/t76-cold-start-quiet-sit.md',
        'focus-tiger/docs/tracker-entries/docs-t76-cold-start-quiet-sit.md'
      ]),
      null
    );
  });

  it('allows T67 gift-art grant Brief with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/CO_PRACTICE_GIFT_ART.md',
        'focus-tiger/docs/task-briefs/task-co-practice-gift-art-grant.md',
        'focus-tiger/docs/task-entries/t67-co-practice-gift-art-grant.md',
        'focus-tiger/docs/tracker-entries/docs-t67-co-practice-gift-art-grant.md'
      ]),
      null
    );
  });

  it('allows T73 second-knife / T74 / T75 shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/task-briefs/task-remember-respond-second-knife.md',
        'focus-tiger/docs/task-briefs/task-constrained-generation-pregen-pool.md',
        'focus-tiger/docs/adaptation-on-off-research-protocol.md',
        'focus-tiger/docs/task-entries/t74-constrained-generation-pregen-pool.md',
        'focus-tiger/docs/task-entries/t75-adaptation-on-off-protocol.md',
        'focus-tiger/docs/tracker-entries/docs-t73-t74-t75-governance.md'
      ]),
      null
    );
  });
});
