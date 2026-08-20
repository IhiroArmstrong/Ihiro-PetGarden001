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
import { L0_MODEL_FILENAME, L0_MODEL_URLS } from './l0Config.js';
import { ensureGgufDownloaded } from './l0Download.js';
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
  let lastError = null;
  for (const url of L0_MODEL_URLS) {
    try {
      await emit({ event: 'status', phase: 'downloading', message: url });
      return await ensureGgufDownloaded(modelPath, url, {
        onProgress: ({ received, total }) => {
          void emit({
            event: 'progress',
            received,
            total: Number.isFinite(total) ? total : null
          });
        }
      });
    } catch (err) {
      lastError = err;
      await emit({
        event: 'status',
        phase: 'downloading',
        message: `download_fail ${errorMessage(err)}`
      });
    }
  }
  throw lastError || new Error('model_download_failed');
}

async function main() {
  const modelDir = defaultModelDir();
  const modelPath = path.join(modelDir, L0_MODEL_FILENAME);
  /** @type {null | { dispose: () => Promise<void>, generate: Function }} */
  let session = null;
  let chain = Promise.resolve();

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
    await emit({ event: 'unloaded' });
    await emit({ event: 'status', phase: 'idle' });
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
            const text = await session.generate(payload.prompt, {
              maxTokens: payload.maxTokens
            });
            await emit({ event: 'generated', id, text });
          } catch (err) {
            await emit({
              event: 'generate_error',
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
