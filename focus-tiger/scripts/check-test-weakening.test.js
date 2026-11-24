/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  parseDiff,
  analyze,
  findAck,
  decideExit,
  CONFIG
} from './check-test-weakening.mjs';

const scriptPath = fileURLToPath(new URL('./check-test-weakening.mjs', import.meta.url));

function fileDiff(path, { added = [], removed = [], deleted = false } = {}) {
  const header = [
    `diff --git a/${path} b/${path}`,
    deleted ? 'deleted file mode 100644' : 'index 1111111..2222222 100644',
    `--- a/${path}`,
    deleted ? '+++ /dev/null' : `+++ b/${path}`,
    '@@ -1,0 +1,0 @@'
  ];
  const body = [
    ...removed.map((l) => `-${l}`),
    ...added.map((l) => `+${l}`)
  ];
  return [...header, ...body].join('\n');
}

function resultFor(diff) {
  return analyze(parseDiff(diff));
}

describe('check-test-weakening', () => {
  it('allows adding tests and assertions', () => {
    const { failures, warnings } = resultFor(
      fileDiff('focus-tiger/src/core/foo.test.js', {
        added: [
          "it('covers the failure path', () => {",
          '  assert.equal(gate(), false);',
          '});'
        ]
      })
    );
    assert.deepEqual(failures, []);
    assert.deepEqual(warnings, []);
  });

  it('fails when assertions net-decrease', () => {
    const { failures } = resultFor(
      fileDiff('focus-tiger/src/core/foo.test.js', {
        removed: ['  assert.equal(a, 1);', '  assert.equal(b, 2);'],
        added: ['  assert.ok(true);']
      })
    );
    assert.equal(failures.length, 1);
    assert.match(failures[0], /断言净减少/);
  });

  it('fails when a skip/only marker is added', () => {
    const marker = ['test', 'skip'].join('.');
    const { failures } = resultFor(
      fileDiff('focus-tiger/e2e/bar.spec.js', {
        added: [`${marker}('temporarily quiet', () => {});`]
      })
    );
    assert.equal(failures.length, 1);
    assert.match(failures[0], /跳过/);
  });

  it('fails when a whole test file is deleted', () => {
    const { failures } = resultFor(
      fileDiff('focus-tiger/src/core/foo.test.js', { deleted: true })
    );
    assert.equal(failures.length, 1);
    assert.match(failures[0], /删除了整个测试文件/);
  });

  it('does not treat a 100% rename as deletion', () => {
    const diff = [
      'diff --git a/focus-tiger/src/core/old.test.js b/focus-tiger/src/core/new.test.js',
      'similarity index 100%',
      'rename from focus-tiger/src/core/old.test.js',
      'rename to focus-tiger/src/core/new.test.js'
    ].join('\n');
    const { failures, warnings } = resultFor(diff);
    assert.deepEqual(failures, []);
    assert.deepEqual(warnings, []);
  });

  it('acks a real reason and rejects a short one', () => {
    assert.equal(
      findAck({ TEST_WEAKEN_ACK: 'moved assertions into a shared helper' }),
      'moved assertions into a shared helper'
    );
    assert.equal(findAck({ TEST_WEAKEN_ACK: 'nope' }), null);
    assert.equal(
      findAck({ PR_BODY: 'Hello\nTest-Weakening-Ack: helper extract, same asserts\n' }),
      'helper extract, same asserts'
    );
  });

  it('ack clears a blocking failure; missing ack stays 1', () => {
    assert.equal(
      decideExit({ failures: ['x'], warnings: [], strict: false, ack: 'long enough reason' }),
      0
    );
    assert.equal(decideExit({ failures: ['x'], warnings: [], strict: false, ack: null }), 1);
  });

  it('counts @ts-ignore on comment lines as a warning', () => {
    const { failures, warnings } = resultFor(
      fileDiff('focus-tiger/src/core/foo.js', {
        added: ['// @ts-ignore legacy boundary']
      })
    );
    assert.deepEqual(failures, []);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /@ts-ignore/);
  });

  it('does not scan linter scripts as test files', () => {
    const { failures } = resultFor(
      fileDiff('focus-tiger/scripts/check-companion-contract.js', {
        removed: ['  assert.equal(hits.length, 0);']
      })
    );
    assert.deepEqual(failures, []);
  });

  it('exits 2 when --diff-file is missing', () => {
    const missing = join(tmpdir(), `ft-missing-weakening-${Date.now()}.diff`);
    const spawned = spawnSync(process.execPath, [scriptPath, '--diff-file', missing], {
      encoding: 'utf8'
    });
    assert.equal(spawned.status, 2);
    assert.match(spawned.stderr, /check-test-weakening 运行出错/);
  });

  it('CLI --diff-file returns 1 on assertion drop and 0 with ack env', () => {
    const diffPath = join(tmpdir(), `ft-weakening-${Date.now()}.diff`);
    writeFileSync(
      diffPath,
      fileDiff('focus-tiger/src/core/foo.test.js', {
        removed: ['  assert.equal(a, 1);']
      })
    );
    try {
      const blocked = spawnSync(process.execPath, [scriptPath, '--diff-file', diffPath], {
        encoding: 'utf8',
        env: { ...process.env, TEST_WEAKEN_ACK: '' }
      });
      assert.equal(blocked.status, 1);

      const acked = spawnSync(process.execPath, [scriptPath, '--diff-file', diffPath], {
        encoding: 'utf8',
        env: { ...process.env, TEST_WEAKEN_ACK: 'helper now owns the old asserts' }
      });
      assert.equal(acked.status, 0);
    } finally {
      unlinkSync(diffPath);
    }
  });
});

describe('check-test-weakening config', () => {
  it('treats src unit tests and e2e specs as test files', () => {
    const samples = [
      'focus-tiger/src/core/foo.test.js',
      'focus-tiger/e2e/payment-click-contract.spec.js',
      'focus-tiger/scripts/b1-architecture-gate.test.js'
    ];
    for (const path of samples) {
      assert.ok(
        CONFIG.testPathPatterns.some((p) => p.test(path)),
        path
      );
    }
  });
});
