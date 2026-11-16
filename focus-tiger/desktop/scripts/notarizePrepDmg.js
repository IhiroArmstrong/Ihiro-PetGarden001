/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Submits the prep DMG to Apple notarization using a Keychain profile.
 * Preferred profile is an App Store Connect API key stored with:
 *   xcrun notarytool store-credentials samatia-notary --key <api-key-file> --key-id <id> --issuer <uuid>
 * Do not commit API key files or paste key material into git.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNotarytoolWaitOutput } from '../../src/core/packSignatureInspect.js';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(desktopDir, 'release');
const profile = process.env.FT_NOTARY_PROFILE || 'samatia-notary';

function findDmg() {
  if (!existsSync(releaseDir)) return '';
  const name = readdirSync(releaseDir).find(
    (entry) => entry.endsWith('.dmg') && !entry.endsWith('.blockmap')
  );
  return name ? path.join(releaseDir, name) : '';
}

const dmg = process.argv[2] || findDmg();
if (!dmg || !existsSync(dmg)) {
  console.error('notarize prep: no DMG in desktop/release');
  process.exit(1);
}

const submitted = spawnSync(
  'xcrun',
  ['notarytool', 'submit', dmg, '--keychain-profile', profile, '--wait'],
  { encoding: 'utf8' }
);
const text = `${submitted.stdout || ''}\n${submitted.stderr || ''}`;
process.stdout.write(text);
const parsed = parseNotarytoolWaitOutput(text, submitted.status);
if (!parsed.accepted) {
  console.error(`notarize prep: not accepted (${parsed.status || 'unknown'})`);
  process.exit(submitted.status || 1);
}
console.log(`notarize prep: accepted id=${parsed.submissionId || ''}`);
process.exit(0);
