/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * System TTS provider abstraction (Slice 0: macOS AVSpeechSynthesizer only).
 */

import {
  probeMacosTtsGate,
  startMacosSpeechSpeak,
  stopMacosSpeechSpeak
} from '../voiceInput/macosSpeechNative.js';

/** @typedef {'idle' | 'speaking' | 'done' | 'error'} SystemTtsStatus */

export const SYSTEM_TTS_PROBE_SAMPLES = {
  'en-US': 'Return to a single breath.',
  'ja-JP': '一つの呼吸に戻りましょう。'
};

/**
 * @param {Record<string, unknown>} json
 * @returns {string}
 */
export function mapTtsFailureReason(json) {
  const error = String(json.error || 'unknown');
  switch (error) {
    case 'voice_unavailable':
      return 'No system voice is available for this language.';
    case 'empty_text':
      return 'Nothing to speak.';
    case 'platform_not_darwin':
      return 'System TTS probe requires macOS.';
    case 'helper_build_failed':
      return 'Could not build the macOS speech helper.';
    case 'speak_never_started':
      return 'Speech did not start within the expected window.';
    case 'helper_crashed':
      return json.detail
        ? `Speech helper crashed (${json.detail}).`
        : 'Speech helper crashed before finishing.';
    default:
      return json.detail
        ? `${error}: ${String(json.detail)}`
        : `System TTS failed (${error}).`;
  }
}

/**
 * @param {{
 *   locale?: string,
 *   startSpeak?: typeof startMacosSpeechSpeak,
 *   stopSpeak?: typeof stopMacosSpeechSpeak,
 *   probeGate?: typeof probeMacosTtsGate
 * }} [opts]
 */
export function createTtsProvider(opts = {}) {
  const defaultLocale = opts.locale || 'en-US';
  const startSpeakFn = opts.startSpeak || startMacosSpeechSpeak;
  const stopSpeakFn = opts.stopSpeak || stopMacosSpeechSpeak;
  const probeGateFn = opts.probeGate || probeMacosTtsGate;
  /** @type {SystemTtsStatus} */
  let status = 'idle';
  let activeLocale = defaultLocale;
  let lastError = '';
  let startLatencyMs = null;
  /** @type {import('node:child_process').ChildProcess | null} */
  let activeChild = null;
  /** @type {Promise<unknown> | null} */
  let activeFinished = null;

  return {
    async probeGate(locale = defaultLocale) {
      return probeGateFn(locale);
    },

    snapshot() {
      return {
        status,
        locale: activeLocale,
        error: lastError || null,
        startLatencyMs
      };
    },

    /**
     * @param {string} [locale]
     * @param {string} [text]
     */
    async speak(locale = defaultLocale, text) {
      if (status === 'speaking') {
        return {
          ok: false,
          status: 'error',
          userMessage: 'Already speaking.'
        };
      }

      const sample = text || SYSTEM_TTS_PROBE_SAMPLES[locale] || SYSTEM_TTS_PROBE_SAMPLES['en-US'];
      activeLocale = locale;
      lastError = '';
      startLatencyMs = null;
      status = 'speaking';

      const session = startSpeakFn(sample, locale);
      activeChild = session.child;
      activeFinished = session.finished;

      const started = await session.started;
      if (started?.phase === 'started') {
        startLatencyMs = Number(started.startLatencyMs) || null;
      } else if (started?.ok === false) {
        status = 'error';
        lastError = mapTtsFailureReason(started);
        activeChild = null;
        activeFinished = null;
        return {
          ok: false,
          status,
          userMessage: lastError,
          json: started
        };
      }

      const result = await session.finished;
      activeChild = null;
      activeFinished = null;

      if (!result.ok) {
        status = 'error';
        lastError = mapTtsFailureReason(result.json || {});
        return {
          ok: false,
          status,
          userMessage: lastError,
          json: result.json,
          startLatencyMs
        };
      }

      status = 'done';
      return {
        ok: true,
        status,
        locale,
        text: sample,
        startLatencyMs:
          Number(result.json?.startLatencyMs) || startLatencyMs || null,
        durationMs: Number(result.json?.durationMs) || null,
        phase: String(result.json?.phase || 'finished'),
        json: result.json
      };
    },

    async stop() {
      if (status !== 'speaking' || !activeChild) {
        return {
          ok: false,
          status,
          userMessage: 'Nothing is speaking.'
        };
      }

      stopSpeakFn(activeChild);
      const result = await (activeFinished || Promise.resolve({ ok: false, json: {} }));
      activeChild = null;
      activeFinished = null;
      status = result.ok ? 'done' : 'error';
      if (!result.ok) {
        lastError = mapTtsFailureReason(result.json || {});
      }
      return {
        ok: result.ok,
        status,
        userMessage: result.ok ? '' : lastError,
        phase: String(result.json?.phase || 'stopped'),
        startLatencyMs: Number(result.json?.startLatencyMs) || startLatencyMs,
        durationMs: Number(result.json?.durationMs) || null,
        json: result.json
      };
    }
  };
}
