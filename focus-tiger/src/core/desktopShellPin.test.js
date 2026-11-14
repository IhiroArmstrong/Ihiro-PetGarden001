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
  DESKTOP_ELECTRON_PIN,
  MAC_INSTALLER_TITLE,
  MAC_MINIMUM_SYSTEM_VERSION,
  assertDesktopShellPin
} from './desktopShellPin.js';

const desktopPkg = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../desktop/package.json'),
    'utf8'
  )
);

describe('T95 desktop shell pin', () => {
  it('locks Electron 45 and states macOS 13 on the app and the installer', () => {
    assert.equal(DESKTOP_ELECTRON_PIN.startsWith('45.'), true);
    assert.equal(MAC_MINIMUM_SYSTEM_VERSION, '13.0');
    assert.match(MAC_INSTALLER_TITLE, /macOS 13/);
    const result = assertDesktopShellPin(desktopPkg);
    assert.equal(result.ok, true, result.ok ? '' : result.error);
  });

  it('rejects Electron 46 and a shell that hides the macOS floor', () => {
    const tooNew = assertDesktopShellPin({
      devDependencies: { electron: '46.0.0' },
      build: {
        mac: { minimumSystemVersion: '13.0' },
        dmg: { title: MAC_INSTALLER_TITLE }
      }
    });
    assert.equal(tooNew.ok, false);

    const hidden = assertDesktopShellPin({
      devDependencies: { electron: DESKTOP_ELECTRON_PIN },
      build: {
        mac: { minimumSystemVersion: '12.0' },
        dmg: { title: 'Samatia' }
      }
    });
    assert.equal(hidden.ok, false);
  });
});
