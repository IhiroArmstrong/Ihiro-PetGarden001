/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertConfideSpeechProvider,
  createSpeechProvider,
  formatSpeechCaptureDiagnostics,
  mapSpeechFailureReason
} from './speechProvider.js';

describe('speechProvider', () => {
  it('forbids cloud STT at construction', () => {
    assert.throws(
      () => createSpeechProvider({ allowCloudStt: true }),
      /cloud_stt_not_implemented_in_slice0/
    );
    assert.throws(
      () => assertConfideSpeechProvider({ allowCloudStt: true }),
      /confide_cloud_stt_forbidden/
    );
  });

  it('maps on-device gate failure to a visible user message', () => {
    const message = mapSpeechFailureReason({ error: 'on_device_not_supported' });
    assert.match(message, /On-device English/);
  });

  it('formats capture diagnostics from helper json', () => {
    const text = formatSpeechCaptureDiagnostics({
      bufferCount: 42,
      peakRms: 0.0123,
      sampleRate: 48000
    });
    assert.match(text, /buffers=42/);
    assert.match(text, /peak=1\.23e-2/);
    assert.match(text, /48000Hz/);
  });

  it('maps empty audio tap to a visible user message', () => {
    const message = mapSpeechFailureReason({ error: 'audio_tap_empty' });
    assert.match(message, /no audio reached/i);
  });

  it('maps helper crash without JSON to a visible user message', () => {
    const message = mapSpeechFailureReason({
      error: 'helper_crashed',
      detail: 'exit_134'
    });
    assert.match(message, /Speech helper crashed/i);
    assert.match(message, /exit_134/);
  });

  it('refuses start when on-device gate fails (no silent cloud fallback)', async () => {
    const provider = createSpeechProvider({
      gateRunner: async () => ({
        ok: false,
        gatePassed: false,
        json: { ok: false, error: 'on_device_not_supported' },
        stderr: '',
        exitCode: 1
      })
    });
    const result = await provider.startListening();
    assert.equal(result.ok, false);
    assert.equal(result.status, 'error');
    assert.match(result.userMessage, /On-device English/);
  });

  it('runs speak → stop with mocked native transcribe', async () => {
    /** @type {import('node:child_process').ChildProcess | null} */
    let child = {
      stdin: { destroyed: false, write() {}, end() {} }
    };
    const provider = createSpeechProvider({
      gateRunner: async () => ({
        ok: true,
        gatePassed: true,
        json: {
          ok: true,
          onDeviceSupported: true,
          recognizerAvailable: true
        },
        stderr: '',
        exitCode: 0
      }),
      transcribeStarter: () => ({
        child,
        finished: Promise.resolve({
          ok: true,
          json: {
            ok: true,
            transcript: 'hello focus tiger',
            latencyMs: 1200,
            requiresOnDeviceRecognition: true
          },
          stderr: '',
          exitCode: 0
        })
      })
    });

    const start = await provider.startListening();
    assert.equal(start.ok, true);
    assert.equal(start.status, 'listening');

    const stop = await provider.stopListening();
    assert.equal(stop.ok, true);
    assert.equal(stop.transcript, 'hello focus tiger');
    assert.equal(stop.hypothesisShrunk, false);
    assert.equal(provider.snapshot().allowCloudStt, false);
  });

  it('forwards hypothesisShrunk when the helper kept a dropped prefix', async () => {
    const provider = createSpeechProvider({
      gateRunner: async () => ({
        ok: true,
        gatePassed: true,
        json: { ok: true, onDeviceSupported: true, recognizerAvailable: true },
        stderr: '',
        exitCode: 0
      }),
      transcribeStarter: () => ({
        child: { stdin: { destroyed: true, write() {}, end() {} }, kill() {} },
        finished: Promise.resolve({
          ok: true,
          json: {
            ok: true,
            transcript: 'kept the beginning of a long line',
            hypothesisShrunk: true
          },
          stderr: '',
          exitCode: 0
        })
      })
    });
    await provider.startListening();
    const stop = await provider.stopListening();
    assert.equal(stop.ok, true);
    assert.equal(stop.hypothesisShrunk, true);
  });

  it('returns ok with empty transcript when recognition yields no speech', async () => {
    const provider = createSpeechProvider({
      gateRunner: async () => ({
        ok: true,
        gatePassed: true,
        json: {
          ok: true,
          onDeviceSupported: true,
          recognizerAvailable: true
        },
        stderr: '',
        exitCode: 0
      }),
      transcribeStarter: () => ({
        child: { stdin: { destroyed: false, write() {}, end() {} } },
        finished: Promise.resolve({
          ok: true,
          json: {
            ok: true,
            transcript: '',
            latencyMs: 400,
            bufferCount: 18,
            peakRms: 0,
            sampleRate: 48000
          },
          stderr: '',
          exitCode: 0
        })
      })
    });
    await provider.startListening();
    const stop = await provider.stopListening();
    assert.equal(stop.ok, true);
    assert.equal(stop.transcript, '');
    assert.equal(stop.bufferCount, 18);
    assert.equal(stop.peakRms, 0);
    assert.equal(stop.sampleRate, 48000);
    assert.match(stop.captureDiagnostics, /buffers=18/);
    assert.match(stop.captureDiagnostics, /48000Hz/);
  });

  it('surfaces non-darwin as visible failure', async () => {
    const provider = createSpeechProvider({ platform: 'linux' });
    const gate = await provider.probeOnDeviceGate();
    assert.equal(gate.gatePassed, false);
    const start = await provider.startListening();
    assert.equal(start.ok, false);
    assert.match(start.userMessage, /macOS/);
  });
});
