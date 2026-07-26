// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * 浏览器冒烟（DOM / 入口）。不替代序列观感人工测。
 * 跑：npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  // Keep room for Arrival/Companion paths + openFreshProductShell retries.
  // Local slightly higher: mid-suite preview nav can stall ~25s × 2 attempts.
  timeout: process.env.CI ? 90_000 : 120_000,
  expect: {
    timeout: process.env.CI ? 20_000 : 10_000
  },
  use: {
    // Dedicated port so another worktree's Vite on :5173 is not reused by mistake.
    baseURL: 'http://127.0.0.1:5179',
    trace: 'on-first-retry',
    navigationTimeout: process.env.CI ? 60_000 : 30_000,
    actionTimeout: process.env.CI ? 30_000 : 15_000
  },
  // Prefer static preview — vite `dev` hangs mid-suite (goto/click storms).
  // Always production build: lighter + matches CI. Lab `#dev-reset-all-local-state`
  // is asserted only when present (see product-shell.smoke.spec.js).
  // Never reuse a stray :5179.
  webServer: {
    command:
      'npm run build && npx vite preview --host 127.0.0.1 --port 5179 --strictPort',
    url: 'http://127.0.0.1:5179/',
    reuseExistingServer: false,
    timeout: 180_000
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 本地默认：Playwright 自带 Chromium（不唤起系统 Chrome，避免 Cursor 子进程
        // 触发 macOS TransformProcessType abort 弹窗）。
        // 需要真实系统 Chrome 时：PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
        // （CI 兜底可显式设该环境变量。）
        ...(process.env.PLAYWRIGHT_CHANNEL
          ? { channel: process.env.PLAYWRIGHT_CHANNEL }
          : {})
      }
    }
  ]
});
