/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Minimal paper-lantern SVG glyphs for Quiet Together + Focus Circle presence.
 * Vanilla DOM — no static assets; gradient ids must be unique per instance.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {Document} doc
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 */
function el(doc, tag, attrs = {}) {
  const node = doc.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

/**
 * @param {Document} doc
 * @param {string} gradId
 * @returns {SVGElement}
 */
export function createGlobalLanternIcon(doc, gradId) {
  const svg = el(doc, 'svg', {
    width: '14',
    height: '16',
    viewBox: '0 0 14 16',
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false'
  });

  const defs = el(doc, 'defs');
  const gradient = el(doc, 'radialGradient', {
    id: gradId,
    cx: '50%',
    cy: '30%',
    r: '70%'
  });
  gradient.append(
    el(doc, 'stop', { offset: '0%', 'stop-color': '#FFE9B8' }),
    el(doc, 'stop', { offset: '100%', 'stop-color': '#D4A24A' })
  );
  defs.appendChild(gradient);
  svg.appendChild(defs);

  svg.append(
    el(doc, 'line', {
      x1: '7',
      y1: '0',
      x2: '7',
      y2: '2',
      stroke: '#FFE9B8',
      'stroke-width': '1',
      'stroke-linecap': 'round'
    }),
    el(doc, 'rect', {
      x: '2',
      y: '2',
      width: '10',
      height: '10',
      rx: '4',
      fill: `url(#${gradId})`,
      stroke: '#D4A24A',
      'stroke-width': '0.8'
    }),
    el(doc, 'circle', {
      cx: '7',
      cy: '7',
      r: '2',
      fill: '#FFF2D6',
      opacity: '0.8'
    }),
    el(doc, 'line', {
      x1: '7',
      y1: '12',
      x2: '7',
      y2: '15',
      stroke: '#D4A24A',
      'stroke-width': '1',
      'stroke-dasharray': '1 1'
    })
  );

  return svg;
}

/**
 * @param {Document} doc
 * @param {string} gradId
 * @param {'default' | 'was-here'} [variant]
 * @returns {SVGElement}
 */
export function createCircleLanternIcon(doc, gradId, variant = 'default') {
  const muted = variant === 'was-here';
  const svg = el(doc, 'svg', {
    width: '12',
    height: '14',
    viewBox: '0 0 12 14',
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false'
  });

  const defs = el(doc, 'defs');
  const gradient = el(doc, 'radialGradient', {
    id: gradId,
    cx: '50%',
    cy: '30%',
    r: '70%'
  });
  gradient.append(
    el(doc, 'stop', {
      offset: '0%',
      'stop-color': muted ? '#DCE4EE' : '#E8F0FF'
    }),
    el(doc, 'stop', {
      offset: '100%',
      'stop-color': muted ? '#9AA8B8' : '#8AA4C8'
    })
  );
  defs.appendChild(gradient);
  svg.appendChild(defs);

  svg.append(
    el(doc, 'line', {
      x1: '6',
      y1: '0',
      x2: '6',
      y2: '2',
      stroke: muted ? '#DCE4EE' : '#E8F0FF',
      'stroke-width': '1'
    }),
    el(doc, 'rect', {
      x: '1.5',
      y: '2',
      width: '9',
      height: '8.5',
      rx: '3.5',
      fill: `url(#${gradId})`,
      stroke: muted ? '#9AA8B8' : '#8AA4C8',
      'stroke-width': '0.8'
    }),
    el(doc, 'circle', {
      cx: '6',
      cy: '6.25',
      r: '1.5',
      fill: '#FFFFFF',
      opacity: muted ? '0.55' : '0.85'
    }),
    el(doc, 'line', {
      x1: '6',
      y1: '10.5',
      x2: '6',
      y2: '13',
      stroke: muted ? '#9AA8B8' : '#8AA4C8',
      'stroke-width': '1',
      'stroke-dasharray': '1 1'
    })
  );

  return svg;
}

/**
 * @param {Document} doc
 * @param {'global' | 'circle'} kind
 * @param {number} index
 * @param {'default' | 'was-here'} [variant]
 * @returns {HTMLElement}
 */
export function createPresenceLanternShell(doc, kind, index, variant = 'default') {
  const shell = doc.createElement('span');
  shell.className =
    kind === 'global'
      ? 'quiet-together-lanterns__lantern'
      : `focus-circle-presence__lantern${
          variant === 'was-here' ? ' focus-circle-presence__lantern--was-here' : ''
        }`;
  const gradId = `${kind}-presence-lantern-grad-${index}`;
  const svg =
    kind === 'global'
      ? createGlobalLanternIcon(doc, gradId)
      : createCircleLanternIcon(doc, gradId, variant);
  shell.appendChild(svg);
  return shell;
}
