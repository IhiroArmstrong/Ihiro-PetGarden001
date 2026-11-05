/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { getDesktopShellBridge } from './desktopShell.js';

/**
 * @typedef {'video' | 'audio'} GuidedMeditationRenditionKind
 *
 * @param {import('./guidedMeditationPlayback.js').GuidedMeditationRenditionRef} rendition
 * @param {string} lessonId
 * @param {(info: { received: number, total: number | null }) => void} [onProgress]
 * @returns {Promise<{ src: string, origin: 'local' | 'remote' }>}
 */
export async function resolveGuidedMeditationMediaSrc(rendition, lessonId, onProgress) {
  const shell = getDesktopShellBridge();
  const bridge = shell?.guidedMeditation;
  if (bridge && typeof bridge.fetchRendition === 'function') {
    const objectHash =
      String(rendition.objectHash || '').trim() || objectHashFromUrl(rendition.url);
    const unsub =
      typeof bridge.onProgress === 'function' && onProgress
        ? bridge.onProgress((payload) => {
            if (payload?.lessonId !== lessonId || payload?.kind !== rendition.kind) return;
            onProgress({
              received: Number(payload.received) || 0,
              total: Number.isFinite(Number(payload.total)) ? Number(payload.total) : null
            });
          })
        : () => {};
    try {
      const result = await bridge.fetchRendition({
        lessonId,
        kind: rendition.kind,
        url: rendition.url,
        objectHash,
        expectedSha256: rendition.sha256 || '',
        expectedBytes: rendition.bytes || 0
      });
      if (result?.ok && result.fileUrl) {
        return { src: result.fileUrl, origin: 'local' };
      }
      throw new Error(result?.detail || 'guided_meditation_desktop_fetch_failed');
    } finally {
      unsub();
    }
  }
  return { src: rendition.url, origin: 'remote' };
}

/**
 * @param {string} url
 * @returns {string}
 */
function objectHashFromUrl(url) {
  const base = String(url || '').split('/').pop() || '';
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(0, dot) : base;
}
