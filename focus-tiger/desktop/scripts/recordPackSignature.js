/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Developer ID signing is required before hardened runtime can be claimed.
 * Ad-hoc signing the outer app on this Mac breaks Electron Framework
 * (different Team IDs) and the GUI process will not start. Do not do that.
 * With zero identities, leave Electron's signature untouched and record
 * that the package is unsigned.
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const notePath = path.join(desktopDir, 'release', 't95-sign-note.json');

const listed = spawnSync('security', ['find-identity', '-v', '-p', 'codesigning'], { encoding: 'utf8' });
const text = `${listed.stdout || ''}\n${listed.stderr || ''}`;
const countLine = text.match(/(\d+)\s+valid identities found/);
const count = countLine ? Number(countLine[1]) : 0;
const note = {
  developerIdIdentities: count,
  developerIdSigned: false,
  notarized: false,
  adHocSigned: false,
  hardenedRuntimeVerified: false,
  detail: count > 0
    ? 'Developer ID identities exist. electron-builder owns signing; this script does not ad-hoc resign the app.'
    : 'No Developer ID on this Mac. The package stays unsigned. Ad-hoc signing the app was not applied because it invalidates Electron Framework (Team ID mismatch) and the GUI process cannot start.'
};
writeFileSync(notePath, JSON.stringify(note, null, 2) + '\n');
console.log(note.detail);
