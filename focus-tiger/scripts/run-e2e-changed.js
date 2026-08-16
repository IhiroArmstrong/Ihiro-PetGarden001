#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lightweight local Playwright runner: exactly one spec path per run.
 * Example: npm run test:e2e:changed -- e2e/foo.spec.js
 *
 * Hard budget (RULES_INDEX → e2e-local-budget): local non-CI runs allow ≤1
 * `*.spec.*` path. More than one spec / bare directory / grep-only → blocked
 * unless CI or RUN_E2E_LOCAL=true (prints bypass warning). Full suite /
 * visibility still go through e2e-ci-guard.js.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BYPASS_WARN = '⚠️ 已绕过本地 e2e 硬顶（RUN_E2E_LOCAL=true）';

/**
 * Path-like Playwright targets (flags starting with `-` ignored).
 * @param {string[]} argv
 * @returns {string[]}
 */
export function collectSpecTargets(argv) {
  return argv.filter((a) => {
    if (!a || a.startsWith('-')) return false;
    if (/\.spec\.(js|ts|mjs|cjs)$/i.test(a)) return true;
    // Directory / glob under e2e (treat as multi-file budget breach)
    if (/(^|[\\/])e2e([\\/]|$)/i.test(a)) return true;
    return false;
  });
}

/**
 * Decide whether a local `test:e2e:changed` argv is allowed.
 * @param {string[]} argv
 * @param {{ CI?: string, RUN_E2E_LOCAL?: string }} [env]
 * @returns {{
 *   allowed: boolean,
 *   bypassWarn: boolean,
 *   targets: string[],
 *   explicitSpecs: string[],
 *   reason: 'ok' | 'ci' | 'run-e2e-local' | 'empty' | 'multi' | 'dir-or-nonspec'
 * }}
 */
export function evaluateLocalChangedBudget(argv, env = process.env) {
  const isCI = env.CI === 'true' || env.CI === '1';
  const allowLocal = env.RUN_E2E_LOCAL === 'true';
  const targets = collectSpecTargets(argv);
  const explicitSpecs = targets.filter((a) =>
    /\.spec\.(js|ts|mjs|cjs)$/i.test(a)
  );
  const hasDirOrNonSpec = targets.some(
    (a) => !/\.spec\.(js|ts|mjs|cjs)$/i.test(a)
  );

  if (isCI) {
    return {
      allowed: true,
      bypassWarn: false,
      targets,
      explicitSpecs,
      reason: 'ci'
    };
  }
  if (allowLocal) {
    return {
      allowed: true,
      bypassWarn: true,
      targets,
      explicitSpecs,
      reason: 'run-e2e-local'
    };
  }
  if (hasDirOrNonSpec) {
    return {
      allowed: false,
      bypassWarn: false,
      targets,
      explicitSpecs,
      reason: 'dir-or-nonspec'
    };
  }
  if (explicitSpecs.length === 0) {
    return {
      allowed: false,
      bypassWarn: false,
      targets,
      explicitSpecs,
      reason: 'empty'
    };
  }
  if (explicitSpecs.length > 1) {
    return {
      allowed: false,
      bypassWarn: false,
      targets,
      explicitSpecs,
      reason: 'multi'
    };
  }
  return {
    allowed: true,
    bypassWarn: false,
    targets,
    explicitSpecs,
    reason: 'ok'
  };
}

function main(argv = process.argv.slice(2)) {
  if (argv.length === 0) {
    console.error(
      [
        'Usage: npm run test:e2e:changed -- e2e/foo.spec.js [playwright flags…]',
        'Local hard cap: exactly ONE *.spec.* file per run (RULES_INDEX → e2e-local-budget).',
        'Multi-spec / full suite: push + CI (pr-smoke / focus-tiger-e2e-full), or RUN_E2E_LOCAL=true.'
      ].join('\n')
    );
    return 1;
  }

  const decision = evaluateLocalChangedBudget(argv, process.env);
  if (!decision.allowed) {
    console.error(
      [
        '❌ 本地 test:e2e:changed 硬顶：每次只允许 1 个 *.spec.* 文件。',
        `本次解析到: ${
          decision.targets.length
            ? decision.targets.join(', ')
            : '(无 spec 路径；仅 flag/grep 会扫大套件)'
        }`,
        '请改跑: npm run test:e2e:changed -- e2e/one.spec.js',
        '或 push 后走 CI（test:pr-smoke / 相关 workflow）。',
        '确需本地多文件/绕过：RUN_E2E_LOCAL=true npm run test:e2e:changed -- …'
      ].join('\n')
    );
    return 1;
  }

  if (decision.bypassWarn) {
    console.warn(BYPASS_WARN);
  }

  const result = spawnSync('npx', ['playwright', 'test', ...argv], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  return result.status ?? 1;
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  process.exit(main());
}
