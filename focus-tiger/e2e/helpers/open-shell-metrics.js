/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CI-searchable open-shell buckets (Brief: waitForPreviewHealthy /
 * page.goto 40s / __FT_APP_READY__ 35s / #btn-focus 15s).
 * One JSON line per event + a process summary: `FT_E2E_OPEN_METRICS`.
 */

export const OPEN_SHELL_STAGES = Object.freeze([
  'preview_unhealthy',
  'goto_timeout',
  'app_ready_timeout',
  'sit_invisible',
  'other',
  'ok'
]);

/** @typedef {'preview_unhealthy'|'goto_timeout'|'app_ready_timeout'|'sit_invisible'|'other'|'ok'} OpenShellStage */

/**
 * CI preview probe failed → do not burn a 40s page.goto.
 * @param {{ isCi: boolean, previewHealthy: boolean }} opts
 * @returns {'abort_preview'|'goto'}
 */
export function decideOpenShellAttempt(opts) {
  if (opts.isCi && opts.previewHealthy === false) return 'abort_preview';
  return 'goto';
}

/**
 * @param {unknown} err
 * @param {OpenShellStage} stage
 * @returns {Error}
 */
export function attachOpenStage(err, stage) {
  const wrapped =
    err instanceof Error ? err : new Error(String(err ?? 'open shell error'));
  wrapped.ftOpenStage = stage;
  if (!wrapped.message.includes('FT_OPEN_STAGE=')) {
    wrapped.message = `FT_OPEN_STAGE=${stage} ${wrapped.message}`;
  }
  return wrapped;
}

/**
 * @param {unknown} err
 * @returns {OpenShellStage}
 */
export function classifyOpenShellError(err) {
  if (err && typeof err === 'object' && OPEN_SHELL_STAGES.includes(err.ftOpenStage)) {
    return err.ftOpenStage;
  }
  const msg = String(err?.message || err || '');
  const tagged = /FT_OPEN_STAGE=([a-z_]+)/.exec(msg);
  if (tagged && OPEN_SHELL_STAGES.includes(tagged[1])) return tagged[1];
  if (/preview_unhealthy|:5199 did not answer/i.test(msg)) return 'preview_unhealthy';
  if (/page\.goto|waiting until ["']domcontentloaded["']/i.test(msg)) {
    return 'goto_timeout';
  }
  if (/waitForFunction|__FT_APP_READY__/i.test(msg)) return 'app_ready_timeout';
  if (/#btn-focus|btn-focus/i.test(msg)) return 'sit_invisible';
  return 'other';
}

function emptyCounts() {
  return {
    preview_unhealthy: 0,
    goto_timeout: 0,
    app_ready_timeout: 0,
    sit_invisible: 0,
    other: 0,
    ok: 0,
    helper_retry_ok: 0,
    opens: 0
  };
}

const counts = emptyCounts();
let hooked = false;

function jobMeta() {
  return {
    shard: process.env.FT_SHARD || '',
    visibilitySpec: process.env.FT_VISIBILITY_SPEC || ''
  };
}

/**
 * @param {{ stage: OpenShellStage, attempt?: number, ok?: boolean, helperRetry?: boolean }} event
 */
export function recordOpenShellEvent(event) {
  counts.opens += 1;
  const stage = OPEN_SHELL_STAGES.includes(event.stage) ? event.stage : 'other';
  counts[stage] += 1;
  if (event.ok && event.helperRetry) counts.helper_retry_ok += 1;
  const line = {
    ...jobMeta(),
    stage,
    attempt: event.attempt ?? 0,
    ok: Boolean(event.ok)
  };
  console.log(`FT_E2E_OPEN_STAGE ${JSON.stringify(line)}`);
  ensureFlushHook();
}

export function snapshotOpenShellMetrics() {
  return { ...jobMeta(), ...counts };
}

export function formatOpenShellMetricsLine(snapshot = snapshotOpenShellMetrics()) {
  return `FT_E2E_OPEN_METRICS ${JSON.stringify(snapshot)}`;
}

export function flushOpenShellMetrics() {
  console.log(formatOpenShellMetricsLine());
}

function ensureFlushHook() {
  if (hooked) return;
  hooked = true;
  process.on('beforeExit', () => {
    flushOpenShellMetrics();
  });
}

export function resetOpenShellMetricsForTests() {
  Object.assign(counts, emptyCounts());
}
