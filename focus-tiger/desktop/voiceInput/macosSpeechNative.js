/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Spawn the macOS Speech helper (Swift). Compiles once into a tiny .app
 * so TCC can attach microphone + speech-recognition usage strings.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SWIFT_SOURCE = path.join(__dirname, '..', 'native', 'macos-speech-helper.swift');
const OBJC_TRAP_SOURCE = path.join(__dirname, '..', 'native', 'macos-speech-exception-trap.m');
const OBJC_TRAP_HEADER = path.join(__dirname, '..', 'native', 'macos-speech-exception-trap.h');
const PLIST_SOURCE = path.join(__dirname, '..', 'native', 'macos-speech-helper-Info.plist');
const ENTITLEMENTS_SOURCE = path.join(__dirname, '..', 'entitlements.mac.plist');
const LAB_DIR = '/tmp/ft-l0-lab';

/**
 * @param {string} [labDir]
 * @returns {{
 *   appDir: string,
 *   macosDir: string,
 *   plistPath: string,
 *   binPath: string
 * }}
 */
export function macosSpeechHelperLayout(labDir = LAB_DIR) {
  const appDir = path.join(labDir, 'FocusTigerSpeechHelper.app');
  return {
    appDir,
    macosDir: path.join(appDir, 'Contents', 'MacOS'),
    plistPath: path.join(appDir, 'Contents', 'Info.plist'),
    binPath: path.join(appDir, 'Contents', 'MacOS', 'macos-speech-helper')
  };
}

/**
 * @returns {string}
 */
export function macosSpeechHelperPath() {
  return macosSpeechHelperLayout().binPath;
}

/**
 * @param {string[]} files
 * @returns {number}
 */
function newestMtimeMs(files) {
  return Math.max(
    0,
    ...files.filter((file) => fs.existsSync(file)).map((file) => fs.statSync(file).mtimeMs)
  );
}

/**
 * @returns {boolean}
 */
export function ensureMacosSpeechHelperBuilt() {
  if (process.platform !== 'darwin') return false;
  if (!fs.existsSync(SWIFT_SOURCE) || !fs.existsSync(PLIST_SOURCE) || !fs.existsSync(OBJC_TRAP_SOURCE)) {
    return false;
  }
  fs.mkdirSync(LAB_DIR, { recursive: true });
  const layout = macosSpeechHelperLayout();
  const sourceMtime = newestMtimeMs([
    SWIFT_SOURCE,
    PLIST_SOURCE,
    ENTITLEMENTS_SOURCE,
    OBJC_TRAP_SOURCE,
    OBJC_TRAP_HEADER
  ]);
  if (fs.existsSync(layout.binPath) && fs.statSync(layout.binPath).mtimeMs >= sourceMtime) {
    return true;
  }
  fs.mkdirSync(layout.macosDir, { recursive: true });
  fs.copyFileSync(PLIST_SOURCE, layout.plistPath);
  const compile = spawnSync(
    'swiftc',
    [
      '-O',
      '-import-objc-header',
      OBJC_TRAP_HEADER,
      '-o',
      layout.binPath,
      SWIFT_SOURCE,
      OBJC_TRAP_SOURCE,
      '-Xlinker',
      '-sectcreate',
      '-Xlinker',
      '__TEXT',
      '-Xlinker',
      '__info_plist',
      '-Xlinker',
      PLIST_SOURCE
    ],
    { encoding: 'utf8' }
  );
  if (compile.status !== 0) {
    throw new Error(
      compile.stderr?.trim() || compile.stdout?.trim() || 'swiftc_failed'
    );
  }
  if (fs.existsSync(ENTITLEMENTS_SOURCE)) {
    spawnSync(
      'codesign',
      [
        '--force',
        '--sign',
        '-',
        '--identifier',
        'com.twinsology.focus-tiger.speech-helper',
        '--entitlements',
        ENTITLEMENTS_SOURCE,
        layout.appDir
      ],
      { encoding: 'utf8' }
    );
  }
  return fs.existsSync(layout.binPath);
}

/**
 * @param {string} stdout
 * @param {number | null} code
 * @param {string} [stderr]
 * @returns {Record<string, unknown>}
 */
export function parseMacosSpeechHelperStdout(stdout, code, stderr = '') {
  const line = String(stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  /** @type {Record<string, unknown> | null} */
  let json = null;
  try {
    json = line ? JSON.parse(line) : null;
  } catch {
    return { ok: false, error: 'invalid_json', raw: line || String(stdout || '').trim() };
  }
  if (json && typeof json === 'object') {
    return json;
  }
  return {
    ok: false,
    error: 'helper_crashed',
    detail: String(stderr || '').trim() || `exit_${code ?? 'null'}`,
    exitCode: code
  };
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
    const child = spawn(macosSpeechHelperPath(), args, {
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
      const json = parseMacosSpeechHelperStdout(stdout, code, stderr);
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
    macosSpeechHelperPath(),
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
      const json = parseMacosSpeechHelperStdout(stdout, code, stderr);
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
