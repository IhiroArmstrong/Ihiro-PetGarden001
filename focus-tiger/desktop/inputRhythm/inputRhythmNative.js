/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseInputRhythmStdoutLine } from '../../src/core/inputRhythmProtocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SWIFT_SOURCE = path.join(
  __dirname,
  '..',
  'native',
  'macos-input-rhythm-helper.swift'
);
const PLIST_SOURCE = path.join(
  __dirname,
  '..',
  'native',
  'macos-input-rhythm-helper-Info.plist'
);
const LAB_DIR = '/tmp/ft-input-rhythm-lab';

export function inputRhythmHelperLayout(labDir = LAB_DIR) {
  const appDir = path.join(labDir, 'FocusTigerRhythmHelper.app');
  return {
    appDir,
    macosDir: path.join(appDir, 'Contents', 'MacOS'),
    plistPath: path.join(appDir, 'Contents', 'Info.plist'),
    binPath: path.join(appDir, 'Contents', 'MacOS', 'macos-input-rhythm-helper')
  };
}

export function ensureInputRhythmHelperBuilt() {
  if (process.platform !== 'darwin') return false;
  if (!fs.existsSync(SWIFT_SOURCE) || !fs.existsSync(PLIST_SOURCE)) return false;
  fs.mkdirSync(LAB_DIR, { recursive: true });
  const layout = inputRhythmHelperLayout();
  const sourceMtime = Math.max(
    fs.statSync(SWIFT_SOURCE).mtimeMs,
    fs.statSync(PLIST_SOURCE).mtimeMs
  );
  if (fs.existsSync(layout.binPath) && fs.statSync(layout.binPath).mtimeMs >= sourceMtime) {
    return true;
  }
  fs.mkdirSync(layout.macosDir, { recursive: true });
  fs.copyFileSync(PLIST_SOURCE, layout.plistPath);
  const compile = spawnSync(
    'swiftc',
    [
      '-O',
      '-o',
      layout.binPath,
      SWIFT_SOURCE,
      '-framework',
      'AppKit',
      '-framework',
      'ApplicationServices',
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
  return compile.status === 0 && fs.existsSync(layout.binPath);
}

/**
 * @param {{
 *   onSample?: (sample: object) => void,
 *   onDenied?: (error: string) => void,
 *   onExit?: () => void
 * }} handlers
 */
export function spawnInputRhythmHelper(handlers = {}) {
  if (process.platform !== 'darwin') return null;
  if (!ensureInputRhythmHelperBuilt()) return null;
  const bin = inputRhythmHelperLayout().binPath;
  const child = spawn(bin, [], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let buffer = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const sample = parseInputRhythmStdoutLine(line);
      if (!sample) continue;
      if (sample.ok === false) handlers.onDenied?.(sample.error || 'denied');
      else handlers.onSample?.(sample);
    }
  });
  child.on('exit', () => handlers.onExit?.());
  return child;
}
