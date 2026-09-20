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
  isEmbeddingShadowPhase,
  parseCompanionNdjsonLine
} from './l1Status.js';
import {
  L2_GENERATE_TIMEOUT_MS,
  L2_MAX_TOKENS,
  L3_OBSERVE_RETRY_AVOID_CLICHE,
  buildCompanionL2Prompt,
  buildReflectionCompanionPrompt,
  isCompanionChatGenerateLine
} from './l2Persona.js';
import {
  priorRepeatableYinRepliesFromHistory,
  sanitizeCompanionL2Reply
} from './l2Sanitize.js';
import { L0_MAX_TOKENS, L0_MODEL_ID, L0_TOOL_CLASSIFY_TIMEOUT_MS } from './l0Config.js';
import { L0_SEMANTIC_SHADOW_TIMEOUT_MS } from './l0EmbeddingConfig.js';
import { resolveCompanionModelDir } from './l0Download.js';
import { retrieveYpeMemoriesForL3Generate } from './yinPersonalMemoryPersistence.js';
import { buildSemanticShadowTurnLogRecord } from './l1SemanticShadowLog.js';
import { createSemanticShadowEmbeddingGate } from './l1SemanticShadowEmbeddingGate.js';
import { pruneLocalConfideTurnsJsonl } from './confideTurnsJsonlPrune.js';

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
    /** @type {Map<string, (ev: object) => void>} */
    this._semanticShadowWaiters = new Map();
    /** @type {Map<string, (ev: object) => void>} */
    this._observeClicheWaiters = new Map();
    this._shadowQueue = Promise.resolve();
    this._embeddingShadowGate = createSemanticShadowEmbeddingGate();
    this._turnLogAppendCount = 0;
    this._lastTurnLogPruneMs = 0;
    void pruneLocalConfideTurnsJsonl(this.userDataDir);
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
      this._embeddingShadowGate.reset();
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
    if (ev.event === 'semantic_shadow_classified' || ev.event === 'semantic_shadow_error') {
      const id = typeof ev.id === 'string' ? ev.id : '';
      const resolve = this._semanticShadowWaiters.get(id);
      if (resolve) {
        this._semanticShadowWaiters.delete(id);
        resolve(ev);
      }
    }
    if (ev.event === 'observe_cliche_scored' || ev.event === 'observe_cliche_error') {
      const id = typeof ev.id === 'string' ? ev.id : '';
      const resolve = this._observeClicheWaiters.get(id);
      if (resolve) {
        this._observeClicheWaiters.delete(id);
        resolve(ev);
      }
    }
    if (ev.event === 'embedding_ready' || ev.event === 'embedding_error') {
      this._embeddingShadowGate.applyEvent(ev);
    }
    if (ev.event === 'status' && isEmbeddingShadowPhase(ev.phase)) {
      this._embeddingShadowGate.markLoading();
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
      for (const resolve of this._semanticShadowWaiters.values()) {
        resolve({
          event: 'semantic_shadow_error',
          message: ev.message || 'companion_error'
        });
      }
      this._semanticShadowWaiters.clear();
      for (const resolve of this._observeClicheWaiters.values()) {
        resolve({
          event: 'observe_cliche_error',
          message: ev.message || 'companion_error'
        });
      }
      this._observeClicheWaiters.clear();
      this._embeddingShadowGate.reset();
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
        FT_COMPANION_L1_MODEL_DIR: resolveCompanionModelDir({
          userDataDir: this.userDataDir
        })
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

  _modelTimingFromChildEvent(ev) {
    const timing = ev?.timing;
    if (!timing || typeof timing !== 'object') return null;
    const ttftMs = Number(timing.ttftMs);
    const totalMs = Number(timing.totalMs);
    const decodeMs = Number(timing.decodeMs);
    return {
      ttftMs: Number.isFinite(ttftMs) ? ttftMs : undefined,
      totalMs: Number.isFinite(totalMs) ? totalMs : undefined,
      decodeMs: Number.isFinite(decodeMs) ? decodeMs : undefined
    };
  }

  async generate(payload = {}) {
    const wallStarted = Date.now();
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
    const locale = typeof payload.locale === 'string' ? payload.locale : 'en';
    const observeWing =
      !isReflectionCompanion && !isCompanionChatGenerateLine(text);
    let retrievedSummaries = [];
    let promptBuildMs;
    let memoryRetrieveMsCaptured;
    if (isReflectionCompanion) {
      /* prompt rebuilt per attempt below */
    } else {
      if (!Array.isArray(this._ypeSessionMemoryIds)) this._ypeSessionMemoryIds = [];
      const memoryStarted = Date.now();
      const retrieved = await retrieveYpeMemoriesForL3Generate(this.userDataDir, text, {
        companionStyle: payload.companionStyle,
        sessionExcludeIds: this._ypeSessionMemoryIds,
        skipYpeOnSafety: Boolean(payload.skipYpeOnSafety)
      });
      const memoryRetrieveMs = Date.now() - memoryStarted;
      this._ypeSessionMemoryIds = [
        ...this._ypeSessionMemoryIds,
        ...retrieved.ids.filter((mid) => !this._ypeSessionMemoryIds.includes(mid))
      ];
      retrievedSummaries = retrieved.summaries;
      memoryRetrieveMsCaptured = memoryRetrieveMs;
    }

    const maxAttempts = observeWing ? 2 : 1;
    let sanitized = null;
    let raw = '';
    let ev = null;
    let lastReason = 'empty_or_banned';
    let sanitizeMs = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const id = randomUUID();
      /** @type {string} */
      let prompt;
      const promptStarted = Date.now();
      if (isReflectionCompanion) {
        prompt = buildReflectionCompanionPrompt({
          answers: reflectionAnswers,
          locale
        });
      } else {
        prompt = buildCompanionL2Prompt({
          text,
          locale,
          history: Array.isArray(payload.history) ? payload.history : [],
          memorySummaries: retrievedSummaries,
          patternInsights: Array.isArray(payload.patternInsights)
            ? payload.patternInsights
            : [],
          observeRetryHint: attempt > 0 ? L3_OBSERVE_RETRY_AVOID_CLICHE : ''
        });
      }
      promptBuildMs = Date.now() - promptStarted;
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
      ev = await this._queue;
      raw = ev?.event === 'generated' ? ev.text : '';
      const sanitizeStarted = Date.now();
      sanitized = sanitizeCompanionL2Reply(raw, {
        priorReplies: priorRepeatableYinRepliesFromHistory(payload.history),
        userText: text
      });
      sanitizeMs = Date.now() - sanitizeStarted;
      if (!sanitized) {
        lastReason = ev?.event === 'timeout' ? 'timeout' : ev?.message || 'empty_or_banned';
        break;
      }
      if (!observeWing) break;
      const cliche = await this._scoreObserveClicheReply(sanitized);
      if (!cliche.flagged) break;
      lastReason = 'observe_cliche';
      sanitized = null;
    }

    const model = this._modelTimingFromChildEvent(ev);
    const timing = {
      wallMs: Date.now() - wallStarted,
      promptBuildMs: typeof promptBuildMs === 'number' ? promptBuildMs : undefined,
      memoryRetrieveMs:
        typeof memoryRetrieveMsCaptured === 'number' ? memoryRetrieveMsCaptured : undefined,
      sanitizeMs,
      model
    };
    const record = {
      at: new Date().toISOString(),
      kind: 'l3_generate',
      locale: payload.locale || 'en',
      text,
      raw: String(raw || '').slice(0, 400),
      reply: sanitized,
      ok: Boolean(sanitized),
      reason: sanitized ? 'ok' : lastReason,
      timing
    };
    await this._appendTurnLog(record);
    if (!sanitized) return { ok: false, reason: record.reason, timing };
    return { ok: true, text: sanitized, timing };
  }

  /**
   * Score an observe reply against the cliché bank. Skip if embedding is not ready
   * so generate never waits on a cold download.
   * @param {string} reply
   * @returns {Promise<{ flagged: boolean, skipped?: boolean }>}
   */
  async _scoreObserveClicheReply(reply) {
    if (!this._embeddingShadowGate.isReady()) {
      return { flagged: false, skipped: true };
    }
    const id = randomUUID();
    this._queue = this._queue.then(async () => {
      const done = new Promise((resolve) => {
        this._observeClicheWaiters.set(id, resolve);
      });
      this._write(`score-observe-cliche ${JSON.stringify({ id, text: reply })}`);
      const timed = await Promise.race([
        done,
        new Promise((resolve) => {
          setTimeout(() => resolve({ event: 'timeout' }), 8_000);
        })
      ]);
      if (timed?.event === 'timeout') {
        this._observeClicheWaiters.delete(id);
      }
      return timed;
    });
    const scored = await this._queue;
    if (scored?.event === 'observe_cliche_scored' && scored.skipped) {
      return { flagged: false, skipped: true };
    }
    if (scored?.event === 'observe_cliche_scored') {
      return { flagged: Boolean(scored.flagged), skipped: false };
    }
    return { flagged: false, skipped: true };
  }

  /**
   * Regex-miss read hybrid: run constrained L0 JSON prompt; resolution stays in renderer.
   * @param {{ prompt?: string, userText?: string }} [payload]
   * @returns {Promise<{ ok: boolean, raw?: string, reason?: string }>}
   */
  async classifyReadTool(payload = {}) {
    const wallStarted = Date.now();
    if (!this.allowed) {
      return { ok: false, reason: 'unavailable' };
    }
    if (this.status.focusing) {
      return { ok: false, reason: 'focusing' };
    }
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
    const userText =
      typeof payload.userText === 'string'
        ? payload.userText.trim()
        : typeof payload.text === 'string'
          ? payload.text.trim()
          : '';
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
    const timing = {
      wallMs: Date.now() - wallStarted,
      model: this._modelTimingFromChildEvent(ev)
    };
    await this._appendTurnLog({
      at: new Date().toISOString(),
      kind: 'read_hybrid_classify',
      text: userText.slice(0, 400),
      promptChars: prompt.length,
      raw: raw.slice(0, 400),
      ok: Boolean(raw),
      timing
    });
    if (!raw) {
      return {
        ok: false,
        reason: ev?.event === 'timeout' ? 'timeout' : ev?.message || 'empty_or_unparsed',
        timing
      };
    }
    return { ok: true, raw, timing };
  }

  /**
   * Shadow-only semantic coarse classify. Never blocks production routing.
   * @param {{
   *   text?: string,
   *   contextualText?: string,
   *   hadPriorTurn?: boolean,
   *   route?: string,
   *   source?: string,
   *   literalCoarse?: string | null
   * }} [payload]
   * @returns {Promise<{ ok: boolean, queued?: boolean, reason?: string }>}
   */
  async semanticShadowClassify(payload = {}) {
    if (!this.allowed) {
      return { ok: false, reason: 'unavailable' };
    }
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    const contextualText =
      typeof payload.contextualText === 'string' ? payload.contextualText.trim() : '';
    const hadPriorTurn = Boolean(payload.hadPriorTurn) && Boolean(contextualText);
    const route = typeof payload.route === 'string' ? payload.route : '';
    const source = typeof payload.source === 'string' ? payload.source : '';
    const literalCoarse =
      typeof payload.literalCoarse === 'string' ? payload.literalCoarse : null;
    if (!text) return { ok: false, reason: 'empty_text' };

    void (this._shadowQueue = this._shadowQueue.then(() =>
      this._runSemanticShadowClassify({
        text,
        contextualText,
        hadPriorTurn,
        route,
        source,
        literalCoarse
      })
    ));
    return { ok: true, queued: true };
  }

  /**
   * @returns {Promise<{ ok: true } | { ok: false, reason: string, message?: string | null }>}
   */
  async _ensureShadowEmbeddingReady() {
    const gate = this._embeddingShadowGate;
    if (gate.isReady()) return { ok: true };
    if (gate.hasError()) {
      return {
        ok: false,
        reason: 'embed_unavailable',
        message: gate.snapshot().errorMessage
      };
    }

    const waitPromise = gate.waitForReady();
    if (gate.shouldRequestEnsure()) {
      if (!this.child) {
        this._spawnIfNeeded();
      }
      try {
        gate.markLoading();
        this._write('ensure-embedding');
      } catch {
        return { ok: false, reason: 'embed_failed' };
      }
    }

    const ready = await waitPromise;
    return ready.ok
      ? { ok: true }
      : {
          ok: false,
          reason: ready.reason || 'embed_unavailable',
          message: ready.message || null
        };
  }

  /**
   * @param {{
   *   text: string,
   *   contextualText: string,
   *   hadPriorTurn: boolean,
   *   route: string,
   *   source: string,
   *   literalCoarse: string | null
   * }} payload
   */
  async _runSemanticShadowClassify(payload) {
    const wallStarted = Date.now();
    const baseRecord = {
      text: payload.text,
      route: payload.route,
      source: payload.source,
      literalCoarse: payload.literalCoarse,
      hadPriorTurn: payload.hadPriorTurn,
      contextualText: payload.contextualText || null
    };

    if (!this.child) {
      this._spawnIfNeeded();
    }

    const readyResult = await this._ensureShadowEmbeddingReady();
    if (!readyResult.ok) {
      await this._appendTurnLog(
        buildSemanticShadowTurnLogRecord({
          ...baseRecord,
          ok: false,
          reason: readyResult.reason || 'embed_unavailable',
          semanticResult: null,
          timing: { wallMs: Date.now() - wallStarted }
        })
      );
      return;
    }

    const id = randomUUID();
    try {
      const done = new Promise((resolve) => {
        this._semanticShadowWaiters.set(id, resolve);
      });
      this._write(
        `semantic-shadow-classify ${JSON.stringify({
          id,
          text: payload.text,
          contextualText: payload.contextualText || ''
        })}`
      );
      const timed = await Promise.race([
        done,
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ event: 'timeout' }),
            L0_SEMANTIC_SHADOW_TIMEOUT_MS
          );
        })
      ]);
      if (timed?.event === 'timeout') {
        this._semanticShadowWaiters.delete(id);
      }

      if (timed?.event === 'semantic_shadow_classified') {
        const priorBucket = timed.bucketWithPrior;
        await this._appendTurnLog(
          buildSemanticShadowTurnLogRecord({
            ...baseRecord,
            ok: true,
            reason: 'ok',
            semanticResult: {
              bucket: String(timed.bucket || ''),
              scoreA: Number(timed.scoreA),
              scoreB: Number(timed.scoreB),
              grayMargin: Number(timed.grayMargin)
            },
            semanticResultWithPrior:
              typeof priorBucket === 'string' && priorBucket
                ? {
                    bucket: priorBucket,
                    scoreA: Number(timed.scoreAWithPrior),
                    scoreB: Number(timed.scoreBWithPrior),
                    grayMargin: Number(timed.grayMarginWithPrior ?? timed.grayMargin)
                  }
                : null,
            timing: {
              wallMs: Number(timed.wallMs) || Date.now() - wallStarted,
              embedMs: Number(timed.embedMs) || undefined,
              embedMsWithPrior: Number(timed.embedMsWithPrior) || undefined
            }
          })
        );
        return;
      }

      const reason =
        timed?.event === 'timeout'
          ? 'timeout'
          : timed?.message || 'embed_failed';
      await this._appendTurnLog(
        buildSemanticShadowTurnLogRecord({
          ...baseRecord,
          ok: false,
          reason,
          semanticResult: null,
          timing: { wallMs: Date.now() - wallStarted }
        })
      );
    } catch {
      await this._appendTurnLog(
        buildSemanticShadowTurnLogRecord({
          ...baseRecord,
          ok: false,
          reason: 'embed_failed',
          semanticResult: null,
          timing: { wallMs: Date.now() - wallStarted }
        })
      );
    }
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
      this._turnLogAppendCount += 1;
      const now = Date.now();
      const pruneDue =
        this._turnLogAppendCount % 25 === 0 ||
        now - this._lastTurnLogPruneMs > 6 * 60 * 60 * 1000;
      if (pruneDue) {
        this._lastTurnLogPruneMs = now;
        void pruneLocalConfideTurnsJsonl(this.userDataDir, now);
      }
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
