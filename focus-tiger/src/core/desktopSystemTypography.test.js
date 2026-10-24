/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  DESKTOP_SHELL_HTML_CLASS,
  DESKTOP_UI_FONT_FAMILY,
  applyDesktopShellTypographyClass
} from './desktopSystemTypography.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('desktopSystemTypography (T40)', () => {
  it('exports a system sans stack with PingFang and SF Pro names', () => {
    assert.match(DESKTOP_UI_FONT_FAMILY, /-apple-system/);
    assert.match(DESKTOP_UI_FONT_FAMILY, /PingFang SC/);
    assert.match(DESKTOP_UI_FONT_FAMILY, /SF Pro Text/);
    assert.doesNotMatch(DESKTOP_UI_FONT_FAMILY, /Nunito/);
  });

  it('adds html class only when desktop shell is active', () => {
    const doc = {
      documentElement: { classList: { add() {}, remove() {}, contains: () => false } }
    };
    let added = false;
    doc.documentElement.classList.add = (name) => {
      if (name === DESKTOP_SHELL_HTML_CLASS) added = true;
    };
    let removed = false;
    doc.documentElement.classList.remove = (name) => {
      if (name === DESKTOP_SHELL_HTML_CLASS) removed = true;
    };

    assert.equal(
      applyDesktopShellTypographyClass(doc, { desktopShell: { isDesktop: true } }),
      true
    );
    assert.equal(added, true);

    added = false;
    assert.equal(
      applyDesktopShellTypographyClass(doc, { desktopShell: { isDesktop: false } }),
      false
    );
    assert.equal(removed, true);
    assert.equal(applyDesktopShellTypographyClass(doc, {}), false);
  });

  it('design-tokens override desktop shell without changing web default', () => {
    const css = readFileSync(
      join(repoRoot, 'src/styles/design-tokens.css'),
      'utf8'
    );
    assert.match(css, /--font-family:\s*"Nunito"/);
    assert.match(css, new RegExp(`html\\.${DESKTOP_SHELL_HTML_CLASS}`));
    assert.match(css, /PingFang SC/);
  });

  it('index.html bootstraps desktop class before module load', () => {
    const html = readFileSync(join(repoRoot, 'index.html'), 'utf8');
    assert.match(html, /ft-desktop-shell/);
    assert.match(html, /desktopShell\.isDesktop/);
  });

  it('main.js applies typography class during init', () => {
    const main = readFileSync(join(repoRoot, 'src/main.js'), 'utf8');
    assert.match(main, /applyDesktopShellTypographyClass/);
  });
});
