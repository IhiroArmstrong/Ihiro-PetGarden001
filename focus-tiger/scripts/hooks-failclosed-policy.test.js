/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * hooks.json failClosed policy: governance hooks fail open on runner crash (zsh ENOENT);
 * security hooks stay fail closed. Reverting session_gate/tool_budget to failClosed:true
 * without PO intent should fail this test.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const hooksPath = join(repoRoot, '.cursor/hooks.json');

function entriesForCommand(config, commandSuffix) {
  const out = [];
  for (const list of Object.values(config.hooks || {})) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (typeof item?.command === 'string' && item.command.endsWith(commandSuffix)) {
        out.push(item);
      }
    }
  }
  return out;
}

describe('hooks.json failClosed policy', () => {
  it('session_gate and tool_budget fail open; deny/gate hooks fail closed', () => {
    const config = JSON.parse(readFileSync(hooksPath, 'utf8'));

    for (const item of entriesForCommand(config, 'session_gate.sh')) {
      assert.equal(item.failClosed, false, 'session_gate must fail open on runner crash');
    }
    for (const item of entriesForCommand(config, 'tool_budget.sh')) {
      assert.equal(item.failClosed, false, 'tool_budget must fail open on runner crash');
    }

    const mustFailClosed = [
      'deny-subagent-start.sh',
      'deny-ide-browser-mcp.sh',
      'gate-destructive-shell.sh',
      'gate-local-heavy-e2e.sh'
    ];
    for (const suffix of mustFailClosed) {
      for (const item of entriesForCommand(config, suffix)) {
        assert.equal(
          item.failClosed,
          true,
          `${suffix} must stay fail closed`
        );
      }
    }
  });
});
