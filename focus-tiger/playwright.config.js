// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * 浏览器冒烟（DOM / 入口）。不替代序列观感人工测。
 * 跑：npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI: 2 workers — workers:1 + first-attempt timeout storms cancelled jobs.
  // Accept green+high-flaky for PR#2; flaky reduction is post-merge backlog.
  workers: process.env.CI ? 2 : 1,
  reporter: 'list',
  timeout: process.env.CI ? 90_000 : 120_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 10_000
  },
  use: {
    // Dedicated port so another worktree's Vite on :5173 is not reused by mistake.
    baseURL: 'http://127.0.0.1:5179',
    trace: 'on-first-retry',
    navigationTimeout: process.env.CI ? 30_000 : 30_000,
    actionTimeout: process.env.CI ? 20_000 : 15_000
  },
  // Prefer plain Node static server over vite preview — preview has hung
  // mid-suite under Chromium navigation storms (goto timeout cascades).
  // Never reuse a stray :5179.
  webServer: {
    command: 'npm run build && node scripts/e2e-static-server.js',
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
