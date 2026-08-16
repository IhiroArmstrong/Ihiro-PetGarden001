/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIGITAL_WALLPAPER_STILLS } from './digitalWallpapersCatalog.js';
import {
  downloadBlobAsFile,
  saveDigitalWallpaperImage
} from './saveDigitalWallpaper.js';

describe('saveDigitalWallpaper', () => {
  it('downloadBlobAsFile clicks an anchor with download name', () => {
    const clicks = [];
    const ok = downloadBlobAsFile(new Blob(['x'], { type: 'image/png' }), 'a.png', {
      createElement: () => {
        const el = {
          href: '',
          download: '',
          rel: '',
          click() {
            clicks.push({ href: el.href, download: el.download });
          }
        };
        return el;
      },
      createObjectURL: () => 'blob:test',
      revokeObjectURL: () => {}
    });
    assert.equal(ok, true);
    assert.equal(clicks.length, 1);
    assert.equal(clicks[0].download, 'a.png');
  });

  it('saveDigitalWallpaperImage fetches still and downloads', async () => {
    const still = DIGITAL_WALLPAPER_STILLS[0];
    const info = await saveDigitalWallpaperImage({
      id: still.id,
      fetchImpl: async () => ({
        ok: true,
        blob: async () => new Blob(['png'], { type: 'image/png' })
      }),
      createElement: () => ({
        href: '',
        download: '',
        rel: '',
        click() {}
      }),
      createObjectURL: () => 'blob:wp',
      revokeObjectURL: () => {}
    });
    assert.equal(info.ok, true);
    assert.equal(info.id, still.id);
    assert.match(info.filename, /^focus-tiger-wallpaper-/);
  });

  it('saveDigitalWallpaperImage fails closed on unknown id', async () => {
    const info = await saveDigitalWallpaperImage({ id: 'nope' });
    assert.equal(info.ok, false);
  });
});
