/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import {
  DEFAULT_FLOATING_MARKER_PREFS,
  normalizeFloatingMarkerPrefs
} from './floatingMarkerPolicy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SWIFT_SOURCE = path.join(__dirname, '..', 'native', 'floating-marker.swift');

/**
 * @param {string} [labDir]
 * @returns {{ binPath: string, dir: string }}
 */
export function floatingMarkerHelperLayout(labDir = path.join(os.tmpdir(), 'ft-floating-marker')) {
  return {
    dir: labDir,
    binPath: path.join(labDir, 'floating-marker')
  };
}

/**
 * @param {string} file
 * @returns {number}
 */
function mtimeMs(file) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * @returns {boolean}
 */
export function ensureFloatingMarkerHelperBuilt() {
  if (process.platform !== 'darwin') return false;
  if (!fs.existsSync(SWIFT_SOURCE)) return false;
  const layout = floatingMarkerHelperLayout();
  fs.mkdirSync(layout.dir, { recursive: true });
  if (fs.existsSync(layout.binPath) && mtimeMs(layout.binPath) >= mtimeMs(SWIFT_SOURCE)) {
    return true;
  }
  const compile = spawnSync(
    'swiftc',
    [
      '-O',
      '-framework',
      'AppKit',
      '-framework',
      'SwiftUI',
      '-framework',
      'QuartzCore',
      '-framework',
      'CoreGraphics',
      SWIFT_SOURCE,
      '-o',
      layout.binPath
    ],
    { encoding: 'utf8' }
  );
  if (compile.status !== 0) {
    throw new Error(compile.stderr?.trim() || compile.stdout?.trim() || 'swiftc_failed');
  }
  return fs.existsSync(layout.binPath);
}

/**
 * @param {string} userDataDir
 * @returns {string}
 */
export function floatingMarkerPrefsPath(userDataDir) {
  return path.join(userDataDir, 'floating-marker.json');
}

/**
 * @param {string} userDataDir
 * @returns {{ show: boolean, hideInFullScreen: boolean }}
 */
export function loadFloatingMarkerPrefs(userDataDir) {
  const file = floatingMarkerPrefsPath(userDataDir);
  try {
    return normalizeFloatingMarkerPrefs(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    return { ...DEFAULT_FLOATING_MARKER_PREFS };
  }
}

/**
 * @param {string} userDataDir
 * @param {{ show: boolean, hideInFullScreen: boolean }} prefs
 */
export function saveFloatingMarkerPrefs(userDataDir, prefs) {
  const next = normalizeFloatingMarkerPrefs(prefs);
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(floatingMarkerPrefsPath(userDataDir), `${JSON.stringify(next)}\n`);
  return next;
}

/**
 * @param {{
 *   userDataDir: string,
 *   onClicked?: () => void,
 *   onStateChange?: () => void,
 *   log?: (msg: string) => void
 * }} opts
 */
export function createFloatingMarkerRuntime(opts) {
  const userDataDir = opts.userDataDir;
  const log = opts.log || ((msg) => console.warn('[floating-marker]', msg));
  let prefs = loadFloatingMarkerPrefs(userDataDir);
  /** @type {import('node:child_process').ChildProcess | null} */
  let child = null;

  function sendConfigure() {
    if (!child || !child.stdin || child.killed) return;
    child.stdin.write(
      `${JSON.stringify({
        cmd: 'configure',
        show: prefs.show,
        hideInFullScreen: prefs.hideInFullScreen
      })}\n`
    );
  }

  function stopChild() {
    if (!child) return;
    try {
      child.stdin?.write(`${JSON.stringify({ cmd: 'quit' })}\n`);
    } catch {
      /* ignore */
    }
    try {
      child.kill();
    } catch {
      /* ignore */
    }
    child = null;
  }

  function startChild() {
    if (process.platform !== 'darwin') return;
    if (!prefs.show) {
      stopChild();
      return;
    }
    if (child && child.exitCode == null) {
      sendConfigure();
      return;
    }
    try {
      ensureFloatingMarkerHelperBuilt();
    } catch (err) {
      log(err instanceof Error ? err.message : String(err));
      prefs = saveFloatingMarkerPrefs(userDataDir, { ...prefs, show: false });
      opts.onStateChange?.();
      return;
    }
    const { binPath } = floatingMarkerHelperLayout();
    child = spawn(binPath, ['--embedded', `--parent-pid=${process.pid}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line) => {
      try {
        const row = JSON.parse(line);
        if (row && row.event === 'clicked') opts.onClicked?.();
      } catch {
        /* ignore non-JSON */
      }
    });
    child.on('exit', () => {
      child = null;
    });
    sendConfigure();
  }

  return {
    prefs: () => ({ ...prefs }),
    start() {
      startChild();
    },
    setShow(show) {
      prefs = saveFloatingMarkerPrefs(userDataDir, { ...prefs, show: Boolean(show) });
      startChild();
      opts.onStateChange?.();
      return prefs;
    },
    setHideInFullScreen(hideInFullScreen) {
      prefs = saveFloatingMarkerPrefs(userDataDir, {
        ...prefs,
        hideInFullScreen: Boolean(hideInFullScreen)
      });
      sendConfigure();
      opts.onStateChange?.();
      return prefs;
    },
    dispose() {
      stopChild();
    }
  };
}
