#!/usr/bin/env node
/**
 * Husky pre-commit gate for session lock + primary develop checkout ban.
 *   node focus-tiger/scripts/gate-session-lock-precommit.js
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateSessionLockGate } from './session-lock-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

const result = evaluateSessionLockGate({
  repoRoot: REPO_ROOT,
  applySideEffects: true
})

for (const line of result.messages) {
  console[result.ok ? 'log' : 'error'](line)
}

process.exit(result.ok ? 0 : result.code || 1)
