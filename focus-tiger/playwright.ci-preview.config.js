// @ts-check
/**
 * Local / one-off: production `vite preview` (DEV=false) to mirror CI visibility.
 * Usage:
 *   npx playwright test e2e/micro-ritual.spec.js -g "bridge CTA" \\
 *     --config=playwright.ci-preview.config.js --retries=0
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 0,
  timeout: 90_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5179',
    trace: 'on',
    navigationTimeout: 30_000
  },
  webServer: {
    command:
      'npm run build && npx vite preview --host 127.0.0.1 --port 5179 --strictPort',
    url: 'http://127.0.0.1:5179/',
    reuseExistingServer: false,
    timeout: 180_000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
