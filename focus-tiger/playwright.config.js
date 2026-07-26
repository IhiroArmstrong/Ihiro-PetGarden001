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
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
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
