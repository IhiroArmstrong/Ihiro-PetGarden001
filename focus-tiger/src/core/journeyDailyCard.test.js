/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  paintJourneyDailyCard,
  quoteForJourneyDailyCard,
  saveJourneyDailyCard
} from './journeyDailyCard.js';

describe('journeyDailyCard', () => {
  it('uses the same-day quiet line, otherwise a stable fallback', () => {
    assert.equal(
      quoteForJourneyDailyCard({
        dateKey: '2026-10-01',
        sameDayQuietLine: 'Sit a while.'
      }),
      'Sit a while.'
    );
    const a = quoteForJourneyDailyCard({ dateKey: '2026-10-01' });
    const b = quoteForJourneyDailyCard({ dateKey: '2026-10-01' });
    assert.equal(a, b);
    assert.ok(a.length > 0);
  });

  it('exports when a row has minutes and does not throw when minutes are zero', async () => {
    const calls = [];
    const canvas = {
      width: 0,
      height: 0,
      getContext() {
        return {
          canvas: thisCanvas,
          fillStyle: '',
          font: '',
          fillRect() {},
          fillText() {},
          measureText(text) {
            return { width: String(text).length * 8 };
          },
          drawImage() {}
        };
      }
    };
    const thisCanvas = canvas;
    const ok = await saveJourneyDailyCard({
      dateKey: '2026-10-01',
      minutes: 10,
      quote: 'A quiet day, kept.',
      createCanvas: () => canvas,
      download: async (_c, filename) => {
        calls.push(filename);
        return true;
      }
    });
    assert.equal(ok, true);
    assert.equal(calls[0], 'focus-tiger-daily-card-2026-10-01.png');

    const empty = await saveJourneyDailyCard({
      dateKey: '2026-10-02',
      minutes: 0,
      quote: quoteForJourneyDailyCard({ dateKey: '2026-10-02' }),
      createCanvas: () => canvas,
      download: async () => true
    });
    assert.equal(empty, true);
    paintJourneyDailyCard(canvas.getContext('2d'), {
      dateKey: '2026-10-02',
      minutes: 0,
      quote: 'x'
    });
  });
});
