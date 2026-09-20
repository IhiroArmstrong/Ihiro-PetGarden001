/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local Confide turns.jsonl retention — debug log only; not user-facing memory.
 * Shadow audit rows expire sooner than generation / classify rows.
 */

/** @readonly */
export const CONFIDE_TURNS_SHADOW_AUDIT_KINDS = Object.freeze([
  'semantic_shadow_classify',
  'semantic_live_classify'
]);

/** @readonly */
export const CONFIDE_TURNS_GENERATION_KINDS = Object.freeze([
  'l3_generate',
  'read_hybrid_classify'
]);

/** Short audit trail for shadow routing comparisons (PO 2026-09-19). */
export const CONFIDE_TURNS_SHADOW_RETENTION_DAYS = 7;

/** Longer window for generate/classify debugging (latency, prompt sizing). */
export const CONFIDE_TURNS_GENERATION_RETENTION_DAYS = 30;

/** Hard cap so a runaway log cannot grow without bound (~2k full turns). */
export const CONFIDE_TURNS_MAX_BYTES = 5 * 1024 * 1024;

/**
 * @param {string} kind
 * @returns {number | null} retention in days; null = keep (unknown kind)
 */
export function confideTurnRetentionDaysForKind(kind) {
  if (CONFIDE_TURNS_SHADOW_AUDIT_KINDS.includes(kind)) {
    return CONFIDE_TURNS_SHADOW_RETENTION_DAYS;
  }
  if (CONFIDE_TURNS_GENERATION_KINDS.includes(kind)) {
    return CONFIDE_TURNS_GENERATION_RETENTION_DAYS;
  }
  return null;
}

/**
 * @param {unknown} row
 * @param {number} nowMs
 * @returns {boolean}
 */
export function shouldKeepConfideTurnRow(row, nowMs = Date.now()) {
  if (!row || typeof row !== 'object') return false;
  const kind = typeof row.kind === 'string' ? row.kind : '';
  const retentionDays = confideTurnRetentionDaysForKind(kind);
  if (retentionDays == null) return true;
  const at = typeof row.at === 'string' ? row.at : '';
  const ts = Date.parse(at);
  if (Number.isNaN(ts)) return true;
  const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
  return nowMs - ts <= maxAgeMs;
}

/**
 * @param {string} content
 * @param {number} [nowMs]
 * @returns {{ content: string, kept: number, dropped: number, droppedByAge: number, droppedByBytes: number }}
 */
export function pruneConfideTurnsJsonlContent(content, nowMs = Date.now()) {
  const trimmed = String(content || '');
  if (!trimmed.trim()) {
    return {
      content: '',
      kept: 0,
      dropped: 0,
      droppedByAge: 0,
      droppedByBytes: 0
    };
  }

  const lines = trimmed.split('\n');
  /** @type {string[]} */
  const keptLines = [];
  let droppedByAge = 0;

  for (const line of lines) {
    const raw = line.trim();
    if (!raw) continue;
    try {
      const row = JSON.parse(raw);
      if (shouldKeepConfideTurnRow(row, nowMs)) {
        keptLines.push(raw);
      } else {
        droppedByAge += 1;
      }
    } catch {
      keptLines.push(raw);
    }
  }

  let droppedByBytes = 0;
  let body = keptLines.length ? `${keptLines.join('\n')}\n` : '';
  const encoder = new TextEncoder();
  while (encoder.encode(body).length > CONFIDE_TURNS_MAX_BYTES && keptLines.length > 0) {
    keptLines.shift();
    droppedByBytes += 1;
    body = keptLines.length ? `${keptLines.join('\n')}\n` : '';
  }

  const dropped = droppedByAge + droppedByBytes;
  return {
    content: body,
    kept: keptLines.length,
    dropped,
    droppedByAge,
    droppedByBytes
  };
}
