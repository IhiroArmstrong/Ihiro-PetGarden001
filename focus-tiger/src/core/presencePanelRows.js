/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readPresenceSignals } from './presenceSignalsGate.js';
import {
  legacyReflectionSignalsForBundle,
  readReflectionBundles
} from './presenceSignalsDelete.js';

/**
 * @typedef {'reflection_session' | 'standalone_signal' | 'legacy_reflection'} PresencePanelRowKind
 *
 * @typedef {{
 *   kind: PresencePanelRowKind,
 *   id: string,
 *   sortAt: number,
 *   legacy: boolean,
 *   presenceSessionId?: string,
 *   bundleCreatedAt?: number,
 *   signalId?: string,
 *   source?: string,
 *   preview?: string
 * }} PresencePanelRow
 */

/**
 * @param {import('./presenceSignalsGate.js').PresenceSignalEntry} row
 * @returns {string}
 */
function signalPreview(row) {
  if (row.freeText) return row.freeText.slice(0, 120);
  if (row.emotionTag) return row.emotionTag;
  return '';
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {PresencePanelRow[]}
 */
export function listPresencePanelRows(storage) {
  if (!storage) return [];
  /** @type {PresencePanelRow[]} */
  const rows = [];
  const signals = readPresenceSignals(storage).entries;
  const bundles = readReflectionBundles(storage);
  const bundledSessionIds = new Set(
    bundles.map((b) => b.presenceSessionId).filter(Boolean)
  );

  for (const bundle of bundles) {
    const sessionId = bundle.presenceSessionId;
    const legacy = !sessionId;
    const createdAt = Number(bundle.createdAt);
    const linked = sessionId
      ? signals.filter((row) => row.presenceSessionId === sessionId)
      : legacyReflectionSignalsForBundle(bundle, signals);
    const preview = linked.map(signalPreview).filter(Boolean).join(' · ');
    rows.push({
      kind: legacy ? 'legacy_reflection' : 'reflection_session',
      id: legacy ? `legacy-refl-${createdAt}` : `session-${sessionId}`,
      sortAt: createdAt,
      legacy,
      presenceSessionId: sessionId || undefined,
      bundleCreatedAt: createdAt,
      preview
    });
  }

  for (const row of signals) {
    if (row.presenceSessionId && bundledSessionIds.has(row.presenceSessionId)) {
      continue;
    }
    if (
      !row.presenceSessionId &&
      bundles.some(
        (bundle) =>
          !bundle.presenceSessionId &&
          legacyReflectionSignalsForBundle(bundle, [row]).length > 0
      )
    ) {
      continue;
    }
    rows.push({
      kind: 'standalone_signal',
      id: `signal-${row.id}`,
      sortAt: new Date(row.at).getTime() || 0,
      legacy: !row.presenceSessionId,
      signalId: row.id,
      source: row.source,
      preview: signalPreview(row)
    });
  }

  return rows.sort((a, b) => b.sortAt - a.sortAt);
}
