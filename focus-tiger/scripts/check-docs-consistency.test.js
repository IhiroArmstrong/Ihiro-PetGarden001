/**
 * Regression: browser-energy 「10 分钟」restated in PROCESS.md must fail;
 * path-pointer-only PROCESS lines and SSOT itself must pass.
 *
 * Historical drift (Prompt 1): downstream restated SSOT minutes → silent skew.
 * This test locks the guard so the checker cannot be neutered unnoticed.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROTECTED_KEYWORDS,
  lineHasProtectedNumericHit,
  matchClaimForLine,
  scanTextForConsistencyViolations,
  evaluateClaimHit,
  runDocsConsistencyCheck
} from './check-docs-consistency.js';

describe('docs-consistency protected keywords', () => {
  it('v1 table includes 限时 / 最长 / 不得超过 / 分钟 / 小时', () => {
    for (const k of ['限时', '最长', '不得超过', '分钟', '小时']) {
      assert.ok(PROTECTED_KEYWORDS.includes(k), `missing ${k}`);
    }
  });
});

describe('docs-consistency hit shaping', () => {
  it('requires policy binder + number-duration (avoids product「约 10 分钟」)', () => {
    assert.equal(lineHasProtectedNumericHit('无互动约 10 分钟自主挥手'), false);
    assert.equal(
      lineHasProtectedNumericHit('预览浏览器限时最长 10 分钟'),
      true
    );
  });

  it('maps browser-energy topic to claim', () => {
    const c = matchClaimForLine('预览浏览器限时最长 10 分钟');
    assert.ok(c);
    assert.equal(c.id, 'browser-energy-duration');
  });
});

describe('docs-consistency browser-energy historical case', () => {
  it('flags PROCESS.md restating「预览浏览器限时最长 10 分钟」', () => {
    const fakeProcess = [
      '# PROCESS',
      '',
      '> 预览浏览器限时最长 10 分钟，到期必须关闭。',
      ''
    ].join('\n');

    const hits = scanTextForConsistencyViolations(
      'focus-tiger/docs/PROCESS.md',
      fakeProcess
    );
    assert.equal(hits.length, 1);
    assert.equal(hits[0].claimId, 'browser-energy-duration');
    assert.match(hits[0].text, /预览浏览器限时最长 10 分钟/);
  });

  it('allows the same sentence only in browser-energy SSOT', () => {
    const line = '预览浏览器限时最长 10 分钟，到期必须关闭。';
    const ssotHit = evaluateClaimHit(
      '.cursor/rules/focus-tiger-browser-energy.mdc',
      1,
      line,
      matchClaimForLine(line)
    );
    assert.equal(ssotHit.ok, true);

    const processHit = evaluateClaimHit(
      'focus-tiger/docs/PROCESS.md',
      1,
      line,
      matchClaimForLine(line)
    );
    assert.equal(processHit.ok, false);
  });

  it('allows pointer-only PROCESS wording (no concrete minutes)', () => {
    const pointer = [
      '> 预览浏览器限时规则以 `.cursor/rules/focus-tiger-browser-energy.mdc` **当前生效条文**为准，本文档**不复述具体数值**。'
    ].join('\n');
    const hits = scanTextForConsistencyViolations(
      'focus-tiger/docs/PROCESS.md',
      pointer
    );
    assert.equal(hits.length, 0);
  });

  it('allows RULES_INDEX historical row when marked 已废止', () => {
    const hist =
      '| 2026-07-25 | **[已废止，见 SSOT 当前条文]** 新增 `browser-energy`：Cursor 内置 Browser 仅窄屏特例且最长 10 分钟 |';
    const hits = scanTextForConsistencyViolations(
      'focus-tiger/docs/RULES_INDEX.md',
      hist
    );
    assert.equal(hits.length, 0);
  });
});

describe('docs-consistency live repo', () => {
  it('current checkout passes runDocsConsistencyCheck', () => {
    assert.equal(runDocsConsistencyCheck(), true);
  });
});
