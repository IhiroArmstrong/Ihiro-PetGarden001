/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Dual-write Arrival Choose intentions into presence-signals (freeText).
 * intentions.v1 remains the SSOT for recent intention history / Reflection echo.
 */

import { appendPresenceSignal } from './presenceSignalsGate.js';

/**
 * @param {Storage | null | undefined} storage
 * @param {string} text
 * @param {{ now?: () => Date, idFn?: () => string, at?: string }} [opts]
 * @returns {import('./presenceSignalsGate.js').PresenceSignalEntry | null}
 */
export function appendIntentionPresenceSignal(storage, text, opts = {}) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed || !storage) return null;
  const now = opts.now ?? (() => new Date());
  const at = opts.at || now().toISOString();
  return appendPresenceSignal(
    storage,
    { source: 'arrival_choose', freeText: trimmed, at },
    opts
  );
}
