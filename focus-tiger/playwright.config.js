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
  timeout: 90_000,
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
  // CI: production build (DEV=false) so visibility hooks like __honestyBridge are real.
  // Local: development-mode build so lab `#dev-reset-all-local-state` still exists,
  // while keeping preview’s stable static server (never reuse a stray :5179).
  webServer: process.env.CI
    ? {
        command:
          'npm run build && npx vite preview --host 127.0.0.1 --port 5179 --strictPort',
        url: 'http://127.0.0.1:5179/',
        reuseExistingServer: false,
        timeout: 180_000
      }
    : {
        command:
          'npx vite build --mode development && npx vite preview --host 127.0.0.1 --port 5179 --strictPort',
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
