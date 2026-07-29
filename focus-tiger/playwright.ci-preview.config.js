// @ts-check
/**
 * Local / one-off: production build + static server (DEV=false hooks).
 * Same harness as playwright.config.js webServer — not vite preview.
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
    baseURL: 'http://127.0.0.1:5199',
    trace: 'on',
    navigationTimeout: 30_000
  },
  webServer: {
    command: 'npm run build && FT_E2E_PORT=5199 node scripts/ft-playwright-static-5199.js',
    url: 'http://127.0.0.1:5199/',
    reuseExistingServer: false,
    timeout: 180_000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
