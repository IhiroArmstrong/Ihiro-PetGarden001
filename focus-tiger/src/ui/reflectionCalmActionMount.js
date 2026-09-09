/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Reflection · mount Calm Action Reflect line above Daily Wisdom.
 * Separate pool from `<daily-wisdom>` and Reflection echo.
 */

/**
 * @param {HTMLElement} root Reflection card root (`#tiger-reflection-moment`)
 * @param {import('../core/CalmActionReflectStore.js').CalmActionReflectStore} store
 * @param {string} locale
 * @param {{ createElement?: (tag: string) => HTMLElement }} [opts]
 * @returns {{ host: HTMLElement | null, lineEl: HTMLElement | null }}
 */
export function mountReflectionCalmAction(
  root,
  store,
  locale,
  { createElement = (tag) => document.createElement(tag) } = {}
) {
  const entry = store.resolveQuote(locale);
  if (!entry?.text) {
    return { host: null, lineEl: null };
  }

  const host = createElement('div');
  host.dataset.testid = 'reflection-calm-action';
  host.style.cssText = [
    'margin-top:12px',
    'padding:10px 6px 4px',
    'border-top:1px solid rgba(139,115,85,.14)'
  ].join(';');

  const lineEl = createElement('p');
  lineEl.dataset.testid = 'calm-action-reflect-line';
  lineEl.dataset.calmActionId = entry.id;
  lineEl.style.cssText = [
    'margin:0',
    'font-size:13px',
    'line-height:1.55',
    'font-weight:460',
    'letter-spacing:0.01em',
    'color:#4a3a28',
    'text-align:center'
  ].join(';');
  lineEl.textContent = entry.text;

  host.appendChild(lineEl);
  root.appendChild(host);
  return { host, lineEl };
}

/**
 * @param {HTMLElement | null} lineEl
 * @param {import('../core/CalmActionReflectStore.js').CalmActionReflectStore} store
 * @param {string} locale
 */
export function refreshReflectionCalmActionLine(lineEl, store, locale) {
  if (!lineEl) return;
  const entry = store.resolveQuote(locale);
  if (!entry?.text) {
    lineEl.textContent = '';
    lineEl.dataset.calmActionId = '';
    return;
  }
  lineEl.textContent = entry.text;
  lineEl.dataset.calmActionId = entry.id;
}
