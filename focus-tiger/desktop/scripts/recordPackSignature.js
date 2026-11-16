/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Record whether the packaged app is Developer ID signed.
 * Ad-hoc signing the outer app on this Mac breaks Electron Framework
 * (different Team IDs) and the GUI process will not start. Do not do that.
 * electron-builder owns signing when a Developer ID identity exists.
 */

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findPackagedMacApp,
  hasDeveloperIdApplicationIdentity,
  inspectPackagedAppSignature,
  readCodesigningIdentityList
} from '../../src/core/packSignatureInspect.js';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(desktopDir, 'release');
const notePath = path.join(releaseDir, 't95-sign-note.json');
const identityText = readCodesigningIdentityList();
const identityCountMatch = identityText.match(/(\d+)\s+valid identities found/);
const appPath = findPackagedMacApp(releaseDir);
const inspected = inspectPackagedAppSignature(appPath);
const note = {
  developerIdIdentities: identityCountMatch ? Number(identityCountMatch[1]) : 0,
  developerIdSigned: inspected.developerIdSigned === true,
  notarized: inspected.notarized === true,
  adHocSigned: inspected.adHocSigned === true,
  hardenedRuntimeVerified: inspected.hardenedRuntimeVerified === true,
  detail: inspected.developerIdSigned
    ? 'Packaged app is Developer ID signed. Notarization is separate and stays false until stapler validate succeeds.'
    : hasDeveloperIdApplicationIdentity(identityText)
      ? 'Developer ID identities exist, but the packaged app is not Developer ID signed. electron-builder owns signing; this script does not ad-hoc resign the app.'
      : 'No Developer ID on this Mac. The package stays unsigned. Ad-hoc signing the app was not applied because it invalidates Electron Framework (Team ID mismatch) and the GUI process cannot start.'
};
writeFileSync(notePath, JSON.stringify(note, null, 2) + '\n');
console.log(note.detail);
