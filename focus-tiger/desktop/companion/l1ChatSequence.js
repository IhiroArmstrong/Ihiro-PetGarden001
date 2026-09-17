/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Model-agnostic llama context/sequence recycle for Confide generate
 * and lab probes that prompt more than once on one loaded GGUF.
 *
 * Qwen needed disposeSequence so KV did not keep repeating the first reply.
 * Gemma-4-E4B then threw `No sequences left` on the next getSequence().
 * Recreate the context when the pool is empty instead of model-specific branches.
 */

/**
 * @param {unknown} err
 * @returns {boolean}
 */
export function isNoSequencesLeftError(err) {
  const msg = err instanceof Error ? err.message : String(err || '');
  return /no sequences left/i.test(msg);
}

/**
 * @param {{ dispose?: (opts?: { disposeSequence?: boolean }) => void } | null} chat
 */
export function disposeChatSession(chat) {
  if (!chat || typeof chat.dispose !== 'function') return;
  try {
    chat.dispose({ disposeSequence: true });
  } catch {
    /* already failed */
  }
}

/**
 * @param {{ dispose?: () => unknown } | null} context
 */
export async function disposeContextQuietly(context) {
  if (!context || typeof context.dispose !== 'function') return;
  try {
    await context.dispose();
  } catch {
    /* already failed */
  }
}

/**
 * Gemma4 via node-llama-cpp defaults to reasoning mode; companion L3 needs
 * short replies without a hidden thought segment.
 *
 * @param {'qwen' | 'gemma' | undefined} promptFamily
 * @returns {Promise<object | undefined>}
 */
export async function resolveGemmaChatWrapper(promptFamily) {
  if (promptFamily !== 'gemma') return undefined;
  const { Gemma4ChatWrapper } = await import('node-llama-cpp');
  return new Gemma4ChatWrapper({ reasoning: false });
}

/**
 * @param {{
 *   LlamaChatSession: new (opts: { contextSequence: unknown, chatWrapper?: unknown }) => object,
 *   model: { createContext: () => Promise<object> },
 *   context: { getSequence: () => unknown, dispose?: () => unknown } | null,
 *   chat?: { dispose?: (opts?: { disposeSequence?: boolean }) => void } | null,
 *   promptFamily?: 'qwen' | 'gemma'
 * }} opts
 * @returns {Promise<{ context: object, chat: object }>}
 */
export async function openFreshChatSession(opts) {
  const LlamaChatSession = opts.LlamaChatSession;
  const model = opts.model;
  disposeChatSession(opts.chat || null);

  let context = opts.context;
  if (!context || typeof context.getSequence !== 'function') {
    context = await model.createContext();
  }

  let sequence;
  try {
    sequence = context.getSequence();
  } catch (err) {
    if (!isNoSequencesLeftError(err)) throw err;
    await disposeContextQuietly(context);
    context = await model.createContext();
    sequence = context.getSequence();
  }

  const chatWrapper = await resolveGemmaChatWrapper(opts.promptFamily);

  return {
    context,
    chat: new LlamaChatSession({
      contextSequence: sequence,
      ...(chatWrapper ? { chatWrapper } : {})
    })
  };
}
