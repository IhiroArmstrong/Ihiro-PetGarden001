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
  // First-attempt CI flakes often burn the full test timeout then retry green.
  // Keep enough for Arrival/Companion success path (~55–60s) but fail hung
  // first attempts sooner than 90s so the visibility job can finish.
  timeout: process.env.CI ? 70_000 : 120_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 10_000
  },
  use: {
    // Dedicated port so another worktree's Vite on :5173 is not reused by mistake.
    baseURL: 'http://127.0.0.1:5179',
    trace: 'on-first-retry',
    navigationTimeout: process.env.CI ? 25_000 : 30_000,
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
