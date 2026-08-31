/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron-main L1/L2 companion runtime: Node child + status fan-out + generate.
 * Focusing callers must unload.
 */

import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCompanionL1Allowed } from './l1Capability.js';
import {
  applyCompanionEvent,
  createCompanionStatus,
  parseCompanionNdjsonLine
} from './l1Status.js';
import {
  L2_GENERATE_TIMEOUT_MS,
  L2_MAX_TOKENS,
  buildCompanionL2Prompt,
  buildReflectionCompanionPrompt
} from './l2Persona.js';
import {
  priorGenerateRepliesFromHistory,
  sanitizeCompanionL2Reply
} from './l2Sanitize.js';
import { L0_MAX_TOKENS, L0_MODEL_ID, L0_TOOL_CLASSIFY_TIMEOUT_MS } from './l0Config.js';
import { retrieveYpeMemoriesForL3Generate } from './yinPersonalMemoryPersistence.js';

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
    /** @type {Map<string, (ev: object) => void>} */
    this._generateWaiters = new Map();
    /** @type {Map<string, (ev: object) => void>} */
    this._classifyWaiters = new Map();
  }

  snapshot() {
    const generateEnabled =
      this.allowed && this.status.phase === 'ready' && !this.status.focusing;
    return {
      ...this.status,
      allowed: this.allowed,
      generateEnabled,
      modelId: L0_MODEL_ID
    };
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
    if (ev.event === 'generated' || ev.event === 'generate_error') {
      const id = typeof ev.id === 'string' ? ev.id : '';
      const resolve = this._generateWaiters.get(id);
      if (resolve) {
        this._generateWaiters.delete(id);
        resolve(ev);
      }
    }
    if (ev.event === 'classified' || ev.event === 'classify_error') {
      const id = typeof ev.id === 'string' ? ev.id : '';
      const resolve = this._classifyWaiters.get(id);
      if (resolve) {
        this._classifyWaiters.delete(id);
        resolve(ev);
      }
    }
    if (ev.event === 'error') {
      const waiters = [...this._readyWaiters, ...this._unloadedWaiters];
      this._readyWaiters = [];
      this._unloadedWaiters = [];
      waiters.forEach((resolve) => resolve(this.snapshot()));
      for (const resolve of this._generateWaiters.values()) {
        resolve({ event: 'generate_error', message: ev.message || 'companion_error' });
      }
      this._generateWaiters.clear();
      for (const resolve of this._classifyWaiters.values()) {
        resolve({ event: 'classify_error', message: ev.message || 'companion_error' });
      }
      this._classifyWaiters.clear();
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

  /**
   * @param {{ text?: string, locale?: string, history?: unknown }} [payload]
   * @returns {Promise<{ ok: boolean, text?: string, reason?: string }>}
   */
  async generate(payload = {}) {
    if (!this.allowed) {
      return { ok: false, reason: 'unavailable' };
    }
    if (this.status.focusing) {
      return { ok: false, reason: 'focusing' };
    }
    const purpose =
      typeof payload.purpose === 'string' ? payload.purpose.trim() : '';
    const isReflectionCompanion = purpose === 'reflection_companion';
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    const reflectionAnswers =
      payload.reflectionAnswers &&
      typeof payload.reflectionAnswers === 'object' &&
      !Array.isArray(payload.reflectionAnswers)
        ? payload.reflectionAnswers
        : {};
    if (!isReflectionCompanion && !text) return { ok: false, reason: 'empty' };
    if (
      isReflectionCompanion &&
      !Object.values(reflectionAnswers).some(
        (row) => typeof row === 'string' && row.trim()
      )
    ) {
      return { ok: false, reason: 'empty_reflection' };
    }
    const ready = await this.ensureReady();
    if (!ready.ok || this.status.phase !== 'ready') {
      return { ok: false, reason: ready.reason || 'not_ready' };
    }
    const id = randomUUID();
    const locale = typeof payload.locale === 'string' ? payload.locale : 'en';
    /** @type {string} */
    let prompt;
    if (isReflectionCompanion) {
      prompt = buildReflectionCompanionPrompt({
        answers: reflectionAnswers,
        locale
      });
    } else {
      if (!Array.isArray(this._ypeSessionMemoryIds)) this._ypeSessionMemoryIds = [];
      const retrieved = await retrieveYpeMemoriesForL3Generate(this.userDataDir, text, {
        companionStyle: payload.companionStyle,
        sessionExcludeIds: this._ypeSessionMemoryIds,
        skipYpeOnSafety: Boolean(payload.skipYpeOnSafety)
      });
      this._ypeSessionMemoryIds = [
        ...this._ypeSessionMemoryIds,
        ...retrieved.ids.filter((mid) => !this._ypeSessionMemoryIds.includes(mid))
      ];
      prompt = buildCompanionL2Prompt({
        text,
        locale,
        history: Array.isArray(payload.history) ? payload.history : [],
        memorySummaries: retrieved.summaries,
        patternInsights: Array.isArray(payload.patternInsights)
          ? payload.patternInsights
          : []
      });
    }
    this._queue = this._queue.then(async () => {
      const done = new Promise((resolve) => {
        this._generateWaiters.set(id, resolve);
      });
      this._write(
        `generate ${JSON.stringify({ id, prompt, maxTokens: L2_MAX_TOKENS })}`
      );
      const timed = await Promise.race([
        done,
        new Promise((resolve) => {
          setTimeout(() => resolve({ event: 'timeout' }), L2_GENERATE_TIMEOUT_MS);
        })
      ]);
      if (timed?.event === 'timeout') {
        this._generateWaiters.delete(id);
      }
      return timed;
    });
    const ev = await this._queue;
    const raw = ev?.event === 'generated' ? ev.text : '';
    const sanitized = sanitizeCompanionL2Reply(raw, {
      priorReplies: priorGenerateRepliesFromHistory(payload.history)
    });
    const record = {
      at: new Date().toISOString(),
      locale: payload.locale || 'en',
      text,
      raw: String(raw || '').slice(0, 400),
      reply: sanitized,
      ok: Boolean(sanitized),
      reason: sanitized ? 'ok' : ev?.event === 'timeout' ? 'timeout' : ev?.message || 'empty_or_banned'
    };
    await this._appendTurnLog(record);
    if (!sanitized) return { ok: false, reason: record.reason };
    return { ok: true, text: sanitized };
  }

  /**
   * Regex-miss read hybrid: run constrained L0 JSON prompt; resolution stays in renderer.
   * @param {{ prompt?: string }} [payload]
   * @returns {Promise<{ ok: boolean, raw?: string, reason?: string }>}
   */
  async classifyReadTool(payload = {}) {
    if (!this.allowed) {
      return { ok: false, reason: 'unavailable' };
    }
    if (this.status.focusing) {
      return { ok: false, reason: 'focusing' };
    }
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
    if (!prompt) return { ok: false, reason: 'empty_prompt' };
    const ready = await this.ensureReady();
    if (!ready.ok || this.status.phase !== 'ready') {
      return { ok: false, reason: ready.reason || 'not_ready' };
    }
    const id = randomUUID();
    this._queue = this._queue.then(async () => {
      const done = new Promise((resolve) => {
        this._classifyWaiters.set(id, resolve);
      });
      this._write(
        `classify-read-tool ${JSON.stringify({
          id,
          prompt,
          maxTokens: L0_MAX_TOKENS
        })}`
      );
      const timed = await Promise.race([
        done,
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ event: 'timeout' }),
            L0_TOOL_CLASSIFY_TIMEOUT_MS
          );
        })
      ]);
      if (timed?.event === 'timeout') {
        this._classifyWaiters.delete(id);
      }
      return timed;
    });
    const ev = await this._queue;
    const raw = ev?.event === 'classified' ? String(ev.text || '') : '';
    if (!raw) {
      return {
        ok: false,
        reason: ev?.event === 'timeout' ? 'timeout' : ev?.message || 'empty_or_unparsed'
      };
    }
    return { ok: true, raw };
  }

  /**
   * @param {object} record
   */
  async _appendTurnLog(record) {
    try {
      const dir = path.join(this.userDataDir, 'companion-l2');
      await mkdir(dir, { recursive: true });
      await appendFile(
        path.join(dir, 'turns.jsonl'),
        `${JSON.stringify(record)}\n`,
        'utf8'
      );
    } catch {
      /* local log must not break Share */
    }
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
