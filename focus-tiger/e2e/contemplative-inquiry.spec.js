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


async function openInquiryPastFirewall(page) {
  await page.locator("#ft-wide-more-btn").click();
  await pickWideMoreRadialGroup(page, "MENU_GROUP_INSPIRATION");
  const menu = page.locator("#ft-wide-more-menu");
  await expect(menu.locator("[data-proxy=\"contemplative-inquiry\"]")).toBeVisible();
  await menu.locator("[data-proxy=\"contemplative-inquiry\"]").click();
  const comeIn = page.locator("[data-testid=\"contemplative-inquiry-come-in\"]");
  await comeIn.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
  if (await comeIn.isVisible().catch(() => false)) {
    await comeIn.click();
  }
  await expect(page.locator("[data-testid=\"contemplative-inquiry-card\"]")).toBeVisible();
}

async function startInquirySit(page) {
  await page.evaluate(() => {
    const ui = window.__contemplativeInquiryCard;
    if (!ui) throw new Error("missing contemplative inquiry card");
    ui._startSit();
  });
  await expect(page.locator("[data-testid=\"contemplative-inquiry-end-early\"]")).toBeAttached({
    timeout: 5_000
  });
}

test("early end lands then Done closes without Ground", async ({ page }) => {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  await openInquiryPastFirewall(page);
  await startInquirySit(page);
  await page.locator("[data-testid=\"contemplative-inquiry-end-early\"]").click({ force: true });
  await expect(page.locator("[data-testid=\"contemplative-inquiry-done\"]")).toBeVisible({
    timeout: 5_000
  });
  await page.locator("[data-testid=\"contemplative-inquiry-done\"]").click();
  await expect(page.locator("[data-testid=\"contemplative-inquiry-card\"]")).toBeHidden();
  await expect(page.locator("[data-testid=\"ground-exercise-choice\"]")).toBeHidden();
});

test("landing Feel the ground opens Ground choice", async ({ page }) => {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  await openInquiryPastFirewall(page);
  await startInquirySit(page);
  await page.locator("[data-testid=\"contemplative-inquiry-end-early\"]").click({ force: true });
  await page.locator("[data-testid=\"contemplative-inquiry-land\"]").click();
  await expect(page.locator("[data-testid=\"ground-exercise-choice\"]")).toBeVisible({
    timeout: 5_000
  });
});

test("sit shows the question, hides MM:SS, then lands on the feeling step", async ({
  page
}) => {
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);
  await openInquiryPastFirewall(page);
  await startInquirySit(page);
  const question = page.locator("[data-testid=\"contemplative-inquiry-question\"]");
  await expect(question).toBeVisible();
  await expect(page.locator("[data-testid=\"contemplative-inquiry-clock\"]")).toBeHidden();
  await page.mouse.click(16, 16);
  await expect(question).toBeVisible();
  await page.evaluate(() => {
    const ui = window.__contemplativeInquiryCard;
    ui._sitMs = 200;
    ui._sitStartedAt = Date.now() - 500;
  });
  await expect(page.locator("[data-testid=\"contemplative-inquiry-opt-many\"]")).toBeVisible({
    timeout: 5_000
  });
});
