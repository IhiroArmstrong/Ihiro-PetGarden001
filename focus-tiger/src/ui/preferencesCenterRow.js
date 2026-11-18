/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Fill a Preferences Center (or shared secondary) menu button with
 * icon + title + hint + trailing status / chevron / toggle.
 *
 * @param {HTMLButtonElement} btn
 * @param {{
 *   label: string,
 *   hint?: string,
 *   status?: string,
 *   icon?: string,
 *   prefKind?: string,
 *   toggleOn?: boolean
 * }} view
 * @returns {void}
 */
export function fillPreferencesCenterRow(btn, view) {
  btn.textContent = '';
  const icon = document.createElement('span');
  icon.className = 'ft-pref-row__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = view.icon || '';

  const copy = document.createElement('span');
  copy.className = 'ft-pref-row__copy';
  const title = document.createElement('span');
  title.className = 'ft-pref-row__title';
  title.textContent = view.label;
  copy.appendChild(title);
  if (view.hint) {
    const hint = document.createElement('span');
    hint.className = 'ft-pref-row__hint';
    hint.textContent = view.hint;
    copy.appendChild(hint);
  }

  const trail = document.createElement('span');
  trail.className = 'ft-pref-row__trail';
  if (view.prefKind === 'toggle') {
    const toggle = document.createElement('span');
    toggle.className = 'ft-pref-row__switch';
    toggle.dataset.prefSwitch = '1';
    toggle.dataset.on = view.toggleOn ? '1' : '0';
    toggle.setAttribute('aria-hidden', 'true');
    trail.appendChild(toggle);
  } else {
    if (view.status) {
      const status = document.createElement('span');
      status.className = 'ft-pref-row__status';
      status.textContent = view.status;
      trail.appendChild(status);
    }
    const chevron = document.createElement('span');
    chevron.className = 'ft-pref-row__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '›';
    trail.appendChild(chevron);
  }

  btn.append(icon, copy, trail);
  btn.classList.add('ft-pref-row');
  if (view.prefKind) btn.dataset.prefKind = view.prefKind;
}
