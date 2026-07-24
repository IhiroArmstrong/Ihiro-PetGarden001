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
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5179',
    trace: 'on-first-retry'
  },
  webServer: {
    // Dedicated port so another worktree's Vite on :5173 is not reused by mistake.
    command: 'npm run dev -- --host 127.0.0.1 --port 5179',
    url: 'http://127.0.0.1:5179/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 优先用本机 Chrome，避免 CI/Agent 沙箱无法下载 Playwright Chromium。
        channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome'
      }
    }
  ]
});
