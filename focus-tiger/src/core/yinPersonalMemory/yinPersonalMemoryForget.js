/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · list + Forget (Slice 1c).
 * SSOT: docs/YIN_PERSONAL_MEMORY.md §6, §11.
 * Forget = true delete from store (no soft-delete revival).
 */

import { YIN_MEMORY_SOURCE_ROUTE } from './yinPersonalMemoryRemember.js';
import { normalizeYinPersonalMemoryState } from './yinPersonalMemorySchema.js';

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @returns {import('./yinPersonalMemorySchema.js').YinMemoryEntry[]}
 */
export function listActiveYinMemories(state) {
  const normalized = normalizeYinPersonalMemoryState(state);
  return normalized.memories
    .filter((entry) => entry.status === 'active')
    .slice()
    .sort((a, b) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)));
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryEntry} entry
 * @returns {{ key: string, date?: string }}
 */
export function yinMemoryWhyCopyKey(entry) {
  if (!entry) return { key: 'YIN_MEMORY_WHY_GENERIC' };
  if (
    entry.sourceRoute === YIN_MEMORY_SOURCE_ROUTE.CONFIDE_FALLBACK &&
    entry.evidence.startsWith('confide:turn:')
  ) {
    const iso = entry.firstSeenAt || entry.lastSeenAt;
    const date = iso && iso.length >= 10 ? iso.slice(0, 10) : '';
    return date
      ? { key: 'YIN_MEMORY_WHY_CONFIDE', date }
      : { key: 'YIN_MEMORY_WHY_CONFIDE_NO_DATE' };
  }
  if (entry.sourceRoute === YIN_MEMORY_SOURCE_ROUTE.SYSTEM_SESSION_FACT) {
    return { key: 'YIN_MEMORY_WHY_SESSION' };
  }
  return { key: 'YIN_MEMORY_WHY_GENERIC' };
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryKind} kind
 * @returns {string}
 */
export function yinMemoryKindLabelKey(kind) {
  switch (kind) {
    case 'preference':
      return 'YIN_MEMORY_KIND_PREFERENCE';
    case 'pattern':
      return 'YIN_MEMORY_KIND_PATTERN';
    case 'moment':
      return 'YIN_MEMORY_KIND_MOMENT';
    case 'relationship':
      return 'YIN_MEMORY_KIND_RELATIONSHIP';
    default:
      return 'YIN_MEMORY_KIND_GENERIC';
  }
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {string} memoryId
 * @returns {{ state: import('./yinPersonalMemorySchema.js').YinPersonalMemoryState, forgotten: boolean }}
 */
export function forgetYinPersonalMemory(state, memoryId) {
  const normalized = normalizeYinPersonalMemoryState(state);
  const id = typeof memoryId === 'string' ? memoryId.trim() : '';
  if (!id) return { state: normalized, forgotten: false };
  const before = normalized.memories.length;
  const memories = normalized.memories.filter((entry) => entry.id !== id);
  return {
    state: { ...normalized, memories },
    forgotten: memories.length < before
  };
}
