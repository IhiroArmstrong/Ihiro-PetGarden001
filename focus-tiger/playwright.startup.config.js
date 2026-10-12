/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

// @ts-check
import { defineConfig, devices } from '@playwright/test'

/**
 * A5 推送前启动冒烟：Vite 直起，不跑 production build，目标约 1 分钟。
 * 端口 5198，避免和产品 e2e :5199 / QA :5173 抢。
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'startup-ready.smoke.spec.js',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:5198',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    navigationTimeout: 30_000,
    actionTimeout: 15_000
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5198 --strictPort',
    url: 'http://127.0.0.1:5198/',
    reuseExistingServer: false,
    timeout: 60_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
