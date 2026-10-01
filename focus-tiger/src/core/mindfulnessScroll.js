/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Mindfulness Scroll — local Save image for a period of sitting.
 * Trigger B (Brief): score ≥ 42 or lifetime minutes ≥ 3000, user taps Save.
 * Quiet Line history is only the current-day pool; otherwise one fixed line.
 * No chain, no wallet, no cloud upload.
 */

import { downloadCanvasPng, readDailyZenQuotePoolV2 } from './dailyZenQuote.js';
import { readJourneyLog } from './journeyLogGate.js';

export const MINDFULNESS_SCROLL_STORAGE_KEY =
  'focus-tiger.mindfulness-scroll.v1';

export const MINDFULNESS_SCROLL_SCORE_MIN = 42;
export const MINDFULNESS_SCROLL_MINUTES_MIN = 3000;
export const MINDFULNESS_SCROLL_HISTORY_MAX = 12;

export const MINDFULNESS_SCROLL_FALLBACK_LINE =
  'Minutes sat with Yin. Nothing extra.';

/**
 * @param {{ score?: number, lifetimeMinutes?: number }} aggregate
 */
export function isMindfulnessScrollEligible(aggregate) {
  const score = Math.max(0, Number(aggregate?.score) || 0);
  const minutes = Math.max(0, Number(aggregate?.lifetimeMinutes) || 0);
  return (
    score >= MINDFULNESS_SCROLL_SCORE_MIN ||
    minutes >= MINDFULNESS_SCROLL_MINUTES_MIN
  );
}

/**
 * @param {Storage | null | undefined} storage
 * @param {(key: string) => string} [translate]
 */
export function currentQuietLineOrFallback(storage, translate) {
  const pool = readDailyZenQuotePoolV2(storage);
  if (pool?.key && typeof translate === 'function') {
    const text = translate(pool.key);
    if (text && text !== pool.key) return text;
  }
  return MINDFULNESS_SCROLL_FALLBACK_LINE;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ score?: number, lifetimeMinutes?: number }} aggregate
 * @param {(key: string) => string} [translate]
 */
export function buildMindfulnessScrollDraft(storage, aggregate, translate) {
  const log = readJourneyLog(storage);
  const entries = log.entries || [];
  let sittingMinutes = 0;
  let from = '';
  let to = '';
  for (const entry of entries) {
    sittingMinutes += Math.max(0, Number(entry?.minutes) || 0);
    const day = String(entry?.at || '').slice(0, 10);
    if (!day) continue;
    if (!from || day < from) from = day;
    if (!to || day > to) to = day;
  }
  return {
    eligible: isMindfulnessScrollEligible(aggregate),
    score: Math.max(0, Number(aggregate?.score) || 0),
    lifetimeMinutes: Math.max(0, Number(aggregate?.lifetimeMinutes) || 0),
    sittingMinutes,
    from,
    to,
    line: currentQuietLineOrFallback(storage, translate),
    history: readMindfulnessScrollHistory(storage)
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readMindfulnessScrollHistory(storage) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(MINDFULNESS_SCROLL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed?.saves) ? parsed.saves : [];
    return rows.filter((row) => row && typeof row.id === 'string');
  } catch {
    return [];
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ id: string, savedAt: string, from: string, to: string, lifetimeMinutes: number }} row
 */
export function appendMindfulnessScrollSave(storage, row) {
  if (!storage || !row?.id) return false;
  const prev = readMindfulnessScrollHistory(storage);
  if (prev.some((item) => item.id === row.id)) return false;
  const saves = [...prev, row].slice(-MINDFULNESS_SCROLL_HISTORY_MAX);
  storage.setItem(
    MINDFULNESS_SCROLL_STORAGE_KEY,
    JSON.stringify({ saves })
  );
  return true;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof buildMindfulnessScrollDraft>} draft
 * @param {{ title: string, subtitle: string }} labels
 */
export function paintMindfulnessScroll(ctx, draft, labels) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#efe6d8';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#c4b39a';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, w - 72, h - 72);
  ctx.fillStyle = '#2c1f14';
  ctx.font = '600 40px "Iowan Old Style", Palatino, serif';
  ctx.fillText(labels.title, 72, 140);
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillText(labels.subtitle, 72, 190);
  const span = [draft.from, draft.to].filter(Boolean).join(' – ') || '—';
  ctx.fillText(span, 72, 260);
  ctx.fillText(`${draft.lifetimeMinutes} min`, 72, 310);
  ctx.font = '400 28px "Iowan Old Style", Palatino, serif';
  const quote = String(draft.line || MINDFULNESS_SCROLL_FALLBACK_LINE);
  let line = '';
  let y = 400;
  const max = w - 144;
  for (const word of quote.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      ctx.fillText(line, 72, y);
      y += 42;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, 72, y);
  ctx.font = '400 20px system-ui, sans-serif';
  ctx.fillText('Focus Tiger · with Yin', 72, h - 90);
}

/**
 * @param {{
 *   draft: ReturnType<typeof buildMindfulnessScrollDraft>,
 *   title: string,
 *   subtitle: string,
 *   storage?: Storage | null,
 *   now?: Date,
 *   createCanvas?: () => HTMLCanvasElement,
 *   download?: typeof downloadCanvasPng
 * }} opts
 */
export async function saveMindfulnessScroll(opts) {
  const draft = opts.draft;
  if (!draft?.eligible) return { ok: false, reason: 'not-eligible' };
  const createCanvas =
    opts.createCanvas ||
    (typeof document !== 'undefined'
      ? () => document.createElement('canvas')
      : null);
  if (!createCanvas) return { ok: false, reason: 'no-canvas' };
  const canvas = createCanvas();
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { ok: false, reason: 'no-canvas' };
  paintMindfulnessScroll(ctx, draft, {
    title: opts.title,
    subtitle: opts.subtitle
  });
  const day = (opts.now || new Date()).toISOString().slice(0, 10);
  const id = `scroll-${day}-${draft.lifetimeMinutes}-${draft.score}`;
  const filename = `focus-tiger-mindfulness-scroll-${day}.png`;
  const download = opts.download || downloadCanvasPng;
  const saved = await download(canvas, filename);
  if (!saved) return { ok: false, reason: 'download-failed' };
  appendMindfulnessScrollSave(opts.storage, {
    id,
    savedAt: (opts.now || new Date()).toISOString(),
    from: draft.from,
    to: draft.to,
    lifetimeMinutes: draft.lifetimeMinutes
  });
  return { ok: true, id };
}
