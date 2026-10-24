/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isConfideKeyboardShortcut,
  isEditableKeyboardTarget,
  isProductSpaceKey,
  resolveProductKeyboardAction
} from './productKeyboardShortcuts.js';

describe('productKeyboardShortcuts', () => {
  it('treats inputs and contenteditable as typing targets', () => {
    const input = { tagName: 'INPUT', isContentEditable: false };
    assert.equal(isEditableKeyboardTarget(input), true);
    const area = { tagName: 'TEXTAREA', isContentEditable: false };
    assert.equal(isEditableKeyboardTarget(area), true);
    const editable = {
      tagName: 'DIV',
      isContentEditable: true,
      closest: () => null
    };
    assert.equal(isEditableKeyboardTarget(editable), true);
  });

  it('space in confide textarea does not trigger sit', () => {
    const event = {
      code: 'Space',
      key: ' ',
      target: { tagName: 'TEXTAREA', isContentEditable: false },
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      shiftKey: false
    };
    assert.equal(
      resolveProductKeyboardAction(
        { spaceIdleAllowed: true, spaceFocusToggleAllowed: false, confideAllowed: true },
        event
      ),
      null
    );
  });

  it('confide shortcut prefers meta on mac-like events', () => {
    const event = {
      key: 'e',
      metaKey: true,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      target: { tagName: 'BODY', isContentEditable: false, closest: () => null }
    };
    assert.equal(isConfideKeyboardShortcut(event), true);
    assert.equal(
      resolveProductKeyboardAction(
        { confideAllowed: true, spaceIdleAllowed: true },
        event
      ),
      'confide'
    );
  });

  it('focusing space toggles pause before idle sit', () => {
    const event = {
      code: 'Space',
      key: ' ',
      target: { tagName: 'BODY', isContentEditable: false, closest: () => null },
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      shiftKey: false
    };
    assert.equal(isProductSpaceKey(event), true);
    assert.equal(
      resolveProductKeyboardAction(
        { spaceIdleAllowed: true, spaceFocusToggleAllowed: true, confideAllowed: false },
        event
      ),
      'space-focus-toggle'
    );
  });
});
