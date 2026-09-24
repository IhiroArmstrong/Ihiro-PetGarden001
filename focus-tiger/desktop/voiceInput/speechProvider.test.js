/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertConfideSpeechProvider,
  createSpeechProvider,
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
    assert.equal(provider.snapshot().allowCloudStt, false);
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
