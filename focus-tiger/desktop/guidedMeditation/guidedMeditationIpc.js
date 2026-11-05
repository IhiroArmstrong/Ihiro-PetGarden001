/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  ensureGuidedMeditationCached,
  removeGuidedMeditationCacheEntry
} from './guidedMeditationDownload.js';

/**
 * @param {import('electron').IpcMain} ipcMain
 * @param {{ getUserDataDir: () => string }} deps
 */
export function registerGuidedMeditationIpc(ipcMain, deps) {
  ipcMain.handle('desktop:guided-meditation-fetch', async (event, payload) => {
    const lessonId = String(payload?.lessonId || '').trim();
    const kind = payload?.kind === 'audio' ? 'audio' : 'video';
    const url = String(payload?.url || '').trim();
    const objectHash = String(payload?.objectHash || '').trim();
    const expectedSha256 = String(payload?.expectedSha256 || '').trim();
    const expectedBytes = Number(payload?.expectedBytes);
    if (!lessonId || !url || !objectHash) {
      return { ok: false, detail: 'guided_meditation_fetch_invalid' };
    }
    try {
      const result = await ensureGuidedMeditationCached({
        userDataDir: deps.getUserDataDir(),
        lessonId,
        kind,
        url,
        objectHash,
        expectedSha256,
        expectedBytes: Number.isFinite(expectedBytes) ? expectedBytes : undefined,
        onProgress: (info) => {
          event.sender.send('desktop:guided-meditation-progress', {
            lessonId,
            kind,
            received: info.received,
            total: info.total
          });
        }
      });
      return {
        ok: true,
        fileUrl: result.fileUrl,
        fromCache: result.fromCache
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'guided_meditation_fetch_failed'
      };
    }
  });

  ipcMain.handle('desktop:guided-meditation-cache-remove', async (_event, payload) => {
    const lessonId = String(payload?.lessonId || '').trim();
    const objectHash = String(payload?.objectHash || '').trim();
    const kind = payload?.kind === 'audio' ? 'audio' : 'video';
    if (!lessonId || !objectHash) {
      return { ok: false, detail: 'guided_meditation_remove_invalid' };
    }
    removeGuidedMeditationCacheEntry(deps.getUserDataDir(), lessonId, objectHash, kind);
    return { ok: true };
  });
}
