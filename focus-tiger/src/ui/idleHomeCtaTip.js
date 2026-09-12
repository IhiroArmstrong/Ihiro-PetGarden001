/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/** Fast hover label for Idle home balls — avoids native `title` ~1s delay. */
export const IDLE_HOME_CTA_TIP_STYLE_ID = 'idle-home-cta-tip-styles-v1';

/**
 * @param {HTMLElement | null | undefined} btn
 * @param {string} label
 */
export function syncIdleHomeCtaTip(btn, label) {
  if (!btn) return;
  const text = String(label || '').trim();
  btn.setAttribute('aria-label', text);
  btn.removeAttribute('title');
  if (text) btn.dataset.ftTip = text;
  else delete btn.dataset.ftTip;
}

export function injectIdleHomeCtaTipStyles() {
  if (document.getElementById(IDLE_HOME_CTA_TIP_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = IDLE_HOME_CTA_TIP_STYLE_ID;
  style.textContent = `
    [data-ft-tip] {
      position: relative;
    }
    [data-ft-tip]::after {
      content: attr(data-ft-tip);
      position: absolute;
      left: 50%;
      bottom: calc(100% + 8px);
      transform: translateX(-50%) translateY(4px);
      max-width: min(240px, 70vw);
      padding: 6px 10px;
      border-radius: 10px;
      background: rgba(44, 31, 20, 0.88);
      color: #fff8ef;
      font-size: 12px;
      line-height: 1.35;
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      z-index: 40;
      transition: opacity 120ms ease, transform 120ms ease;
    }
    [data-ft-tip]:hover::after,
    [data-ft-tip]:focus-visible::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    @media (hover: none) {
      [data-ft-tip]::after {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}
