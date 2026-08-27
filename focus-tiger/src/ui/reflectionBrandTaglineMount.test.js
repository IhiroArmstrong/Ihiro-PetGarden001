/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { mountReflectionBrandTagline } from './reflectionBrandTaglineMount.js';

test('mountReflectionBrandTagline appends bilingual footer under root', () => {
  const root = { appendChild() {} };
  const created = [];
  const createElement = (tag) => {
    const el = {
      tag,
      dataset: {},
      style: { cssText: '' },
      textContent: '',
      appendChild(child) {
        this.children = this.children || [];
        this.children.push(child);
      },
      children: []
    };
    created.push(el);
    return el;
  };
  let appended = null;
  root.appendChild = (node) => {
    appended = node;
  };

  const result = mountReflectionBrandTagline(
    root,
    {
      bilingual: true,
      lines: [
        { text: 'Walking the Yin Way?', role: 'primary' },
        { text: '(寅の道を歩む)', role: 'secondary' }
      ]
    },
    { createElement }
  );

  assert.ok(result?.host);
  assert.equal(appended?.dataset?.testid, 'reflection-brand-yin-way-tagline');
  assert.equal(created.filter((el) => el.tag === 'p').length, 2);
});
