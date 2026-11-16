/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export function parseCodesignVerbose(text) {
  const blob = String(text || '');
  const developerIdSigned = /Authority=Developer ID Application:/.test(blob);
  const adHocSigned = /Signature=adhoc/.test(blob);
  const hardenedRuntimeVerified = /\(.*\bruntime\b.*\)/.test(blob);
  return {
    developerIdSigned,
    adHocSigned,
    hardenedRuntimeVerified
  };
}

export function parseStaplerValidate(text, status) {
  const blob = `${text || ''}`;
  return Number(status) === 0 && /The validate action worked/i.test(blob);
}

export function parseNotarytoolWaitOutput(text, exitCode) {
  const blob = String(text || '');
  const idMatch = blob.match(/id:\s*([0-9a-f-]{36})/i);
  const statusMatch = blob.match(/status:\s*(\w+)/i);
  const status = statusMatch ? statusMatch[1] : '';
  return {
    accepted: /status:\s*Accepted/i.test(blob),
    status,
    submissionId: idMatch ? idMatch[1] : '',
    okExit: Number(exitCode) === 0
  };
}

export function hasDeveloperIdApplicationIdentity(identityListText) {
  return /Developer ID Application:/.test(String(identityListText || ''));
}

export function packagedAppBundleFromExecPath(execPath) {
  const raw = String(execPath || '');
  const marker = '.app/';
  const idx = raw.lastIndexOf(marker);
  if (idx < 0) return '';
  return raw.slice(0, idx + 4);
}

export function findPackagedMacApp(releaseDir) {
  const macDir = path.join(releaseDir, 'mac-arm64');
  if (!existsSync(macDir)) return '';
  const name = readdirSync(macDir).find((entry) => entry.endsWith('.app'));
  return name ? path.join(macDir, name) : '';
}

/** Newest non-blockmap `.dmg` in `desktop/release` (prep or customer pack). */
export function findReleaseDmg(releaseDir) {
  if (!existsSync(releaseDir)) return '';
  const name = readdirSync(releaseDir).find(
    (entry) => entry.endsWith('.dmg') && !entry.endsWith('.blockmap')
  );
  return name ? path.join(releaseDir, name) : '';
}

export function stapleArtifactsWithXcrun(paths) {
  const targets = paths.filter(Boolean);
  const results = [];
  for (const target of targets) {
    const stapled = spawnSync('xcrun', ['stapler', 'staple', target], {
      encoding: 'utf8'
    });
    const text = `${stapled.stdout || ''}\n${stapled.stderr || ''}`;
    results.push({
      path: target,
      ok: stapled.status === 0,
      text: text.trim()
    });
  }
  return results;
}

export function inspectPackagedAppSignature(appPath) {
  if (!appPath || !existsSync(appPath)) {
    return {
      developerIdSigned: false,
      adHocSigned: false,
      hardenedRuntimeVerified: false,
      notarized: false,
      detail: 'no packaged app'
    };
  }
  const codesign = spawnSync('codesign', ['-dv', '--verbose=4', appPath], {
    encoding: 'utf8'
  });
  const codesignText = `${codesign.stdout || ''}\n${codesign.stderr || ''}`;
  const parsed = parseCodesignVerbose(codesignText);
  const stapler = spawnSync('xcrun', ['stapler', 'validate', appPath], {
    encoding: 'utf8'
  });
  const staplerText = `${stapler.stdout || ''}\n${stapler.stderr || ''}`;
  return {
    ...parsed,
    notarized: parseStaplerValidate(staplerText, stapler.status),
    detail: codesignText.trim()
  };
}

export function readCodesigningIdentityList() {
  const listed = spawnSync('security', ['find-identity', '-v', '-p', 'codesigning'], {
    encoding: 'utf8'
  });
  return `${listed.stdout || ''}\n${listed.stderr || ''}`;
}
