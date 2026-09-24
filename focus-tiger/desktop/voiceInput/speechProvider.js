/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Speak-to-type provider abstraction (Slice 0: MacosSpeechProvider only).
 */

import {
  probeMacosOnDeviceGate,
  startMacosSpeechTranscribe
} from './macosSpeechNative.js';

/** @typedef {'idle' | 'listening' | 'transcribing' | 'done' | 'error'} VoiceInputStatus */

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isObject(value) {
  return value != null && typeof value === 'object';
}

/**
 * @param {Record<string, unknown>} json
 * @returns {string}
 */
export function mapSpeechFailureReason(json) {
  const error = String(json.error || 'unknown');
  switch (error) {
    case 'speech_authorization_denied':
      return 'Speech recognition permission was denied.';
    case 'microphone_authorization_denied':
      return 'Microphone permission was denied.';
    case 'on_device_not_supported':
      return 'On-device English speech recognition is not available on this Mac.';
    case 'recognizer_unavailable':
      return 'Speech recognition is unavailable right now.';
    case 'platform_not_darwin':
      return 'Voice Input probe requires macOS.';
    case 'helper_build_failed':
      return 'Could not build the macOS speech helper.';
    default:
      return json.detail
        ? `${error}: ${String(json.detail)}`
        : `Speech input failed (${error}).`;
  }
}

/**
 * @param {{
 *   allowCloudStt?: boolean,
 *   locale?: string,
 *   platform?: NodeJS.Platform,
 *   gateRunner?: typeof probeMacosOnDeviceGate,
 *   transcribeStarter?: typeof startMacosSpeechTranscribe
 * }} [opts]
 */
export function createSpeechProvider(opts = {}) {
  const allowCloudStt = opts.allowCloudStt === true;
  const locale = opts.locale || 'en-US';
  const platform = opts.platform || process.platform;
  const gateRunner = opts.gateRunner || probeMacosOnDeviceGate;
  const transcribeStarter = opts.transcribeStarter || startMacosSpeechTranscribe;

  if (allowCloudStt) {
    throw new Error('cloud_stt_not_implemented_in_slice0');
  }
  if (platform !== 'darwin') {
    return {
      allowCloudStt: false,
      locale,
      platform,
      status: /** @type {VoiceInputStatus} */ ('error'),
      async probeOnDeviceGate() {
        return {
          ok: false,
          gatePassed: false,
          json: { ok: false, error: 'platform_not_darwin' },
          stderr: 'platform_not_darwin',
          exitCode: 1
        };
      },
      async startListening() {
        return {
          ok: false,
          status: 'error',
          userMessage: mapSpeechFailureReason({ error: 'platform_not_darwin' })
        };
      },
      async stopListening() {
        return { ok: false, status: 'error', userMessage: 'Not listening.' };
      },
      snapshot() {
        return { status: 'error', locale, allowCloudStt: false };
      }
    };
  }

  /** @type {VoiceInputStatus} */
  let status = 'idle';
  /** @type {import('node:child_process').ChildProcess | null} */
  let activeChild = null;
  /** @type {Promise<{ ok: boolean, json: Record<string, unknown> | null, stderr: string, exitCode: number | null }> | null} */
  let activeFinished = null;
  let lastTranscript = '';
  let lastError = '';
  let listeningStartedAt = 0;

  return {
    allowCloudStt: false,
    locale,
    platform,
    get status() {
      return status;
    },
    async probeOnDeviceGate() {
      return gateRunner(locale);
    },
    async startListening() {
      if (status === 'listening') {
        return { ok: true, status: 'listening', userMessage: 'Already listening.' };
      }
      const gate = await gateRunner(locale);
      if (!gate.gatePassed) {
        status = 'error';
        lastError = mapSpeechFailureReason(
          isObject(gate.json) ? gate.json : { error: 'on_device_not_supported' }
        );
        return { ok: false, status: 'error', userMessage: lastError, gate };
      }

      const session = transcribeStarter(locale, 45);
      if (!session.child) {
        status = 'error';
        const pending = await session.finished;
        lastError = mapSpeechFailureReason(
          isObject(pending.json) ? pending.json : { error: 'helper_build_failed' }
        );
        return { ok: false, status: 'error', userMessage: lastError, gate };
      }

      activeChild = session.child;
      activeFinished = session.finished;
      status = 'listening';
      listeningStartedAt = Date.now();
      lastTranscript = '';
      lastError = '';
      return { ok: true, status: 'listening', gate };
    },
    async stopListening() {
      if (status !== 'listening' || !activeChild || !activeFinished) {
        return {
          ok: false,
          status,
          userMessage: status === 'idle' ? 'Tap Speak first.' : lastError || 'Not listening.'
        };
      }
      status = 'transcribing';
      if (!activeChild.stdin.destroyed) {
        activeChild.stdin.write('stop\n');
        activeChild.stdin.end();
      }
      const result = await activeFinished;
      activeChild = null;
      activeFinished = null;
      if (!result.ok || !isObject(result.json) || result.json.ok !== true) {
        status = 'error';
        lastError = mapSpeechFailureReason(
          isObject(result.json) ? result.json : { error: 'recognition_failed' }
        );
        return {
          ok: false,
          status: 'error',
          userMessage: lastError,
          result,
          listeningMs: Date.now() - listeningStartedAt
        };
      }
      lastTranscript = String(result.json.transcript || '');
      status = 'done';
      return {
        ok: true,
        status: 'done',
        transcript: lastTranscript,
        latencyMs: Number(result.json.latencyMs || 0),
        listeningMs: Date.now() - listeningStartedAt,
        result
      };
    },
    snapshot() {
      return {
        status,
        locale,
        allowCloudStt: false,
        transcript: lastTranscript,
        error: lastError || null,
        listeningStartedAt: listeningStartedAt || null
      };
    }
  };
}

/**
 * Confide path guard — construction-time, not a user toggle.
 *
 * @param {{ allowCloudStt?: boolean }} opts
 */
export function assertConfideSpeechProvider(opts = {}) {
  if (opts.allowCloudStt === true) {
    throw new Error('confide_cloud_stt_forbidden');
  }
}
