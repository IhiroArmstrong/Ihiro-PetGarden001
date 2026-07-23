/**
 * Negative / positive smoke for rules-authority contradiction detection.
 * Proves the checker would catch the historical 「先问再 commit」vs「可自动 commit」class of drift.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RULE_AUTHORITY_TOPICS } from './rules-authority-registry.js';
import { runRulesAuthorityDocCheck } from './rules-authority-doc-check.js';

describe('rules-authority-registry', () => {
  it('defines git-agent-commit SSOT as regression-lock Commit 汇报', () => {
    const t = RULE_AUTHORITY_TOPICS.find((x) => x.id === 'git-agent-commit');
    assert.ok(t);
    assert.equal(t.ssotPath, '.cursor/rules/focus-tiger-regression-lock.mdc');
    assert.match(t.ssotSection, /Commit 汇报/);
  });

  it('flags「先问要不要 commit」as forbidden outside SSOT', () => {
    const t = RULE_AUTHORITY_TOPICS.find((x) => x.id === 'git-agent-commit');
    const bad = t.forbiddenOutsideSsot.find((f) => f.id === 'ask-before-every-commit');
    assert.ok(bad);
    assert.ok(bad.pattern.test('每次 commit 都要先询问用户'));
    assert.ok(bad.pattern.test('先问要不要 commit'));
    assert.ok(!bad.pattern.test('见 regression-lock「Commit 汇报与分支门禁」'));
  });

  it('flags invented N-approver merge rules', () => {
    const t = RULE_AUTHORITY_TOPICS.find((x) => x.id === 'git-merge-main');
    const bad = t.forbiddenOutsideSsot.find((f) => f.id === 'n-approvals-invented');
    assert.ok(bad);
    assert.ok(bad.pattern.test('须 2 名审批通过才能合并'));
  });

  it('repo scan currently passes (no live contradiction)', () => {
    assert.equal(runRulesAuthorityDocCheck(), true);
  });
});
