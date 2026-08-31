import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	isDesktopReturnSurface,
	resolveCheckoutReturnUrl,
	resolveSessionReturnUrls,
	rewriteCheckoutReturnPageOrigin,
} from "./checkoutReturnUrls.ts";

describe("checkoutReturnUrls", () => {
	it("detects desktop returnSurface", () => {
		assert.equal(isDesktopReturnSurface({ returnSurface: "desktop" }), true);
		assert.equal(isDesktopReturnSurface({ returnSurface: "web" }), false);
		assert.equal(isDesktopReturnSurface(null), false);
	});

	it("rewrites loopback Web URLs to Worker desktop bridge", () => {
		const web =
			"http://127.0.0.1:5173/?product=1&pro_session={CHECKOUT_SESSION_ID}";
		const resolved = resolveCheckoutReturnUrl(
			web,
			"desktop",
			"https://focus-tiger-cloud.ihiro.workers.dev",
		);
		const parsed = new URL(resolved);
		assert.equal(parsed.origin, "https://focus-tiger-cloud.ihiro.workers.dev");
		assert.equal(parsed.pathname, "/checkout/desktop-return");
		assert.equal(parsed.searchParams.get("product"), "1");
		assert.equal(
			parsed.searchParams.get("pro_session"),
			"{CHECKOUT_SESSION_ID}",
		);
	});

	it("leaves Web URLs unchanged without desktop surface", () => {
		const web =
			"http://127.0.0.1:5173/?product=1&pro_session={CHECKOUT_SESSION_ID}";
		assert.equal(
			resolveCheckoutReturnUrl(web, "web", "https://focus-tiger-cloud.ihiro.workers.dev"),
			web,
		);
		assert.equal(
			resolveCheckoutReturnUrl(web, undefined, "https://focus-tiger-cloud.ihiro.workers.dev"),
			web,
		);
	});

	it("rewrites loopback Checkout return to the Vite tab origin", () => {
		const web =
			"http://127.0.0.1:5173/?product=1&sanctuary_session={CHECKOUT_SESSION_ID}";
		assert.equal(
			rewriteCheckoutReturnPageOrigin(web, "http://127.0.0.1:5174"),
			"http://127.0.0.1:5174/?product=1&sanctuary_session={CHECKOUT_SESSION_ID}",
		);
	});

	it("does not rewrite production hosts or untrusted pageOrigin", () => {
		const prod =
			"https://app.example/?product=1&sanctuary_session={CHECKOUT_SESSION_ID}";
		assert.equal(
			rewriteCheckoutReturnPageOrigin(prod, "http://127.0.0.1:5174"),
			prod,
		);
		const web = "http://127.0.0.1:5173/?product=1&tip=1";
		assert.equal(
			rewriteCheckoutReturnPageOrigin(web, "https://evil.example"),
			web,
		);
	});

	it("prefers desktop bridge over Vite pageOrigin", () => {
		const web =
			"http://127.0.0.1:5173/?product=1&pro_session={CHECKOUT_SESSION_ID}";
		const request = new Request(
			"https://focus-tiger-cloud.ihiro.workers.dev/api/create-pro-checkout-session",
		);
		const resolved = resolveSessionReturnUrls(
			web,
			"http://127.0.0.1:5173/?product=1&pro=cancel",
			{ returnSurface: "desktop", pageOrigin: "http://127.0.0.1:5174" },
			request,
		);
		assert.equal(
			new URL(resolved.successUrl).pathname,
			"/checkout/desktop-return",
		);
	});
});
