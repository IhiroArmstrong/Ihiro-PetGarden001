/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  attachOpenStage,
  classifyOpenShellError,
  decideOpenShellAttempt,
  formatOpenShellMetricsLine,
  recordOpenShellEvent,
  resetOpenShellMetricsForTests,
  snapshotOpenShellMetrics
} from '../e2e/helpers/open-shell-metrics.js';
import {
  emptyRetrySummary,
  formatRetrySummaryLine,
  tallyPlaywrightAttempt
} from '../e2e/helpers/open-shell-retry-reporter.js';

test('CI unhealthy preview aborts goto (would previously still page.goto 40s)', () => {
  assert.equal(
    decideOpenShellAttempt({ isCi: true, previewHealthy: false }),
    'abort_preview'
  );
  assert.equal(
    decideOpenShellAttempt({ isCi: true, previewHealthy: true }),
    'goto'
  );
  assert.equal(
    decideOpenShellAttempt({ isCi: false, previewHealthy: false }),
    'goto'
  );
});

test('classifyOpenShellError prefers ftOpenStage then message buckets', () => {
  const staged = attachOpenStage(new Error('Timeout 40000ms exceeded.'), 'goto_timeout');
  assert.equal(classifyOpenShellError(staged), 'goto_timeout');
  assert.equal(
    classifyOpenShellError(new Error('page.goto: Timeout 40000ms exceeded.')),
    'goto_timeout'
  );
  assert.equal(
    classifyOpenShellError(
      new Error('page.waitForFunction: Timeout 35000ms exceeded.')
    ),
    'app_ready_timeout'
  );
  assert.equal(
    classifyOpenShellError(
      new Error('Error: expect(locator).toBeVisible() failed\nLocator: locator(\'#btn-focus\')')
    ),
    'sit_invisible'
  );
  assert.equal(
    classifyOpenShellError(new Error('FT_OPEN_STAGE=preview_unhealthy :5199 did not answer')),
    'preview_unhealthy'
  );
});

test('recordOpenShellEvent fills searchable FT_E2E_OPEN_METRICS buckets', () => {
  resetOpenShellMetricsForTests();
  recordOpenShellEvent({ stage: 'preview_unhealthy', attempt: 0, ok: false });
  recordOpenShellEvent({ stage: 'ok', attempt: 1, ok: true, helperRetry: true });
  const snap = snapshotOpenShellMetrics();
  assert.equal(snap.preview_unhealthy, 1);
  assert.equal(snap.ok, 1);
  assert.equal(snap.helper_retry_ok, 1);
  assert.equal(snap.opens, 2);
  const line = formatOpenShellMetricsLine(snap);
  assert.match(line, /^FT_E2E_OPEN_METRICS /);
  assert.match(line, /"preview_unhealthy":1/);
});

test('tallyPlaywrightAttempt splits once-pass vs retry-pass vs hard-fail', () => {
  const summary = emptyRetrySummary();
  tallyPlaywrightAttempt(summary, { status: 'passed', retry: 0, maxRetries: 2 });
  tallyPlaywrightAttempt(summary, { status: 'failed', retry: 0, maxRetries: 2 });
  tallyPlaywrightAttempt(summary, { status: 'passed', retry: 1, maxRetries: 2 });
  tallyPlaywrightAttempt(summary, { status: 'failed', retry: 0, maxRetries: 2 });
  tallyPlaywrightAttempt(summary, { status: 'failed', retry: 1, maxRetries: 2 });
  tallyPlaywrightAttempt(summary, { status: 'failed', retry: 2, maxRetries: 2 });
  assert.equal(summary.passedOnce, 1);
  assert.equal(summary.retriedThenPassed, 1);
  assert.equal(summary.hardFailed, 1);
  assert.match(formatRetrySummaryLine(summary), /^FT_E2E_RETRY_SUMMARY /);
});
