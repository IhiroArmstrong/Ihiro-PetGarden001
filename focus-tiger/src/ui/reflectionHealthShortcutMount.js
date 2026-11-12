/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t } from '../locales/i18n.js';
import { readHealthShortcutLogEnabled } from '../core/healthShortcutLogPreference.js';
import { buildHealthShortcutRunUrl } from '../core/healthShortcutUrl.js';
import { isIosShortcutsHealthSurface } from '../core/healthShortcutPlatform.js';
import { resolveObservedSessionMinutes } from '../core/sessionEndObservedDuration.js';

/**
 * @param {HTMLElement} root Reflection card root
 * @param {object} opts
 * @param {number} opts.elapsedSeconds
 * @param {Storage | null | undefined} [opts.storage]
 * @param {(url: string) => void} [opts.openUrl]
 * @returns {{ host: HTMLElement, button: HTMLButtonElement, hint: HTMLElement } | null}
 */
export function mountReflectionHealthShortcut(
  root,
  { elapsedSeconds, storage = null, openUrl }
) {
  const host = document.createElement('div');
  host.dataset.testid = 'reflection-health-shortcut-host';
  host.hidden = true;
  host.style.cssText = [
    'margin-top:12px',
    'display:flex',
    'flex-direction:column',
    'gap:8px',
    'align-items:stretch'
  ].join(';');

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.testid = 'health-shortcut-log-button';
  button.style.cssText = [
    'width:100%',
    'padding:9px 12px',
    'font-size:13px',
    'font-weight:600',
    'color:#4a3a28',
    'background:rgba(255,255,255,.55)',
    'border:1px solid rgba(139,115,85,.28)',
    'border-radius:12px',
    'cursor:pointer'
  ].join(';');

  const hint = document.createElement('p');
  hint.dataset.testid = 'health-shortcut-log-hint';
  hint.style.cssText =
    'margin:0;font-size:11px;line-height:1.45;color:rgba(74,58,40,.72);';

  host.append(button, hint);
  root.insertBefore(host, root.lastElementChild);

  const navigate =
    openUrl ??
    ((url) => {
      window.location.href = url;
    });

  button.addEventListener('click', () => {
    const minutes = resolveObservedSessionMinutes(elapsedSeconds);
    const url = minutes ? buildHealthShortcutRunUrl(minutes, 'sit') : null;
    if (!url) return;
    try {
      navigate(url);
    } catch {
      hint.hidden = false;
      hint.textContent = t('HEALTH_SHORTCUT_INSTALL_HINT');
    }
  });

  syncReflectionHealthShortcut(host, button, hint, {
    elapsedSeconds,
    storage,
    wisdomHold: false
  });

  return { host, button, hint };
}

/**
 * @param {HTMLElement} host
 * @param {HTMLButtonElement} button
 * @param {HTMLElement} hint
 * @param {object} opts
 * @param {number} opts.elapsedSeconds
 * @param {boolean} opts.wisdomHold
 * @param {Storage | null | undefined} [opts.storage]
 */
export function syncReflectionHealthShortcut(
  host,
  button,
  hint,
  { elapsedSeconds, wisdomHold, storage = null }
) {
  const store =
    storage ??
    (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
  const enabled = readHealthShortcutLogEnabled(store);
  const minutes = resolveObservedSessionMinutes(elapsedSeconds);
  const show =
    wisdomHold &&
    enabled &&
    isIosShortcutsHealthSurface() &&
    minutes !== null;

  host.hidden = !show;
  button.hidden = !show;
  hint.hidden = !show;

  if (!show) return;

  button.textContent = t('HEALTH_SHORTCUT_LOG_BUTTON');
  hint.textContent = t('HEALTH_SHORTCUT_LOG_HINT');
  button.disabled = false;
}
