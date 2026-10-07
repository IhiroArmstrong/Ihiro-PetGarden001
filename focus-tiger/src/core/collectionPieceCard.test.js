/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  collectionPieceCardLines,
  paintCollectionPieceCard,
  saveCollectionPieceCard
} from './collectionPieceCard.js';

const read = (key) =>
  ({
    YIN_COIN_PIECE_CARD_KEPT: 'Already in the collection',
    YIN_COIN_PIECE_CARD_MINUTES: '{n} minutes sat, in all',
    YIN_COIN_PIECE_CARD_LINE:
      'This piece came after I had sat these {n} minutes.',
    BRAND_YIN_WAY_SEAL: 'Walking the Yin Way. · Focus Tiger'
  })[key] || key;

function mockCanvas() {
  /** @type {string[]} */
  const texts = [];
  let drew = false;
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return {
        canvas,
        fillStyle: '',
        font: '',
        fillRect() {},
        fillText(text) {
          texts.push(String(text));
        },
        measureText(text) {
          return { width: String(text).length * 10 };
        },
        drawImage() {
          drew = true;
        }
      };
    }
  };
  return {
    canvas,
    texts,
    drew: () => drew
  };
}

describe('collectionPieceCard', () => {
  it('exports an owned piece with the lifetime minutes that were passed in', async () => {
    const mock = mockCanvas();
    const files = [];
    const ok = await saveCollectionPieceCard({
      skuId: 'space.incense-tint-warm',
      owned: true,
      name: 'Lotus censer',
      lifetimeMinutes: 128,
      acquiredOn: '2026-10-07',
      locale: 'en',
      t: read,
      image: { width: 10, height: 10 },
      createCanvas: () => mock.canvas,
      download: async (_canvas, filename) => {
        files.push(filename);
        return true;
      }
    });
    assert.equal(ok, true);
    assert.equal(
      files[0],
      'focus-tiger-collection-piece-space.incense-tint-warm.png'
    );
    assert.equal(mock.drew(), true);
    assert.ok(mock.texts.some((line) => line.includes('128')));
    assert.equal(
      mock.texts.some((line) => line.includes('2026-10-07')),
      false
    );
  });

  it('does not export a piece that is not owned', async () => {
    let downloaded = false;
    const ok = await saveCollectionPieceCard({
      skuId: 'space.incense-tint-warm',
      owned: false,
      name: 'Lotus censer',
      lifetimeMinutes: 128,
      t: read,
      createCanvas: () => mockCanvas().canvas,
      download: async () => {
        downloaded = true;
        return true;
      }
    });
    assert.equal(ok, false);
    assert.equal(downloaded, false);
  });

  it('keeps an older piece without inventing a calendar day', () => {
    const lines = collectionPieceCardLines({
      name: 'Lotus censer',
      lifetimeMinutes: 40,
      acquiredOn: null,
      t: read
    });
    assert.equal(lines.hasCalendarDate, false);
    assert.equal(lines.dateLine, 'Already in the collection');
    assert.equal(lines.minutes, 40);
    const mock = mockCanvas();
    mock.canvas.width = 1080;
    mock.canvas.height = 1350;
    paintCollectionPieceCard(mock.canvas.getContext('2d'), {
      ...lines,
      footer: 'Walking the Yin Way. · Focus Tiger'
    });
    const painted = mock.texts.join('\n');
    assert.match(painted, /Already in the collection/);
    assert.match(painted, /40/);
    assert.doesNotMatch(painted, /\d{4}-\d{2}-\d{2}/);
    assert.doesNotMatch(painted, /October|January/);
  });
});
