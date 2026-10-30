/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateMindflowNebulaStep2PhaseA,
  readMindflowNebulaStep2PhaseAPassed,
  summarizeMindflowNebulaStep2PhaseAForExport
} from './mindflowNebulaStep2PhaseAEval.js';
import { MINDFLOW_NEBULA_STEP2_BOARD_FIXTURES } from './mindflowNebulaStep2BoardFixtures.js';

function cluster(dim, bias, spread = 0.02) {
  /** @type {number[]} */
  const v = new Array(dim).fill(0).map((_, i) => bias[i % bias.length] + spread * (i + 1));
  return v;
}

test('phase A eval passes on synthetic separated clusters', () => {
  const dim = 16;
  const boards = [
    {
      id: 'a',
      calibrationVectors: Array.from({ length: 8 }, (_, i) =>
        cluster(dim, [1, 0, 0], 0.01 * i)
      ),
      paraphraseVectors: Array.from({ length: 4 }, (_, i) =>
        cluster(dim, [1, 0.01, 0], 0.01 * i)
      )
    },
    {
      id: 'b',
      calibrationVectors: Array.from({ length: 8 }, (_, i) =>
        cluster(dim, [0, 1, 0], 0.01 * i)
      ),
      paraphraseVectors: Array.from({ length: 4 }, (_, i) =>
        cluster(dim, [0, 1, 0.01], 0.01 * i)
      )
    },
    {
      id: 'c',
      calibrationVectors: Array.from({ length: 8 }, (_, i) =>
        cluster(dim, [0, 0, 1], 0.01 * i)
      ),
      paraphraseVectors: Array.from({ length: 4 }, (_, i) =>
        cluster(dim, [0.01, 0, 1], 0.01 * i)
      )
    },
    {
      id: 'd',
      calibrationVectors: Array.from({ length: 8 }, (_, i) =>
        cluster(dim, [-1, 0, 0], 0.01 * i)
      ),
      paraphraseVectors: Array.from({ length: 4 }, (_, i) =>
        cluster(dim, [-1, 0.01, 0], 0.01 * i)
      )
    }
  ];
  const negativeVectors = Array.from({ length: 8 }, (_, i) =>
    cluster(dim, [4, 4, 4], 0.02 * i)
  );
  const report = evaluateMindflowNebulaStep2PhaseA({ boards, negativeVectors });
  assert.equal(report.phaseAPassed, true, report.failures.join(','));
  const exported = summarizeMindflowNebulaStep2PhaseAForExport(report);
  assert.equal(exported.phaseAPassed, true);
  assert.equal(JSON.stringify(exported).includes('invoice'), false);
});

test('phase A eval fails when cohesion is too low', () => {
  const dim = 8;
  const boards = [
    {
      id: 'only',
      calibrationVectors: [
        cluster(dim, [1, 0]),
        cluster(dim, [-1, 0]),
        cluster(dim, [0, 1]),
        cluster(dim, [0, -1]),
        cluster(dim, [1, 1]),
        cluster(dim, [-1, -1]),
        cluster(dim, [1, -1]),
        cluster(dim, [-1, 1])
      ],
      paraphraseVectors: [cluster(dim, [1, 0]), cluster(dim, [0, 1]), cluster(dim, [0, 0]), cluster(dim, [0.2, 0.2])]
    }
  ];
  const report = evaluateMindflowNebulaStep2PhaseA({
    boards,
    negativeVectors: Array.from({ length: 8 }, () => cluster(dim, [2, 2]))
  });
  assert.equal(report.phaseAPassed, false);
  assert.ok(report.failures.some((f) => f.includes('cohesion')));
});

test('fixture ids satisfy minimum sample counts', () => {
  for (const board of MINDFLOW_NEBULA_STEP2_BOARD_FIXTURES) {
    assert.ok(board.calibration.length >= 8, board.id);
    assert.ok(board.paraphrase.length >= 4, board.id);
  }
});

test('readMindflowNebulaStep2PhaseAPassed reads export flag', () => {
  assert.equal(readMindflowNebulaStep2PhaseAPassed({ phaseAPassed: true }), true);
  assert.equal(readMindflowNebulaStep2PhaseAPassed({ phaseAPassed: false }), false);
});
