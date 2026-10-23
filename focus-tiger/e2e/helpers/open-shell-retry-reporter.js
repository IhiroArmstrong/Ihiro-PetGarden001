/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Playwright reporter: first-pass vs retry-pass vs hard-fail.
 * Prints one searchable line: `FT_E2E_RETRY_SUMMARY`.
 * Job green with retries must not be read as healthy (2026-10-11 RCA).
 */

export function emptyRetrySummary() {
  return {
    passedOnce: 0,
    retriedThenPassed: 0,
    hardFailed: 0,
    skipped: 0
  };
}

/**
 * @param {{ passedOnce: number, retriedThenPassed: number, hardFailed: number, skipped: number }} summary
 * @param {{ status: string, retry: number, maxRetries: number }} result
 */
export function tallyPlaywrightAttempt(summary, result) {
  const status = result.status;
  if (status === 'skipped' || status === 'interrupted') {
    if (status === 'skipped' && (result.retry ?? 0) === 0) summary.skipped += 1;
    return;
  }
  if (status === 'passed') {
    if ((result.retry ?? 0) === 0) summary.passedOnce += 1;
    else summary.retriedThenPassed += 1;
    return;
  }
  if (status === 'failed' || status === 'timedOut') {
    const maxRetries = result.maxRetries ?? 0;
    if ((result.retry ?? 0) >= maxRetries) summary.hardFailed += 1;
  }
}

export function formatRetrySummaryLine(summary) {
  const shard = process.env.FT_SHARD || '';
  const visibilitySpec = process.env.FT_VISIBILITY_SPEC || '';
  return `FT_E2E_RETRY_SUMMARY ${JSON.stringify({ shard, visibilitySpec, ...summary })}`;
}

export default class OpenShellRetryReporter {
  constructor() {
    this.summary = emptyRetrySummary();
  }

  onTestEnd(test, result) {
    tallyPlaywrightAttempt(this.summary, {
      status: result.status,
      retry: result.retry ?? 0,
      maxRetries: test.retries ?? 0
    });
  }

  onEnd() {
    console.log(formatRetrySummaryLine(this.summary));
  }
}
