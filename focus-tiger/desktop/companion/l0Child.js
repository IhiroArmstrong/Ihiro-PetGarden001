/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Node child used by Electron main (avoids Electron native ABI).
 * NDJSON on stdout. Progress on stderr.
 *
 * Protocol: print `{event:ready}` after load, wait for `go\n` on stdin,
 * then generate + unload and print `{event:done, report}`.
 */

import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_MODEL_FILENAME, L0_MODEL_URLS } from './l0Config.js';
import { ensureGgufDownloaded } from './l0Download.js';
import { runL0Inference } from './l0Probe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function emit(obj) {
  return new Promise((resolve) => {
    process.stdout.write(`${JSON.stringify(obj)}\n`, () => resolve());
  });
}

function waitForGo(timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('hold_timeout')), timeoutMs);
    const onData = (buf) => {
      if (String(buf).includes('go')) {
        clearTimeout(timer);
        process.stdin.off('data', onData);
        resolve();
      }
    };
    process.stdin.on('data', onData);
    process.stdin.resume();
  });
}

function defaultModelDir() {
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

async function main() {
  const modelDir = defaultModelDir();
  const modelPath = path.join(modelDir, L0_MODEL_FILENAME);
  const holdMs = Number(process.env.FT_COMPANION_L0_HOLD_MS || 20000);

  emit({ event: 'status', message: 'download' });
  let dl = null;
  let lastDownloadError = null;
  for (const url of L0_MODEL_URLS) {
    try {
      emit({ event: 'status', message: `download ${url}` });
      dl = await ensureGgufDownloaded(modelPath, url, {
        onProgress: ({ received, total }) => {
          process.stderr.write(
            `l0 download ${received}${total ? `/${total}` : ''}\n`
          );
        }
      });
      break;
    } catch (err) {
      lastDownloadError = err;
      emit({
        event: 'status',
        message: `download_fail ${err instanceof Error ? err.message : String(err)}`
      });
    }
  }
  if (!dl) {
    throw lastDownloadError || new Error('model_download_failed');
  }
  await emit({
    event: 'downloaded',
    path: dl.path,
    bytes: dl.bytes,
    downloaded: dl.downloaded
  });

  const inference = await runL0Inference({
    modelPath: dl.path,
    onProgress: (msg) => {
      void emit({ event: 'status', message: msg });
    },
    onHolding: async () => {
      await emit({ event: 'ready' });
      try {
        await waitForGo(holdMs);
      } catch {
        await emit({ event: 'status', message: 'hold_timeout_continue' });
      }
    }
  });

  await emit({
    event: 'done',
    report: {
      ...inference,
      modelPath: dl.path,
      modelBytes: dl.bytes,
      downloadedThisRun: dl.downloaded,
      host: {
        platform: process.platform,
        arch: process.arch,
        node: process.version,
        totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
        cpus: os.cpus()?.[0]?.model || ''
      }
    }
  });
  process.exit(inference.loadError ? 1 : 0);
}

main().catch(async (err) => {
  await emit({
    event: 'error',
    message: err instanceof Error ? err.message : String(err)
  });
  process.exit(1);
});
