/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bytecodeCompileRefusal } from './v8BytecodeGate.js';

describe('v8 bytecode gate', () => {
  it('refuses system Node and allows Electron', () => {
    assert.match(bytecodeCompileRefusal({}), /outside Electron/);
    assert.equal(bytecodeCompileRefusal({ electron: '37.2.6' }), null);
  });
});
