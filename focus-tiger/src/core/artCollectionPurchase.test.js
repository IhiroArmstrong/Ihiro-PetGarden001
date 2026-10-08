/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  ART_COLLECTION_PRICE_USD,
  ART_COLLECTION_SHEETS,
  WITHDRAWN_ART_SHEET_IDS
} from './artCollectionCatalog.js';
import {
  ART_PURCHASE_REQUIRES_EMAIL,
  requestArtPurchase,
  resolveArtHd
} from './artCollectionPurchase.js';

const here = dirname(fileURLToPath(import.meta.url));
const publicRoot = join(here, '../../public/ui/art-collection');
const coinsPanel = readFileSync(join(here, '../ui/FocusCoinsPanelUI.js'), 'utf8');

describe('art collection purchase', () => {
  it('lists 25 sheets and omits the two withdrawn files', () => {
    assert.equal(ART_COLLECTION_SHEETS.length, 25);
    assert.equal(
      ART_COLLECTION_SHEETS.filter((row) => row.setId === 'song-porcelain').length,
      10
    );
    assert.equal(
      ART_COLLECTION_SHEETS.filter((row) => row.setId === 'song-ge-ware').length,
      7
    );
    assert.equal(
      ART_COLLECTION_SHEETS.filter((row) => row.setId === 'tixi-lacquer').length,
      8
    );
    for (const id of WITHDRAWN_ART_SHEET_IDS) {
      assert.equal(ART_COLLECTION_SHEETS.some((row) => row.id === id), false);
    }
    assert.equal(ART_COLLECTION_PRICE_USD, 1.99);
    assert.equal(ART_PURCHASE_REQUIRES_EMAIL, true);
  });

  it('public paths are preview names, not the old master names', () => {
    const hdIds = new Set();
    for (const row of ART_COLLECTION_SHEETS) {
      assert.match(row.previewSrc, /\/preview-[a-z0-9-]+\.png$/);
      assert.equal(row.previewSrc.includes(`${row.id}.png`) && !row.previewSrc.includes(`preview-${row.id}.png`), false);
      assert.match(row.hdId, /^hd-(sp|sg|tx)-\d{2}$/);
      assert.equal(hdIds.has(row.hdId), false);
      hdIds.add(row.hdId);
      assert.equal(row.hdId.includes(row.id), false);
    }
  });

  it('does not sell these sheets from the collections panel', () => {
    assert.equal(coinsPanel.includes('art-collection'), false);
    assert.equal(coinsPanel.includes('ART_COLLECTION'), false);
  });

  it('sells the five-piece set and refuses a single old sheet', () => {
    const missing = requestArtPurchase({
      sheetId: 'celadon-relief-five',
      email: ''
    });
    assert.deepEqual(missing, {
      ok: false,
      reason: 'email_required',
      wroteOwnership: false
    });
    const ready = requestArtPurchase({
      sheetId: 'celadon-relief-five',
      email: 'Buyer@Example.com'
    });
    assert.deepEqual(ready, {
      ok: true,
      sheetId: 'celadon-relief-five',
      email: 'buyer@example.com',
      wroteOwnership: false
    });
    assert.equal(
      requestArtPurchase({ sheetId: 'celadon-taotie-gu', email: 'a@b.co' }).reason,
      'unknown_sheet'
    );
    assert.equal(
      requestArtPurchase({ sheetId: 'celadon-relief-dragon-gu', email: 'a@b.co' }).reason,
      'unknown_sheet'
    );
    assert.equal(
      requestArtPurchase({ sheetId: 'celadon-garlic-mouth-ring-bottle', email: 'a@b.co' })
        .reason,
      'unknown_sheet'
    );
  });

  it('does not return high-resolution bytes without an emailed ownership record', () => {
    const denied = resolveArtHd({
      sheetId: 'celadon-taotie-gu',
      ownership: []
    });
    assert.equal(denied.status, 403);
    assert.equal(denied.bytes, null);
    const noEmail = resolveArtHd({
      sheetId: 'celadon-taotie-gu',
      ownership: [{ sheetId: 'celadon-taotie-gu', revoked: false }]
    });
    assert.equal(noEmail.status, 403);
    const ownedButNotServed = resolveArtHd({
      sheetId: 'celadon-taotie-gu',
      ownership: [
        { sheetId: 'celadon-taotie-gu', email: 'buyer@example.com', revoked: false }
      ]
    });
    assert.equal(ownedButNotServed.status, 404);
    assert.equal(ownedButNotServed.bytes, null);
  });

  it('keeps only preview png files in the public art folder', () => {
    const pngs = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (name.endsWith('.png')) pngs.push(name);
      }
    };
    walk(publicRoot);
    assert.ok(pngs.length >= 25);
    for (const name of pngs) {
      assert.match(name, /^preview-/);
    }
    for (const id of WITHDRAWN_ART_SHEET_IDS) {
      assert.equal(pngs.some((name) => name.includes(id)), false);
    }
  });
});
