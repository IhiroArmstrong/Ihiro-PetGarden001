/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasDeveloperIdApplicationIdentity,
  packagedAppBundleFromExecPath,
  parseCodesignVerbose,
  parseNotarytoolWaitOutput,
  parseStaplerValidate
} from './packSignatureInspect.js';

const packSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../desktop/scripts/pack.js'),
  'utf8'
);
const entitlements = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../desktop/entitlements.mac.plist'),
  'utf8'
);
const inspectSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'packSignatureInspect.js'),
  'utf8'
);

describe('T95 pack signature inspect', () => {
  it('treats Developer ID + runtime flags as signed with hardened runtime, not ad hoc', () => {
    const parsed = parseCodesignVerbose(`
Identifier=com.twinsology.samatia
Format=app bundle with Mach-O thin (arm64)
CodeDirectory v=20500 size=123 flags=0x10000(runtime) hashes=12
Authority=Developer ID Application: Zhaoyi He (8PWG3CS3RL)
Authority=Developer ID Certification Authority
Authority=Apple Root CA
`);
    assert.equal(parsed.developerIdSigned, true);
    assert.equal(parsed.hardenedRuntimeVerified, true);
    assert.equal(parsed.adHocSigned, false);
  });

  it('does not treat an unsigned or ad-hoc blob as Developer ID signed', () => {
    assert.equal(parseCodesignVerbose('Signature=adhoc').developerIdSigned, false);
    assert.equal(parseCodesignVerbose('Signature=adhoc').adHocSigned, true);
    assert.equal(parseCodesignVerbose('').hardenedRuntimeVerified, false);
    assert.equal(parseStaplerValidate('The validate action worked!', 0), true);
    assert.equal(parseStaplerValidate('error', 1), false);
    const wait = parseNotarytoolWaitOutput(
      'id: 11111111-2222-3333-4444-555555555555\nstatus: Accepted\n',
      0
    );
    assert.equal(wait.accepted, true);
    assert.equal(wait.submissionId, '11111111-2222-3333-4444-555555555555');
    assert.equal(parseNotarytoolWaitOutput('status: Invalid', 1).accepted, false);
  });

  it('finds a Developer ID Application line in security identity output', () => {
    assert.equal(
      hasDeveloperIdApplicationIdentity(
        '1) ABC "Developer ID Application: Zhaoyi He (8PWG3CS3RL)"\n1 valid identities found'
      ),
      true
    );
    assert.equal(hasDeveloperIdApplicationIdentity('0 valid identities found'), false);
    assert.equal(
      packagedAppBundleFromExecPath(
        '/tmp/release/mac-arm64/Samatia.app/Contents/MacOS/Samatia'
      ),
      '/tmp/release/mac-arm64/Samatia.app'
    );
  });

  it('lets probe pack keep Developer ID auto-discovery when an identity exists', () => {
    assert.match(packSrc, /hasDeveloperIdApplicationIdentity/);
    assert.match(packSrc, /readCodesigningIdentityList/);
    assert.match(packSrc, /canSignWithDeveloperId/);
    assert.match(packSrc, /if \(probePack && !canSignWithDeveloperId\)/);
    assert.match(packSrc, /CSC_IDENTITY_AUTO_DISCOVERY/);
    assert.match(entitlements, /com\.apple\.security\.cs\.disable-library-validation/);
    const notarizeSrc = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../desktop/scripts/notarizePrepDmg.js'),
      'utf8'
    );
    const stapleSrc = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../desktop/scripts/staplePrepArtifacts.js'),
      'utf8'
    );
    const pipelineSrc = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../../desktop/scripts/runPrepSignNotarizeStaple.js'
      ),
      'utf8'
    );
    assert.match(notarizeSrc, /--keychain-profile/);
    assert.match(notarizeSrc, /samatia-notary/);
    assert.equal(notarizeSrc.includes('.p8'), false);
    assert.match(stapleSrc, /xcrun/);
    assert.match(pipelineSrc, /prep pipeline/);
    assert.match(inspectSrc, /spawnSync\('xcrun', \['stapler'/);
  });
});
