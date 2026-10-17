/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocaleSliceIndex } from '../../../scripts/write-locale-slice-index.js';
import { CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION } from './confideRoutingClassHoldoutLab.js';
import {
  CONFIDE_ROUTING_EN_BV6_SET,
  assertRoutingHoldoutScoringAllowed,
  isConfideRoutingEnBv6Set
} from './confideRoutingHoldoutCurvesOnly.js';

writeLocaleSliceIndex();

const WORKSPACE = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const CLI = path.join(WORKSPACE, 'desktop/scripts/l0-kb-routing-class-holdout-lab.js');
const SECRET = 'SYNTHETIC_EN_BV6_DO_NOT_ECHO';

describe('confideRoutingHoldoutCurvesOnly', () => {
  it('refuses en/b-v6 scoring even in curves-only (this test is red if the refuse is removed)', () => {
    assert.equal(isConfideRoutingEnBv6Set(CONFIDE_ROUTING_EN_BV6_SET), true);
    assert.throws(
      () =>
        assertRoutingHoldoutScoringAllowed({
          holdoutSetVersion: CONFIDE_ROUTING_EN_BV6_SET,
          curvesOnly: true,
          logPath: '/tmp/missing-routing-runs.json',
          filePath: '/tmp/en-bv6.json'
        }),
      /EN_BV6_QUOTA_NOT_ACCEPTED|点头≠占额/
    );
  });

  it('allows curves-only on a voided zh/b-v5 file without treating it as quota', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-curves-only-'));
    const file = path.join(dir, 'sealed-b-v5.json');
    const logPath = path.join(dir, 'runs.json');
    writeFileSync(file, '{}\n');
    writeFileSync(
      logPath,
      `${JSON.stringify({
        byHoldoutSetVersion: {
          'confide-routing-blind-zh/b-v5': {
            files: {
              [file]: { sha256: 'abc', runs: 1, voided: true }
            }
          }
        }
      })}\n`
    );
    const gate = assertRoutingHoldoutScoringAllowed({
      holdoutSetVersion: 'confide-routing-blind-zh/b-v5',
      curvesOnly: true,
      logPath,
      filePath: file
    });
    assert.equal(gate.mode, 'curves_only');
    assert.equal(gate.quota_incremented, false);
    rmSync(dir, { recursive: true, force: true });
  });

  it('CLI --curves-only on en/b-v6 exits before scoring and does not echo items', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-curves-cli-'));
    const file = path.join(dir, 'en-bv6.json');
    const logPath = path.join(dir, 'runs.json');
    writeFileSync(
      file,
      `${JSON.stringify({
        brief_version: CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION,
        holdout_set_version: CONFIDE_ROUTING_EN_BV6_SET,
        author_prompt_id: 'synthetic-en-bv6-do-not-score',
        items: [{ id: 'x', class: 'mixed', text: SECRET }]
      })}\n`
    );
    writeFileSync(logPath, '{}\n');
    const ran = spawnSync(process.execPath, [CLI, '--curves-only'], {
      env: {
        ...process.env,
        FT_CONFIDE_ROUTING_HOLDOUT_PATH: file,
        FT_CONFIDE_ROUTING_HOLDOUT_RUN_LOG: logPath
      },
      encoding: 'utf8'
    });
    assert.notEqual(ran.status, 0);
    assert.match(`${ran.stderr}${ran.stdout}`, /EN_BV6_QUOTA_NOT_ACCEPTED|点头≠占额/);
    assert.doesNotMatch(`${ran.stdout}${ran.stderr}`, /作废卷回放，非过关证据/);
    assert.equal(`${ran.stdout}${ran.stderr}`.includes(SECRET), false);
    rmSync(dir, { recursive: true, force: true });
  });
});
