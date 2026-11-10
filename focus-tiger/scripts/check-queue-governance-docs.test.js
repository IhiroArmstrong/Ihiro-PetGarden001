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

  it('allows T96/T97 and T94 follow-up shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/PROCESS.md',
        'focus-tiger/docs/queue-governance-readme.md',
        'focus-tiger/docs/task-briefs/task-v2-recognition-four-knives.md',
        'focus-tiger/docs/task-briefs/task-t96-uncovered-language-help.md',
        'focus-tiger/docs/task-entries/t96-uncovered-language-help.md',
        'focus-tiger/docs/task-briefs/task-t97-crisis-annotator-qualification.md',
        'focus-tiger/docs/task-entries/t97-crisis-annotator-qualification.md',
        'focus-tiger/docs/task-entries/t98-confide-mount-off-inventory.md',
        'focus-tiger/docs/audit/findings/2026-11-08/confide-mount-off-entry-inventory.md',
        'focus-tiger/docs/issue-entries/docs-gov-plan-a-confide-inventory-2026-11-08.md',
        'focus-tiger/docs/tracker-entries/docs-gov-t94-followup.md',
        'focus-tiger/scripts/check-queue-governance-docs.js'
      ]),
      null
    );
  });

  it('allows T93/T94/T95 governance shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/PROCESS.md',
        'focus-tiger/docs/task-briefs/task-email-sign-in-p0.md',
        'focus-tiger/docs/task-entries/t93-email-sign-in-p0.md',
        'focus-tiger/docs/task-briefs/task-v2-recognition-four-knives.md',
        'focus-tiger/docs/task-entries/t94-v2-recognition-four-knives.md',
        'focus-tiger/docs/task-briefs/task-t95-electron-shell-upgrade.md',
        'focus-tiger/docs/task-entries/t95-electron-shell-upgrade.md',
        'focus-tiger/docs/tracker-entries/docs-gov-t93-t95-queue.md',
        'focus-tiger/docs/tracker-entries/docs-t93-brief-s4-lock.md',
        'focus-tiger/docs/audit/findings/2026-11-08/B2-testing-release-pm-findings.md',
        'focus-tiger/src/locales/localeSliceModules.js'
      ]),
      null
    );
  });

  it('allows T99 required-smoke-gate shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/PR_SMOKE_FAILURE_CLASSES.md',
        'focus-tiger/scripts/pr-smoke-path-routes.js',
        '.husky/pre-push',
        '.github/CODEOWNERS',
        '.cursor/rules/focus-tiger-pr-smoke-gates.mdc',
        'focus-tiger/src/core/a13SurfaceVisibility.js'
      ]),
      null
    );
  });

  it('allows T88 guided-meditation release-hardening shards with glossary', () => {
    assert.equal(
      queueGovernanceHotspotError([
        'focus-tiger/docs/GLOSSARY.md',
        'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
        'focus-tiger/docs/task-briefs/task-t88-guided-meditation-release-hardening.md',
        'focus-tiger/docs/task-entries/t88-guided-meditation-release-hardening.md',
        'focus-tiger/docs/tracker-entries/docs-t88-guided-meditation-release-hardening.md',
        'focus-tiger/docs/guided-meditation-source-inventory.md',
        'focus-tiger/scripts/check-guided-meditation-media-host.js',
        '.github/workflows/guided-media-host-release-gate.yml'
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
