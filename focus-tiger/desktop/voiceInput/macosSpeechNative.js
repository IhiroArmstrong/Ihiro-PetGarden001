/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Spawn the macOS Speech helper (Swift). Compiles once to /tmp/ft-l0-lab/.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SWIFT_SOURCE = path.join(__dirname, '..', 'native', 'macos-speech-helper.swift');
const LAB_DIR = '/tmp/ft-l0-lab';
const HELPER_BIN = path.join(LAB_DIR, 'macos-speech-helper');

/**
 * @returns {string}
 */
export function macosSpeechHelperPath() {
  return HELPER_BIN;
}

/**
 * @returns {boolean}
 */
export function ensureMacosSpeechHelperBuilt() {
  if (process.platform !== 'darwin') return false;
  if (!fs.existsSync(SWIFT_SOURCE)) return false;
  fs.mkdirSync(LAB_DIR, { recursive: true });
  const sourceStat = fs.statSync(SWIFT_SOURCE);
  if (fs.existsSync(HELPER_BIN)) {
    const binStat = fs.statSync(HELPER_BIN);
    if (binStat.mtimeMs >= sourceStat.mtimeMs) return true;
  }
  const compile = spawnSync(
    'swiftc',
    ['-O', '-o', HELPER_BIN, SWIFT_SOURCE],
    { encoding: 'utf8' }
  );
  if (compile.status !== 0) {
    throw new Error(
      compile.stderr?.trim() || compile.stdout?.trim() || 'swiftc_failed'
    );
  }
  return fs.existsSync(HELPER_BIN);
}

/**
 * @param {string[]} args
 * @param {{ stdin?: string, timeoutMs?: number, keepStdinOpen?: boolean }} [opts]
 * @returns {Promise<{
 *   ok: boolean,
 *   json: Record<string, unknown> | null,
 *   stderr: string,
 *   exitCode: number | null,
 *   child?: import('node:child_process').ChildProcess
 * }>}
 */
export function runMacosSpeechHelper(args, opts = {}) {
  if (process.platform !== 'darwin') {
    return Promise.resolve({
      ok: false,
      json: { ok: false, error: 'platform_not_darwin' },
      stderr: 'platform_not_darwin',
      exitCode: 1
    });
  }
  if (!ensureMacosSpeechHelperBuilt()) {
    return Promise.resolve({
      ok: false,
      json: { ok: false, error: 'helper_build_failed' },
      stderr: 'helper_build_failed',
      exitCode: 1
    });
  }

  return new Promise((resolve) => {
    const child = spawn(HELPER_BIN, args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    /** @type {NodeJS.Timeout | null} */
    let timer = null;
    if (opts.timeoutMs && opts.timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill('SIGTERM');
      }, opts.timeoutMs);
    }
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    if (opts.stdin) {
      child.stdin.write(opts.stdin);
      if (!opts.keepStdinOpen && !child.stdin.destroyed) {
        child.stdin.end();
      }
    }
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      const line = stdout.trim().split('\n').filter(Boolean).pop() || '';
      /** @type {Record<string, unknown> | null} */
      let json = null;
      try {
        json = line ? JSON.parse(line) : null;
      } catch {
        json = { ok: false, error: 'invalid_json', raw: line || stdout.trim() };
      }
      resolve({
        ok: code === 0 && json?.ok !== false,
        json,
        stderr: stderr.trim(),
        exitCode: code
      });
    });
    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      resolve({
        ok: false,
        json: { ok: false, error: err.message },
        stderr: err.message,
        exitCode: 1
      });
    });
  });
}

/**
 * @param {string} [locale]
 */
export async function probeMacosOnDeviceGate(locale = 'en-US') {
  const result = await runMacosSpeechHelper(['gate', '--locale', locale], {
    timeoutMs: 15_000
  });
  return {
    ...result,
    gatePassed:
      result.ok &&
      result.json?.onDeviceSupported === true &&
      result.json?.recognizerAvailable === true
  };
}

/**
 * @param {string} locale
 * @param {number} maxSeconds
 */
export function startMacosSpeechTranscribe(locale = 'en-US', maxSeconds = 30) {
  if (process.platform !== 'darwin') {
    return {
      child: null,
      finished: Promise.resolve({
        ok: false,
        json: { ok: false, error: 'platform_not_darwin' },
        stderr: 'platform_not_darwin',
        exitCode: 1
      })
    };
  }
  if (!ensureMacosSpeechHelperBuilt()) {
    return {
      child: null,
      finished: Promise.resolve({
        ok: false,
        json: { ok: false, error: 'helper_build_failed' },
        stderr: 'helper_build_failed',
        exitCode: 1
      })
    };
  }

  const child = spawn(
    HELPER_BIN,
    ['transcribe', '--locale', locale, '--max-seconds', String(maxSeconds)],
    { stdio: ['pipe', 'pipe', 'pipe'] }
  );
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const finished = new Promise((resolve) => {
    child.on('close', (code) => {
      const line = stdout.trim().split('\n').filter(Boolean).pop() || '';
      /** @type {Record<string, unknown> | null} */
      let json = null;
      try {
        json = line ? JSON.parse(line) : null;
      } catch {
        json = { ok: false, error: 'invalid_json', raw: line || stdout.trim() };
      }
      resolve({
        ok: code === 0 && json?.ok !== false,
        json,
        stderr: stderr.trim(),
        exitCode: code
      });
    });
    child.on('error', (err) => {
      resolve({
        ok: false,
        json: { ok: false, error: err.message },
        stderr: err.message,
        exitCode: 1
      });
    });
  });

  return { child, finished };
}
