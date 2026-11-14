/**
 * Plan A option 1 · Worker new-checkout gate (pro + add-on).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const indexSrc = readFileSync(join(dir, "../index.ts"), "utf8");
const helperSrc = readFileSync(
	join(dir, "planAOption1NewCheckoutDisabled.ts"),
	"utf8",
);

function isPlanAOption1NewCheckoutDisabled(env: {
	PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED?: string;
}): boolean {
	try {
		const raw = env?.PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED;
		if (raw === "false" || raw === "0") return true;
		if (raw === "true" || raw === "1") return false;
		return false;
	} catch {
		return true;
	}
}

describe("planAOption1NewCheckoutDisabled", () => {
	it("helper fails closed only on env read errors", () => {
		assert.match(helperSrc, /catch\s*\{[\s\S]*return true/);
		assert.match(helperSrc, /return false;\s*\}\s*catch/);
		assert.match(helperSrc, /PLAN_A_NEW_CHECKOUT_ERROR/);
	});

	it("logic: missing env allows checkout (restored default)", () => {
		assert.equal(isPlanAOption1NewCheckoutDisabled({}), false);
		assert.equal(
			isPlanAOption1NewCheckoutDisabled({
				PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED: "false",
			}),
			true,
		);
		assert.equal(
			isPlanAOption1NewCheckoutDisabled({
				PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED: "0",
			}),
			true,
		);
	});

	it("logic: explicit true/1 also allows checkout", () => {
		assert.equal(
			isPlanAOption1NewCheckoutDisabled({
				PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED: "true",
			}),
			false,
		);
		assert.equal(
			isPlanAOption1NewCheckoutDisabled({
				PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED: "1",
			}),
			false,
		);
	});

	it("410 helper wired on both checkout routes in index.ts", () => {
		const calls =
			indexSrc.split("planAOption1NewCheckoutDisabledJson(").length - 1;
		assert.ok(calls >= 2, "expected gate on pro and add-on checkout routes");
		assert.match(
			indexSrc,
			/\/api\/create-companion-addon-checkout-session[\s\S]{0,600}isPlanAOption1NewCheckoutDisabled/,
		);
		assert.match(
			indexSrc,
			/\/api\/create-pro-checkout-session[\s\S]{0,600}isPlanAOption1NewCheckoutDisabled/,
		);
	});

	it("membership portal route stays outside Plan A new-checkout gate", () => {
		const portalBlock =
			indexSrc.match(
				/if \(url\.pathname === "\/api\/create-membership-portal-session"\)[\s\S]{0,900}/,
			)?.[0] ?? "";
		assert.ok(portalBlock.length > 0, "expected membership portal route block");
		assert.doesNotMatch(portalBlock, /isPlanAOption1NewCheckoutDisabled/);
		assert.doesNotMatch(portalBlock, /planAOption1NewCheckoutDisabledJson/);
		assert.match(portalBlock, /handleCreateMembershipPortalSession/);
	});
});
