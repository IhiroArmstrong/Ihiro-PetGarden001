/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Long-lived Node child for L1/L2: download + load/hold + generate + unload.
 * NDJSON on stdout. Commands: ensure / unload / quit / generate {json}.
 */

import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES,
  L0_EMBEDDING_MODEL_URLS
} from './l0EmbeddingConfig.js';
import { L0_MODEL_FILENAME, L0_MODEL_URLS } from './l0Config.js';
import { ensureGgufDownloaded, isGgufCachedAt } from './l0Download.js';
import { errorMessage as embeddingErrorMessage, loadEmbeddingHold } from './l1EmbeddingHold.js';
import { errorMessage, loadModelHold } from './l1Hold.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function emit(obj) {
  return new Promise((resolve) => {
    process.stdout.write(`${JSON.stringify(obj)}\n`, () => resolve());
  });
}

function defaultModelDir() {
  if (process.env.FT_COMPANION_L1_MODEL_DIR) {
    return process.env.FT_COMPANION_L1_MODEL_DIR;
  }
  if (process.env.FT_COMPANION_L0_MODEL_DIR) {
    return process.env.FT_COMPANION_L0_MODEL_DIR;
  }
  if (process.platform === 'darwin') {
    return path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Focus Tiger',
      'companion-l0'
    );
  }
  return path.join(__dirname, '..', '.l0-cache');
}

async function downloadModel(modelPath) {
  const cached = isGgufCachedAt(modelPath);
  await emit({
    event: 'status',
    phase: 'loading',
    message: cached ? 'cached' : 'checking'
  });
  return ensureGgufDownloaded(modelPath, L0_MODEL_URLS, {
    onProgress: ({ received, total }) => {
      void emit({ event: 'status', phase: 'downloading' });
      void emit({
        event: 'progress',
        received,
        total: Number.isFinite(total) ? total : null
      });
    }
  });
}

async function main() {
  const modelDir = defaultModelDir();
  const modelPath = path.join(modelDir, L0_MODEL_FILENAME);
  /** @type {null | { dispose: () => Promise<void>, generate: Function }} */
  let session = null;
  /** @type {null | { dispose: () => Promise<void>, classifyUserText: Function }} */
  let embeddingSession = null;
  let chain = Promise.resolve();
  let shadowChain = Promise.resolve();

  async function ensure() {
    if (session) {
      await emit({ event: 'status', phase: 'ready' });
      await emit({ event: 'ready' });
      return;
    }
    const dl = await downloadModel(modelPath);
    await emit({
      event: 'status',
      phase: 'loading',
      message: dl.path
    });
    session = await loadModelHold({
      modelPath: dl.path,
      onProgress: (msg) => {
        void emit({ event: 'status', phase: 'loading', message: msg });
      }
    });
    await emit({ event: 'status', phase: 'ready' });
    await emit({ event: 'ready' });
  }

  async function unload() {
    if (session) {
      await emit({ event: 'status', phase: 'unloading' });
      try {
        await session.dispose();
      } catch (err) {
        await emit({ event: 'status', phase: 'unloading', message: errorMessage(err) });
      }
      session = null;
    }
    if (embeddingSession) {
      try {
        await embeddingSession.dispose();
      } catch (err) {
        await emit({
          event: 'status',
          phase: 'unloading',
          message: embeddingErrorMessage(err)
        });
      }
      embeddingSession = null;
    }
    await emit({ event: 'unloaded' });
    await emit({ event: 'status', phase: 'idle' });
  }

  async function ensureEmbedding() {
    if (embeddingSession) return;
    const embeddingPath = path.join(modelDir, L0_EMBEDDING_MODEL_FILENAME);
    const cached = isGgufCachedAt(embeddingPath, L0_EMBEDDING_MODEL_MIN_BYTES);
    await emit({
      event: 'status',
      phase: 'embedding_loading',
      message: cached ? 'embedding_cached' : 'embedding_checking'
    });
    const dl = await ensureGgufDownloaded(embeddingPath, L0_EMBEDDING_MODEL_URLS, {
      minBytes: L0_EMBEDDING_MODEL_MIN_BYTES,
      onProgress: () => {
        void emit({ event: 'status', phase: 'embedding_downloading' });
      }
    });
    embeddingSession = await loadEmbeddingHold({
      modelPath: dl.path,
      env: process.env,
      onProgress: (msg) => {
        void emit({ event: 'status', phase: 'embedding_loading', message: msg });
      }
    });
  }

  function enqueue(work) {
    chain = chain.then(work).catch(async (err) => {
      await emit({
        event: 'error',
        message: errorMessage(err)
      });
    });
    return chain;
  }

  function enqueueShadow(work) {
    shadowChain = shadowChain.then(work).catch(async (err) => {
      await emit({
        event: 'semantic_shadow_error',
        message: embeddingErrorMessage(err)
      });
    });
    return shadowChain;
  }

  process.stdin.setEncoding('utf8');
  let buffer = '';
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      if (line === 'ensure') {
        enqueue(ensure);
      } else if (line === 'unload') {
        enqueue(unload);
      } else if (line === 'quit') {
        enqueue(async () => {
          await unload();
          process.exit(0);
        });
      } else if (line.startsWith('generate ')) {
        enqueue(async () => {
          let payload = {};
          try {
            payload = JSON.parse(line.slice('generate '.length));
          } catch {
            await emit({
              event: 'generate_error',
              id: '',
              message: 'invalid_generate_payload'
            });
            return;
          }
          const id = typeof payload.id === 'string' ? payload.id : '';
          try {
            if (!session) await ensure();
            if (!session || typeof session.generate !== 'function') {
              throw new Error('companion_session_missing');
            }
            /** @type {{ ttftMs?: number, totalMs?: number, decodeMs?: number } | null} */
            let timing = null;
            const text = await session.generate(payload.prompt, {
              maxTokens: payload.maxTokens,
              onTiming(metrics) {
                timing = metrics;
              }
            });
            await emit({ event: 'generated', id, text, timing });
          } catch (err) {
            await emit({
              event: 'generate_error',
              id,
              message: errorMessage(err)
            });
          }
        });
      } else if (line.startsWith('semantic-shadow-classify ')) {
        enqueueShadow(async () => {
          let payload = {};
          try {
            payload = JSON.parse(line.slice('semantic-shadow-classify '.length));
          } catch {
            await emit({
              event: 'semantic_shadow_error',
              id: '',
              message: 'invalid_semantic_shadow_payload'
            });
            return;
          }
          const id = typeof payload.id === 'string' ? payload.id : '';
          const text = typeof payload.text === 'string' ? payload.text.trim() : '';
          const contextualText =
            typeof payload.contextualText === 'string'
              ? payload.contextualText.trim()
              : '';
          if (!text) {
            await emit({
              event: 'semantic_shadow_error',
              id,
              message: 'empty_text'
            });
            return;
          }
          const started = Date.now();
          try {
            await ensureEmbedding();
            if (!embeddingSession || typeof embeddingSession.classifyUserText !== 'function') {
              throw new Error('embedding_session_missing');
            }
            const result = await embeddingSession.classifyUserText(text);
            let withPrior = null;
            if (contextualText) {
              try {
                withPrior = await embeddingSession.classifyUserText(contextualText);
              } catch {
                withPrior = null;
              }
            }
            await emit({
              event: 'semantic_shadow_classified',
              id,
              bucket: result.bucket,
              scoreA: result.scoreA,
              scoreB: result.scoreB,
              diff: result.diff,
              grayMargin: result.grayMargin,
              topK: result.topK,
              embedMs: result.embedMs,
              bucketWithPrior: withPrior?.bucket ?? null,
              scoreAWithPrior: withPrior?.scoreA ?? null,
              scoreBWithPrior: withPrior?.scoreB ?? null,
              grayMarginWithPrior: withPrior?.grayMargin ?? null,
              embedMsWithPrior: withPrior?.embedMs ?? null,
              wallMs: Date.now() - started
            });
          } catch (err) {
            await emit({
              event: 'semantic_shadow_error',
              id,
              message: embeddingErrorMessage(err),
              wallMs: Date.now() - started
            });
          }
        });
      } else if (line.startsWith('classify-read-tool ')) {
        enqueue(async () => {
          let payload = {};
          try {
            payload = JSON.parse(line.slice('classify-read-tool '.length));
          } catch {
            await emit({
              event: 'classify_error',
              id: '',
              message: 'invalid_classify_payload'
            });
            return;
          }
          const id = typeof payload.id === 'string' ? payload.id : '';
          try {
            if (!session) await ensure();
            if (!session || typeof session.generate !== 'function') {
              throw new Error('companion_session_missing');
            }
            /** @type {{ ttftMs?: number, totalMs?: number, decodeMs?: number } | null} */
            let timing = null;
            const text = await session.generate(payload.prompt, {
              maxTokens: payload.maxTokens,
              onTiming(metrics) {
                timing = metrics;
              }
            });
            await emit({ event: 'classified', id, text, timing });
          } catch (err) {
            await emit({
              event: 'classify_error',
              id,
              message: errorMessage(err)
            });
          }
        });
      }
    }
  });
  process.stdin.resume();
  await emit({ event: 'status', phase: 'idle', message: 'l1_child_ready' });
}

main().catch(async (err) => {
  await emit({
    event: 'error',
    message: errorMessage(err)
  });
  process.exit(1);
});
