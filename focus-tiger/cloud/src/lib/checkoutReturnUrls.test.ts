import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	DESKTOP_CHECKOUT_ORIGIN,
	isDesktopReturnSurface,
	resolveCheckoutReturnUrl,
} from "./checkoutReturnUrls.ts";

describe("checkoutReturnUrls", () => {
	it("detects desktop returnSurface", () => {
		assert.equal(isDesktopReturnSurface({ returnSurface: "desktop" }), true);
		assert.equal(isDesktopReturnSurface({ returnSurface: "web" }), false);
		assert.equal(isDesktopReturnSurface(null), false);
	});

	it("rewrites loopback Web URLs to focus-tiger://app", () => {
		const web =
			"http://127.0.0.1:5173/?product=1&pro_session={CHECKOUT_SESSION_ID}";
		assert.equal(
			resolveCheckoutReturnUrl(web, "desktop"),
			`${DESKTOP_CHECKOUT_ORIGIN}/?product=1&pro_session={CHECKOUT_SESSION_ID}`,
		);
	});

	it("leaves Web URLs unchanged without desktop surface", () => {
		const web =
			"http://127.0.0.1:5173/?product=1&pro_session={CHECKOUT_SESSION_ID}";
		assert.equal(resolveCheckoutReturnUrl(web, "web"), web);
		assert.equal(resolveCheckoutReturnUrl(web, undefined), web);
	});
});
