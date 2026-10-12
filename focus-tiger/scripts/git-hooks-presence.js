#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Detect whether git commit hooks will actually run in this checkout.
 * Policy: WORKFLOW.md git-worktree-occupancy · A22 / R19
 *
 * Husky 9 sets core.hooksPath to `.husky/_`, which is gitignored. A fresh
 * `git worktree add` has no `_/` until `npm install`, so git skips hooks
 * with no error. Committed hooks live in `.husky/` (pre-commit is tracked).
 */

import { existsSync } from 'node:fs'
import { isAbsolute, join, normalize } from 'node:path'

export const COMMITTED_HOOKS_PATH = '.husky'

/**
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {string} [opts.hooksPath] `git config --get core.hooksPath`
 * @param {(p: string) => boolean} [opts.exists]
 * @returns {{ ok: boolean, code: string, message: string, hooksDir?: string }}
 */
export function evaluateGitHooksPresence({ repoRoot, hooksPath = '', exists = existsSync }) {
  const configured = String(hooksPath || '').trim()
  if (!configured) {
    return {
      ok: false,
      code: 'hooks_path_unset',
      message:
        'BLOCK: core.hooksPath is unset — git will use $GIT_DIR/hooks and skip .husky/pre-commit. From the repo root run `npm install` (prepare sets core.hooksPath=.husky).'
    }
  }

  const resolvedDir = isAbsolute(configured)
    ? normalize(configured)
    : normalize(join(repoRoot, configured))

  if (!exists(resolvedDir)) {
    return {
      ok: false,
      code: 'hooks_dir_missing',
      message: `BLOCK: git hooks directory missing: ${configured} (resolved ${resolvedDir}). New worktrees used to skip pre-commit silently when this pointed at untracked .husky/_. Set core.hooksPath=.husky (tracked).`
    }
  }

  const preCommit = join(resolvedDir, 'pre-commit')
  if (!exists(preCommit)) {
    return {
      ok: false,
      code: 'pre_commit_missing',
      message: `BLOCK: pre-commit hook missing at ${preCommit}`
    }
  }

  const committedDir = normalize(join(repoRoot, COMMITTED_HOOKS_PATH))
  if (resolvedDir !== committedDir) {
    return {
      ok: false,
      code: 'hooks_path_not_committed',
      message: `BLOCK: core.hooksPath=${configured} is not the committed directory .husky (resolved ${resolvedDir}). Husky's .husky/_ is gitignored and missing in new worktrees.`
    }
  }

  return {
    ok: true,
    code: 'ok',
    message: `hooks_path: ${COMMITTED_HOOKS_PATH} (pre-commit present)`,
    hooksDir: resolvedDir
  }
}
