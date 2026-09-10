/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Explore-only tool budget: Grep counts; StrReplace / git / bounded Read do not.
 */
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const hook = join(repoRoot, '.cursor/hooks/tool_budget.sh');
const gate = join(repoRoot, '.cursor/hooks/session_gate.sh');
const CID = 'test-tool-budget-explore';
const stateRoot = join(tmpdir(), 'ft-hook-state');
const stateDir = join(stateRoot, `${CID}_`);

function runHook(script, payload) {
  const r = spawnSync('bash', [script], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd: repoRoot,
    env: { ...process.env, FOCUS_TIGER_HOOK_STATE_ROOT: stateRoot }
  });
  let json = {};
  try {
    json = JSON.parse((r.stdout || '').trim() || '{}');
  } catch {
    json = { parseError: r.stdout, stderr: r.stderr };
  }
  return { status: r.status, json, stderr: r.stderr };
}

function readCount() {
  const f = join(stateDir, 'tool_count');
  if (!existsSync(f)) return 0;
  return Number(readFileSync(f, 'utf8').trim() || '0');
}

describe('tool_budget explore-only', () => {
  beforeEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, 'budget_tier'), 'qa\n');
    writeFileSync(join(stateDir, 'tool_count'), '0\n');
  });

  afterEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
  });

  it('increments on Grep', () => {
    const { json } = runHook(hook, {
      conversation_id: CID,
      tool_name: 'Grep',
      tool_input: { pattern: 'foo' }
    });
    assert.equal(json.permission, 'allow');
    assert.equal(readCount(), 1);
  });

  it('does not increment on StrReplace', () => {
    const { json } = runHook(hook, {
      conversation_id: CID,
      tool_name: 'StrReplace',
      tool_input: { path: 'x', old_string: 'a', new_string: 'b' }
    });
    assert.equal(json.permission, 'allow');
    assert.equal(readCount(), 0);
  });

  it('does not increment on git status Shell', () => {
    const { json } = runHook(hook, {
      conversation_id: CID,
      tool_name: 'Shell',
      tool_input: { command: 'git status --short' }
    });
    assert.equal(json.permission, 'allow');
    assert.equal(readCount(), 0);
  });

  it('increments on rg via Shell', () => {
    const { json } = runHook(hook, {
      conversation_id: CID,
      tool_name: 'Shell',
      tool_input: { command: 'rg -n foo focus-tiger/src' }
    });
    assert.equal(json.permission, 'allow');
    assert.equal(readCount(), 1);
  });

  it('does not increment bounded Read of a large file', () => {
    const dir = join(tmpdir(), 'ft-tool-budget-read');
    mkdirSync(dir, { recursive: true });
    const big = join(dir, 'big.js');
    writeFileSync(big, `${'line\n'.repeat(450)}end\n`);
    const { json } = runHook(hook, {
      conversation_id: CID,
      tool_name: 'Read',
      tool_input: { path: big, offset: 1, limit: 40 }
    });
    assert.equal(json.permission, 'allow');
    assert.equal(readCount(), 0);
    rmSync(dir, { recursive: true, force: true });
  });

  it('increments unbounded Read of a large file', () => {
    const dir = join(tmpdir(), 'ft-tool-budget-read-unbounded');
    mkdirSync(dir, { recursive: true });
    const big = join(dir, 'big.js');
    writeFileSync(big, `${'line\n'.repeat(450)}end\n`);
    const { json } = runHook(hook, {
      conversation_id: CID,
      tool_name: 'Read',
      tool_input: { path: big }
    });
    assert.equal(json.permission, 'allow');
    assert.equal(readCount(), 1);
    rmSync(dir, { recursive: true, force: true });
  });

  it('hard-denies further Grep but still allows StrReplace', () => {
    writeFileSync(join(stateDir, 'tool_count'), '27\n');
    const deny = runHook(hook, {
      conversation_id: CID,
      tool_name: 'Grep',
      tool_input: { pattern: 'bar' }
    });
    assert.equal(deny.json.permission, 'deny');
    assert.equal(readCount(), 28);
    const write = runHook(hook, {
      conversation_id: CID,
      tool_name: 'StrReplace',
      tool_input: { path: 'x', old_string: 'a', new_string: 'b' }
    });
    assert.equal(write.json.permission, 'allow');
    assert.equal(readCount(), 28);
    assert.match(String(deny.json.agentMessage || deny.json.agent_message || ''), /不要新开 Chat/);
  });
});

describe('session_gate continue on new chat', () => {
  const cid = 'test-session-gate-continue';
  const dir = join(stateRoot, `${cid}_`);

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('warns when 继续 starts a conversation with no prior tier', () => {
    rmSync(dir, { recursive: true, force: true });
    const { json } = runHook(gate, {
      conversation_id: cid,
      prompt: '继续 Yin Evolution P0'
    });
    assert.equal(json.continue, true);
    assert.match(String(json.userMessage || json.user_message || ''), /新会话/);
  });
});
