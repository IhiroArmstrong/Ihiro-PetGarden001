/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron-main L1 companion runtime: Node child + status fan-out.
 * No generate IPC. Focusing callers must unload.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCompanionL1Allowed } from './l1Capability.js';
import {
  applyCompanionEvent,
  createCompanionStatus,
  parseCompanionNdjsonLine
} from './l1Status.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {{
 *   isPackaged?: boolean,
 *   execPath?: string,
 *   env?: NodeJS.ProcessEnv
 * }} opts
 */
export function resolveCompanionNodeSpawn(opts = {}) {
  const env = { ...(opts.env || process.env) };
  const childPath = path.join(__dirname, 'l1Child.js');
  const override = env.FT_COMPANION_L1_NODE || env.FT_COMPANION_L0_NODE;
  if (override) {
    return { command: override, args: [childPath], env };
  }
  if (opts.isPackaged) {
    return {
      command: opts.execPath || process.execPath,
      args: [childPath],
      env: { ...env, ELECTRON_RUN_AS_NODE: '1' }
    };
  }
  return { command: 'node', args: [childPath], env };
}

export class CompanionL1Runtime {
  /**
   * @param {{
   *   userDataDir: string,
   *   getWebContents: () => import('electron').WebContents | null,
   *   totalMemBytes: number,
   *   env?: NodeJS.ProcessEnv,
   *   isPackaged?: boolean,
   *   execPath?: string
   * }} opts
   */
  constructor(opts) {
    this.userDataDir = opts.userDataDir;
    this.getWebContents = opts.getWebContents;
    this.env = opts.env || process.env;
    this.isPackaged = Boolean(opts.isPackaged);
    this.execPath = opts.execPath || process.execPath;
    this.allowed = isCompanionL1Allowed({
      totalMemBytes: opts.totalMemBytes,
      env: this.env
    });
    this.status = createCompanionStatus();
    /** @type {import('node:child_process').ChildProcess | null} */
    this.child = null;
    this._queue = Promise.resolve();
    this._readyWaiters = [];
    this._unloadedWaiters = [];
  }

  snapshot() {
    return { ...this.status, allowed: this.allowed, generateEnabled: false };
  }

  /**
   * @param {object} ev
   */
  _apply(ev) {
    this.status = applyCompanionEvent(this.status, ev);
    if (ev.event === 'ready') {
      const waiters = this._readyWaiters;
      this._readyWaiters = [];
      waiters.forEach((resolve) => resolve(this.snapshot()));
    }
    if (ev.event === 'unloaded') {
      const waiters = this._unloadedWaiters;
      this._unloadedWaiters = [];
      waiters.forEach((resolve) => resolve(this.snapshot()));
    }
    if (ev.event === 'error') {
      const waiters = [...this._readyWaiters, ...this._unloadedWaiters];
      this._readyWaiters = [];
      this._unloadedWaiters = [];
      waiters.forEach((resolve) => resolve(this.snapshot()));
    }
    this._push();
  }

  _push() {
    const wc = this.getWebContents?.();
    if (!wc || wc.isDestroyed?.()) return;
    wc.send('desktop:companion-status', this.snapshot());
  }

  _spawnIfNeeded() {
    if (this.child && !this.child.killed) return;
    const spawnSpec = resolveCompanionNodeSpawn({
      isPackaged: this.isPackaged,
      execPath: this.execPath,
      env: {
        ...this.env,
        FT_COMPANION_L1_MODEL_DIR: path.join(this.userDataDir, 'companion-l0')
      }
    });
    const child = spawn(spawnSpec.command, spawnSpec.args, {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: spawnSpec.env
    });
    this.child = child;
    let buffer = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        const ev = parseCompanionNdjsonLine(line);
        if (ev) this._apply(ev);
      }
    });
    child.on('exit', () => {
      if (this.child === child) this.child = null;
      if (this.status.phase !== 'idle' && this.status.phase !== 'error') {
        this._apply({ event: 'unloaded' });
      }
    });
  }

  _write(command) {
    this._spawnIfNeeded();
    const child = this.child;
    if (!child || !child.stdin || child.stdin.destroyed) {
      throw new Error('companion_child_unavailable');
    }
    child.stdin.write(`${command}\n`);
  }

  /**
   * @returns {Promise<object>}
   */
  ensureReady() {
    if (!this.allowed) {
      return Promise.resolve({ ok: false, reason: 'unavailable', ...this.snapshot() });
    }
    if (this.status.focusing) {
      return Promise.resolve({ ok: false, reason: 'focusing', ...this.snapshot() });
    }
    this._queue = this._queue.then(async () => {
      const ready = new Promise((resolve) => {
        this._readyWaiters.push(resolve);
      });
      this._write('ensure');
      return ready;
    });
    return this._queue.then((snap) => ({ ok: true, ...snap }));
  }

  /**
   * @returns {Promise<object>}
   */
  unload() {
    if (!this.allowed) {
      return Promise.resolve({ ok: true, reason: 'unavailable', ...this.snapshot() });
    }
    if (!this.child) {
      this.status = applyCompanionEvent(this.status, { event: 'unloaded' });
      this._push();
      return Promise.resolve({ ok: true, ...this.snapshot() });
    }
    this._queue = this._queue.then(async () => {
      const done = new Promise((resolve) => {
        this._unloadedWaiters.push(resolve);
      });
      this._write('unload');
      return done;
    });
    return this._queue.then((snap) => ({ ok: true, ...snap }));
  }

  /**
   * @param {boolean} focusing
   * @returns {Promise<object>}
   */
  async setFocusing(focusing) {
    this.status = { ...this.status, focusing: Boolean(focusing), generateEnabled: false };
    if (focusing) {
      const result = await this.unload();
      return { ...result, focusing: true };
    }
    this._push();
    return { ok: true, ...this.snapshot() };
  }

  async dispose() {
    if (this.child && this.child.stdin && !this.child.stdin.destroyed) {
      try {
        this.child.stdin.write('quit\n');
      } catch {
        /* ignore */
      }
    }
    if (this.child) {
      this.child.kill();
      this.child = null;
    }
  }
}
