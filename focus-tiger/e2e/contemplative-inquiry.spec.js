/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from "@playwright/test";
import { dismissColdStartOverlay } from "./helpers/cold-start-overlay.js";
import {
  openFreshProductShell,
  pickWideMoreRadialGroup
} from "./helpers/product-shell.js";

test.use({ viewport: { width: 1280, height: 900 } });

test("idle more menu opens sit-with-a-question firewall then the koan line", async ({
  page
}) => {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.locator("#ft-wide-more-btn").click();
  await pickWideMoreRadialGroup(page, "MENU_GROUP_INSPIRATION");
  const menu = page.locator("#ft-wide-more-menu");
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await expect(menu.locator("[data-proxy=\"contemplative-inquiry\"]")).toBeVisible();
  await menu.locator("[data-proxy=\"contemplative-inquiry\"]").click();

  const card = page.locator("[data-testid=\"contemplative-inquiry-card\"]");
  await expect(card).toBeVisible({ timeout: 3_000 });
  await expect(
    page.locator("[data-testid=\"contemplative-inquiry-come-in\"]")
  ).toBeVisible();
  await page.locator("[data-testid=\"contemplative-inquiry-come-in\"]").click();
  await expect(
    page.locator("[data-testid=\"contemplative-inquiry-question\"]")
  ).toBeVisible();
});

test("turning the column off removes the inspiration row", async ({ page }) => {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.locator("#ft-wide-more-btn").click();
  await pickWideMoreRadialGroup(page, "MENU_GROUP_INSPIRATION");
  const menu = page.locator("#ft-wide-more-menu");
  await expect(menu.locator("[data-proxy=\"contemplative-inquiry\"]")).toBeVisible();
  await menu.locator("[data-proxy=\"contemplative-inquiry\"]").click();
  await page.locator("[data-testid=\"contemplative-inquiry-turn-off\"]").click();
  await expect(
    page.locator("[data-testid=\"contemplative-inquiry-card\"]")
  ).toBeHidden();

  await page.locator("#ft-wide-more-btn").click();
  await pickWideMoreRadialGroup(page, "MENU_GROUP_INSPIRATION");
  await expect(
    page.locator("#ft-wide-more-menu [data-proxy=\"contemplative-inquiry\"]")
  ).toHaveCount(0);
});
