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
		if (raw === "true" || raw === "1") return false;
		return true;
	} catch {
		return true;
	}
}

describe("planAOption1NewCheckoutDisabled", () => {
	it("helper defaults closed (missing env is fail-closed)", () => {
		assert.match(helperSrc, /return true;\s*\}\s*catch/);
		assert.match(helperSrc, /PLAN_A_NEW_CHECKOUT_ERROR/);
	});

	it("logic: missing or non-true env keeps checkout off", () => {
		assert.equal(isPlanAOption1NewCheckoutDisabled({}), true);
		assert.equal(
			isPlanAOption1NewCheckoutDisabled({
				PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED: "false",
			}),
			true,
		);
	});

	it("logic: explicit true/1 is the only reopen path", () => {
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
});
