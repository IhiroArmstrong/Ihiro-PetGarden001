/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemoryArtHdCache } from './artCollectionHd.js';
import { TEA_GIFT_ART } from './artEditionCatalog.js';
import { applyTeaGiftPicture } from './teaGiftHd.js';

test('tea gift picture stays on the preview until a grant is cached', async () => {
  assert.equal(TEA_GIFT_ART.hdId, 'hd-tg-01');
  const cache = createMemoryArtHdCache();
  const img = { src: TEA_GIFT_ART.previewSrc };
  await applyTeaGiftPicture(img, null, { cache });
  assert.equal(img.src, TEA_GIFT_ART.previewSrc);

  const png = new Blob([Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])], {
    type: 'image/png'
  });
  await applyTeaGiftPicture(
    img,
    { url: 'https://cloud.test/api/art-collection-hd?t=tea', receiptId: 'cs_tea' },
    {
      cache,
      fetchImpl: async () => ({ ok: true, blob: async () => png })
    }
  );
  assert.match(String(img.src), /^blob:/);
});
