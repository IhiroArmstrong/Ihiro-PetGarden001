/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Reflection Phase A — mount free Daily Wisdom under the card footer.
 * No Sanctuary seal (Phase B). Quiet Line / echo pools stay separate.
 */

/**
 * @param {HTMLElement} root Reflection card root (`#tiger-reflection-moment`)
 * @param {{ createElement?: (tag: string) => HTMLElement }} [opts]
 * @returns {{ host: HTMLElement, el: HTMLElement }}
 */
export function mountReflectionDailyWisdom(
  root,
  { createElement = (tag) => document.createElement(tag) } = {}
) {
  const host = createElement('div');
  host.dataset.testid = 'reflection-daily-wisdom';
  host.style.cssText = [
    'margin-top:12px',
    'padding-top:10px',
    'border-top:1px solid rgba(139,115,85,.16)',
    'max-height:min(28vh, 160px)',
    'overflow-y:auto',
    '-webkit-overflow-scrolling:touch'
  ].join(';');

  const el = createElement('daily-wisdom');
  host.appendChild(el);
  root.appendChild(host);
  return { host, el };
}
