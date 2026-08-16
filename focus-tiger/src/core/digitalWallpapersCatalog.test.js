/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { accessSync, constants } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DIGITAL_WALLPAPER_STILLS,
  digitalWallpaperFilename,
  findDigitalWallpaperById
} from './digitalWallpapersCatalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const publicRoot = join(here, '../../public');

describe('digitalWallpapersCatalog', () => {
  it('offers 3–6 curated stills', () => {
    assert.ok(DIGITAL_WALLPAPER_STILLS.length >= 3);
    assert.ok(DIGITAL_WALLPAPER_STILLS.length <= 6);
  });

  it('ids are unique kebab-case and filenames stay ASCII', () => {
    const ids = new Set();
    for (const still of DIGITAL_WALLPAPER_STILLS) {
      assert.match(still.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(ids.has(still.id), false);
      ids.add(still.id);
      const name = digitalWallpaperFilename(still);
      assert.match(name, /^focus-tiger-wallpaper-[a-z0-9-]+\.png$/);
      assert.equal(/[^\x00-\x7F]/.test(name), false);
    }
  });

  it('findDigitalWallpaperById resolves / rejects', () => {
    const first = DIGITAL_WALLPAPER_STILLS[0];
    assert.equal(findDigitalWallpaperById(first.id)?.src, first.src);
    assert.equal(findDigitalWallpaperById('missing'), null);
    assert.equal(findDigitalWallpaperById(''), null);
  });

  it('each still points at an existing public sprite frame', () => {
    for (const still of DIGITAL_WALLPAPER_STILLS) {
      assert.ok(still.src.startsWith('/sprites/'), still.id);
      const diskPath = join(publicRoot, still.src.replace(/^\//, ''));
      accessSync(diskPath, constants.R_OK);
    }
  });
});
