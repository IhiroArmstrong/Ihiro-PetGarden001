/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Load a GGUF and hold it. L2 may call `generate` on the returned session.
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
 *   generate: (prompt: string, opts?: { maxTokens?: number }) => Promise<string>,
 *   gpu: string
 * }>}
 */
export async function loadModelHold(opts) {
  const onProgress = opts.onProgress || (() => {});
  /** @type {null | { dispose?: () => Promise<void> }} */
  let llama = null;
  /** @type {null | { dispose?: () => Promise<void> }} */
  let model = null;
  /** @type {null | { dispose?: () => Promise<void> }} */
  let context = null;
  /** @type {null | { prompt: (p: string, o?: object) => Promise<string> }} */
  let chat = null;
  let gpu = 'unknown';

  onProgress('import node-llama-cpp');
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
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
  context = await model.createContext();
  chat = new LlamaChatSession({
    contextSequence: context.getSequence()
  });

  let disposed = false;
  return {
    gpu,
    async generate(prompt, genOpts = {}) {
      if (disposed || !chat) throw new Error('companion_session_disposed');
      const maxTokens = Number(genOpts.maxTokens);
      const text = await chat.prompt(String(prompt || ''), {
        maxTokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 48
      });
      return String(text || '');
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      chat = null;
      await disposeQuietly(context, null, 4000);
      context = null;
      await disposeQuietly(model, llama, 8000);
      model = null;
      llama = null;
    }
  };
}

export { errorMessage };
