/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Reflection Slice 2 — brand tagline footer (first visit bilingual).
 */

/**
 * @param {HTMLElement} root Reflection card root (`#tiger-reflection-moment`)
 * @param {{ bilingual?: boolean, lines?: Array<{ text: string, role?: string }> }} resolved
 * @param {{ createElement?: (tag: string) => HTMLElement }} [opts]
 * @returns {{ host: HTMLElement } | null}
 */
export function mountReflectionBrandTagline(
  root,
  resolved,
  { createElement = (tag) => document.createElement(tag) } = {}
) {
  const lines = (resolved?.lines || [])
    .map((line) => ({
      text: String(line?.text || '').trim(),
      role: line?.role === 'secondary' ? 'secondary' : 'primary'
    }))
    .filter((line) => line.text);
  if (!lines.length) return null;

  const host = createElement('div');
  host.dataset.testid = 'reflection-brand-yin-way-tagline';
  host.style.cssText = [
    'margin-top:10px',
    'padding:8px 4px 2px',
    'border-top:1px solid rgba(139,115,85,.12)',
    'text-align:center'
  ].join(';');

  for (const line of lines) {
    const p = createElement('p');
    p.dataset.role = line.role;
    p.style.cssText =
      line.role === 'secondary'
        ? 'margin:4px 0 0;padding:0;font-size:12px;line-height:1.4;font-weight:400;color:#7a6554;opacity:0.9'
        : 'margin:0;padding:0;font-size:12.5px;line-height:1.4;font-weight:500;color:#5c4330;letter-spacing:0.02em';
    p.textContent = line.text;
    host.appendChild(p);
  }

  root.appendChild(host);
  return { host };
}
