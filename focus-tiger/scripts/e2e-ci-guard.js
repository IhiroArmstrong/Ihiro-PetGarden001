#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Gate for large Playwright suites: allow CI, or explicit RUN_E2E_LOCAL=true.
 * Usage: node scripts/e2e-ci-guard.js <full|visibility>
 *
 * - full → npm run test:e2e (focus-tiger-e2e-full.yml: workflow_dispatch + daily schedule)
 * - visibility → npm run test:e2e:visibility (focus-tiger-visibility-contract.yml)
 *
 * Local light paths: test:e2e:smoke / test:e2e:changed -- <one *.spec.*>
 * (see RULES_INDEX → e2e-local-budget).
 */
const suite = process.argv[2];

const MESSAGES = {
  full: {
    blocked: [
      '❌ test:e2e 仅允许在 CI 环境执行。',
      '已有专属 CI workflow（focus-tiger-e2e-full.yml）：Actions 手动 workflow_dispatch，或等每日定时。',
      '本地请用 test:e2e:smoke，或 test:e2e:changed -- <单个 *.spec.*>（硬顶 1；见 e2e-local-budget）。',
      '如确需本地执行请使用 RUN_E2E_LOCAL=true 显式覆盖。'
    ].join('\n'),
    localWarn:
      '⚠️ 已绕过本地 e2e 硬顶（RUN_E2E_LOCAL=true）：正在本地执行全量 test:e2e'
  },
  visibility: {
    blocked: [
      '❌ test:e2e:visibility 仅允许在 CI 环境执行。',
      '已有专属 CI workflow（focus-tiger-visibility-contract.yml），请通过 push/PR 触发，本地无需重复跑。',
      '如确需本地执行请使用 RUN_E2E_LOCAL=true 显式覆盖。'
    ].join('\n'),
    localWarn:
      '⚠️ 已绕过本地 e2e 硬顶（RUN_E2E_LOCAL=true）：正在本地执行 test:e2e:visibility'
  }
};

if (!MESSAGES[suite]) {
  console.error(
    `e2e-ci-guard: unknown suite "${suite ?? ''}" (expected full|visibility)`
  );
  process.exit(2);
}

const isCI = process.env.CI === 'true' || process.env.CI === '1';
const allowLocal = process.env.RUN_E2E_LOCAL === 'true';

if (isCI) {
  process.exit(0);
}

if (allowLocal) {
  console.warn(MESSAGES[suite].localWarn);
  process.exit(0);
}

console.error(MESSAGES[suite].blocked);
process.exit(1);
