/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PresenceFieldSession } from './presenceFieldSession.js';
import { STORAGE_KEY, writePresenceFieldEnabled } from './presenceFieldStore.js';
import { OSCILLATOR_COUNT } from './kuramotoField.js';

function storage(enabled = false) {
  const data = {};
  if (enabled) data[STORAGE_KEY] = '1';
  return {
    data,
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = String(v);
    },
    removeItem(k) {
      delete data[k];
    }
  };
}

function el(tag = 'div') {
  const node = {
    tag,
    id: '',
    className: '',
    hidden: false,
    textContent: '',
    title: '',
    children: [],
    style: {},
    dataset: {},
    parent: null,
    appendChild(child) {
      child.parent = this;
      this.children.push(child);
      return child;
    },
    append(...nodes) {
      for (const n of nodes) this.appendChild(n);
    },
    remove() {
      if (!this.parent) return;
      this.parent.children = this.parent.children.filter((c) => c !== this);
      this.parent = null;
    },
    setAttribute() {},
    removeAttribute(name) {
      if (name === 'title') this.title = '';
    },
    addEventListener() {},
    querySelectorAll(sel) {
      const out = [];
      const walk = (n) => {
        if (match(n, sel)) out.push(n);
        for (const c of n.children || []) walk(c);
      };
      walk(this);
      return out;
    },
    querySelector(sel) {
      return this.querySelectorAll(sel)[0] || null;
    }
  };
  return node;
}

function match(n, sel) {
  if (sel.startsWith('[data-testid=')) {
    const id = sel.slice(14, -1);
    return n.dataset?.testid === id;
  }
  if (sel.startsWith('#')) return n.id === sel.slice(1);
  return false;
}

function installDom() {
  const body = el('body');
  const head = el('head');
  const app = el('div');
  app.id = 'app';
  const rim = el('div');
  rim.id = 'light-progression-rim';
  const sprite = el('div');
  sprite.id = 'sprite-stage';
  app.appendChild(rim);
  body.appendChild(app);
  body.appendChild(sprite);
  const doc = {
    body,
    head,
    documentElement: body,
    getElementById(id) {
      if (id === 'app') return app;
      if (id === 'light-progression-rim') return rim;
      if (id === 'sprite-stage') return sprite;
      if (id === 'presence-field-session-v1') {
        return head.children.find((c) => c.id === id) || null;
      }
      return body.querySelector(`#${id}`);
    },
    createElement(tag) {
      return el(tag);
    },
    querySelectorAll(sel) {
      return body.querySelectorAll(sel);
    },
    querySelector(sel) {
      return body.querySelector(sel);
    },
    addEventListener() {}
  };
  const previous = globalThis.document;
  globalThis.document = doc;
  return {
    rim,
    sprite,
    restore() {
      globalThis.document = previous;
    },
    lightProgression: {
      _ensureRimGlow() {
        return rim;
      }
    }
  };
}

test('default off: focusing tick mounts no lobes', () => {
  const { lightProgression, restore } = installDom();
  try {
    const session = new PresenceFieldSession({
      lightProgression,
      storage: storage(false),
      search: ''
    });
    session.setFocusing(true);
    session.tick({ deltaSec: 0.016 });
    assert.equal(document.querySelectorAll('[data-testid=presence-field-lobe]').length, 0);
    session.destroy();
  } finally {
    restore();
  }
});

test('enabled + focusing mounts lobes on rim, not on sprite; idle tears down', () => {
  const { lightProgression, rim, sprite, restore } = installDom();
  try {
    const session = new PresenceFieldSession({
      lightProgression,
      storage: storage(true),
      search: ''
    });
    session.setFocusing(true);
    session.tick({ deltaSec: 0.016 });
    assert.equal(session.snapshot().mode, 'scatter');
    assert.equal(session.snapshot().visible, true);
    assert.equal(session._lobes.length, OSCILLATOR_COUNT);
    assert.equal(
      session._lobes.every((lobe) => lobe.parent === rim),
      true
    );
    assert.equal(sprite.children.length, 0);
    session.setFocusing(false);
    session.tick({ deltaSec: 0.016 });
    assert.equal(session._lobes.length, 0);
    assert.equal(session.snapshot().mode, 'off');
    session.destroy();
  } finally {
    restore();
  }
});

test('switch off while focusing removes nodes', () => {
  const { lightProgression, restore } = installDom();
  try {
    const store = storage(true);
    const session = new PresenceFieldSession({
      lightProgression,
      storage: store,
      search: ''
    });
    session.setFocusing(true);
    session.tick({ deltaSec: 0.016 });
    assert.ok(session._lobes.length > 0);
    store.removeItem(STORAGE_KEY);
    session.refreshFromStorage();
    session.tick({ deltaSec: 0.016 });
    assert.equal(session._lobes.length, 0);
    session.destroy();
  } finally {
    restore();
  }
});

test('no debug sliders without query; debug query shows K slider', () => {
  const { lightProgression, restore } = installDom();
  try {
    const off = new PresenceFieldSession({
      lightProgression,
      storage: storage(true),
      search: ''
    });
    off.setFocusing(true);
    off.tick({ deltaSec: 0.016 });
    assert.equal(document.querySelector('[data-testid=presence-field-debug]'), null);
    off.destroy();

    const on = new PresenceFieldSession({
      lightProgression,
      storage: storage(true),
      search: 'presenceFieldDebug=1'
    });
    on.setFocusing(true);
    on.tick({ deltaSec: 0.016 });
    assert.ok(on._debugRoot);
    assert.equal(on._debugRoot.dataset.testid, 'presence-field-debug');
    on.destroy();
  } finally {
    restore();
  }
});

test('failed persist rebound: focusing still has no field nodes', () => {
  const { lightProgression, restore } = installDom();
  try {
    const failStore = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('quota');
      },
      removeItem() {}
    };
    const session = new PresenceFieldSession({
      lightProgression,
      storage: failStore,
      search: ''
    });
    session.setFocusing(true);
    session.tick({ deltaSec: 0.016 });
    assert.equal(session._lobes.length, 0);
    assert.equal(writePresenceFieldEnabled(failStore, true), false);
    session.refreshFromStorage();
    session.setEnabled(false);
    session.tick({ deltaSec: 0.016 });
    assert.equal(session._lobes.length, 0);
    assert.equal(session.snapshot().mode, 'off');
    session.destroy();
  } finally {
    restore();
  }
});

test('idle ticks do not ensure rim glow or mutate rim', () => {
  const { lightProgression, restore } = installDom();
  let ensureCalls = 0;
  lightProgression._ensureRimGlow = () => {
    ensureCalls += 1;
    return document.getElementById('light-progression-rim');
  };
  try {
    const session = new PresenceFieldSession({
      lightProgression,
      storage: storage(false),
      search: ''
    });
    session.tick({ deltaSec: 0.016 });
    session.tick({ deltaSec: 0.016 });
    session.tick({ deltaSec: 0.016 });
    assert.equal(ensureCalls, 0);
    session.destroy();
  } finally {
    restore();
  }
});
