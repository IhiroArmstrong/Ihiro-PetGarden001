/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  mustardSeedSealExportFilename,
  mustardSeedSealPoemLinesForExport,
  renderMustardSeedSealCanvas,
  saveMustardSeedSealImage
} from './saveMustardSeedSealImage.js';

describe('saveMustardSeedSealImage', () => {
  it('mustardSeedSealExportFilename sanitizes case id', () => {
    assert.equal(
      mustardSeedSealExportFilename('mustard-seed-sumeru'),
      'focus-tiger-mustard-seed-mustard-seed-sumeru.png'
    );
  });

  it('mustardSeedSealPoemLinesForExport uses zh primary for zh locale', () => {
    const lines = mustardSeedSealPoemLinesForExport(
      'mustard-seed-sumeru',
      'zh'
    );
    assert.match(lines.primaryLines[0], /大鵬/);
    assert.match(lines.secondaryLines[0], /roc/i);
  });

  it('mustardSeedSealPoemLinesForExport uses en primary for en locale', () => {
    const lines = mustardSeedSealPoemLinesForExport(
      'mustard-seed-sumeru',
      'en'
    );
    assert.match(lines.primaryLines[0], /roc/i);
    assert.match(lines.secondaryLines[0], /大鵬/);
  });

  it('renderMustardSeedSealCanvas returns sized canvas', () => {
    const canvas = renderMustardSeedSealCanvas({
      title: 'Mustard Seed',
      primaryLines: ['Line one'],
      secondaryLines: ['副句'],
      attribution: '樂五齋詩稿',
      footer: 'Walking the Yin Way. · Focus Tiger',
      createElement: (tag) => {
        if (tag !== 'canvas') throw new Error('expected canvas');
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            fillStyle: '',
            fillRect: () => {},
            fillText: () => {},
            drawImage: () => {},
            strokeRect: () => {},
            measureText: (text) => ({ width: String(text).length * 8 }),
            textAlign: '',
            font: '',
            lineWidth: 0,
            strokeStyle: ''
          })
        };
      }
    });
    assert.equal(canvas.width, 1080);
    assert.equal(canvas.height, 1350);
  });

  it('saveMustardSeedSealImage downloads png for known case', async () => {
    const clicks = [];
    const result = await saveMustardSeedSealImage({
      caseId: 'mustard-seed-sumeru',
      locale: 'en',
      badgeImage: { width: 100, height: 100, naturalWidth: 100, naturalHeight: 100 },
      createElement: (tag) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              fillStyle: '',
              fillRect: () => {},
              fillText: () => {},
              drawImage: () => {},
              strokeRect: () => {},
              measureText: (text) => ({ width: String(text).length * 8 }),
              textAlign: '',
              font: '',
              lineWidth: 0,
              strokeStyle: ''
            }),
            toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' }))
          };
        }
        if (tag === 'a') {
          return { click: () => clicks.push(1), href: '', download: '', rel: '' };
        }
        throw new Error(`unexpected tag ${tag}`);
      },
      createObjectURL: () => 'blob:test',
      revokeObjectURL: () => {}
    });
    assert.equal(result.ok, true);
    assert.equal(clicks.length, 1);
    assert.match(result.filename, /mustard-seed-sumeru\.png$/);
  });

  it('saveMustardSeedSealImage fails closed on unknown case', async () => {
    const result = await saveMustardSeedSealImage({ caseId: 'nope' });
    assert.equal(result.ok, false);
    assert.equal(result.filename, '');
  });
});
