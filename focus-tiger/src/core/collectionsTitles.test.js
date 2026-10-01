/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { listCompanionTitleRows } from './collectionsTitles.js';

test('titles tab lists the three catalog titles and no shop objects', () => {
  const rows = listCompanionTitleRows({ ownedIds: [], equippedTitle: null });
  assert.deepEqual(
    rows.map((row) => row.id),
    ['title.sits-with-yin', 'title.returned-gently', 'title.long-sitter']
  );
  assert.equal(rows.every((row) => row.owned === false), true);
});

test('bundle grant marks the long-sitter title owned and equipped', () => {
  const rows = listCompanionTitleRows({
    ownedIds: ['title.long-sitter'],
    equippedTitle: 'title.long-sitter'
  });
  const longSitter = rows.find((row) => row.id === 'title.long-sitter');
  assert.equal(longSitter.owned, true);
  assert.equal(longSitter.equipped, true);
  assert.equal(rows.find((row) => row.id === 'title.sits-with-yin').owned, false);
});
