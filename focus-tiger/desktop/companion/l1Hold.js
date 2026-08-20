/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Load a GGUF and hold it. L1 does not generate — L2 owns routing / persona.
 * Dynamic import so unit tests never load the native addon.
 */

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

/**
 * @param {{ dispose?: () => Promise<void> } | null} model
 * @param {{ dispose?: () => Promise<void> } | null} llama
 * @param {number} timeoutMs
 */
async function disposeQuietly(model, llama, timeoutMs) {
  const work = (async () => {
    try {
      if (model && typeof model.dispose === 'function') await model.dispose();
    } catch {
      /* already failed */
    }
    try {
      if (llama && typeof llama.dispose === 'function') await llama.dispose();
    } catch {
      /* already failed */
    }
  })();
  await Promise.race([
    work,
    new Promise((resolve) => setTimeout(resolve, timeoutMs))
  ]);
}

/**
 * @param {{
 *   modelPath: string,
 *   onProgress?: (msg: string) => void
 * }} opts
 * @returns {Promise<{
 *   dispose: () => Promise<void>,
 *   gpu: string
 * }>}
 */
export async function loadModelHold(opts) {
  const onProgress = opts.onProgress || (() => {});
  /** @type {null | { dispose?: () => Promise<void> }} */
  let llama = null;
  /** @type {null | { dispose?: () => Promise<void> }} */
  let model = null;
  let gpu = 'unknown';

  onProgress('import node-llama-cpp');
  const { getLlama } = await import('node-llama-cpp');
  onProgress('getLlama');
  llama = await getLlama();
  gpu =
    llama && llama.gpu != null
      ? String(llama.gpu)
      : llama && llama.gpuType != null
        ? String(llama.gpuType)
        : 'unknown';

  onProgress('loadModel');
  model = await llama.loadModel({ modelPath: opts.modelPath });

  let disposed = false;
  return {
    gpu,
    async dispose() {
      if (disposed) return;
      disposed = true;
      await disposeQuietly(model, llama, 8000);
      model = null;
      llama = null;
    }
  };
}

export { errorMessage };
