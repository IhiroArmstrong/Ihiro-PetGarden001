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
  // CI: 2 workers (4 overloaded vite preview → domcontentloaded 30s storms).
  workers: process.env.CI ? 2 : 1,
  reporter: 'list',
  // CI preview is static/fast; keep budget above openFreshProductShell's 60s Sit wait.
  timeout: process.env.CI ? 90_000 : 60_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 10_000
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    navigationTimeout: process.env.CI ? 60_000 : 30_000,
    actionTimeout: process.env.CI ? 20_000 : 15_000
  },
  // CI: static preview (build happens in the workflow before Playwright).
  // Local: keep `dev` for fast HMR while writing tests.
  webServer: process.env.CI
    ? {
        command: 'npx vite preview --host 127.0.0.1 --port 5173 --strictPort',
        url: 'http://127.0.0.1:5173/',
        reuseExistingServer: false,
        timeout: 120_000
      }
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 5173',
        url: 'http://127.0.0.1:5173/',
        reuseExistingServer: true,
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
