/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test'

/**
 * A5 启动冒烟：App 必须置位 __FT_APP_READY__，且不得有未捕获 pageerror。
 * #1139 类 TDZ 崩溃会让 ready 永不置位 → 本 spec 红，pre-push 拦下。
 */
test('startup sets __FT_APP_READY__ without page errors', async ({ page }) => {
  /** @type {string[]} */
  const pageErrors = []
  page.on('pageerror', (err) => {
    pageErrors.push(String(err && err.message ? err.message : err))
  })

  await page.goto('/?product=1&sessionMinutes=1', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000
  })
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 30_000
  })
  expect(pageErrors, pageErrors.join('\n')).toEqual([])
})
