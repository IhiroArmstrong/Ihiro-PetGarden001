/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  artChosenPieceCardLines,
  paintArtChosenPieceCard,
  saveArtChosenPieceCard
} from './artChosenPieceCard.js';

const read = (key) =>
  ({
    ART_CHOSEN_PIECE_CARD_KEPT: 'Chosen, and kept here',
    ART_CHOSEN_PIECE_CARD_LINE: 'This is a piece I chose.',
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

describe('artChosenPieceCard', () => {
  it('saves an owned piece with the purchase day and the choosing sentence', async () => {
    const mock = mockCanvas();
    const files = [];
    const ok = await saveArtChosenPieceCard({
      sheetId: 'celadon-taotie-gu',
      owned: true,
      name: 'Celadon taotie gu',
      ownedAt: '2026-10-07T12:00:00.000Z',
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
    assert.equal(files[0], 'focus-tiger-art-piece-celadon-taotie-gu.png');
    assert.equal(mock.drew(), true);
    assert.ok(mock.texts.includes('Celadon taotie gu'));
    assert.ok(mock.texts.includes('This is a piece I chose.'));
    assert.ok(mock.texts.some((line) => line.includes('October')));
    assert.equal(
      mock.texts.some((line) => /minute|分钟|分、/.test(line)),
      false
    );
  });

  it('leaves the day off when the purchase record has none', () => {
    const lines = artChosenPieceCardLines({
      name: 'Celadon taotie gu',
      ownedAt: '',
      t: read
    });
    assert.equal(lines.hasCalendarDate, false);
    assert.equal(lines.dateLine, 'Chosen, and kept here');
    assert.equal(lines.sentence, 'This is a piece I chose.');
  });

  it('does not download a piece that is not owned', async () => {
    let called = false;
    const ok = await saveArtChosenPieceCard({
      sheetId: 'celadon-taotie-gu',
      owned: false,
      name: 'Celadon taotie gu',
      t: read,
      createCanvas: () => mockCanvas().canvas,
      download: async () => {
        called = true;
        return true;
      }
    });
    assert.equal(ok, false);
    assert.equal(called, false);
  });

  it('paints no minutes line', () => {
    const mock = mockCanvas();
    const ctx = mock.canvas.getContext('2d');
    paintArtChosenPieceCard(ctx, {
      name: 'Celadon taotie gu',
      dateLine: 'October 7, 2026',
      sentence: 'This is a piece I chose.'
    });
    assert.equal(mock.texts.join('\n').includes('999'), false);
  });
});
