import test from 'node:test';
import assert from 'node:assert/strict';

import { mountReflectionDailyWisdom } from './reflectionDailyWisdomMount.js';

function fakeCreateElement(tag) {
  const children = [];
  /** @type {any} */
  const el = {
    tagName: String(tag).toUpperCase(),
    style: { cssText: '' },
    dataset: {},
    children,
    appendChild(child) {
      children.push(child);
      return child;
    }
  };
  return el;
}

test('mountReflectionDailyWisdom appends host + daily-wisdom under root', () => {
  /** @type {any[]} */
  const appended = [];
  const root = {
    appendChild(node) {
      appended.push(node);
      return node;
    }
  };

  const { host, el } = mountReflectionDailyWisdom(root, {
    createElement: fakeCreateElement
  });

  assert.equal(appended.length, 1);
  assert.equal(appended[0], host);
  assert.equal(host.dataset.testid, 'reflection-daily-wisdom');
  assert.match(host.style.cssText, /margin-top:12px/);
  assert.equal(el.tagName, 'DAILY-WISDOM');
  assert.equal(host.children[0], el);
});

test('mountReflectionDailyWisdom does not require Skip / Continue coupling', () => {
  // Contract lock: mount is presentational only — no gate flags returned.
  const root = { appendChild(n) { return n; } };
  const result = mountReflectionDailyWisdom(root, {
    createElement: fakeCreateElement
  });
  assert.equal('disabled' in result, false);
  assert.equal('required' in result, false);
  assert.ok(result.host);
  assert.ok(result.el);
});
