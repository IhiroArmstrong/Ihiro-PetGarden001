import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handleDesktopCheckoutReturn } from "./desktopCheckoutReturn.ts";

describe("desktopCheckoutReturn route", () => {
	it("returns an HTML bridge that deep-links into the shell", async () => {
		const res = await handleDesktopCheckoutReturn(
			new Request(
				"https://focus-tiger-cloud.ihiro.workers.dev/checkout/desktop-return?product=1&pro_session=cs_test_abc",
			),
		);
		assert.equal(res.status, 200);
		const html = await res.text();
		assert.match(html, /focus-tiger:\/\/app\/\?product=1&pro_session=cs_test_abc/);
		assert.match(html, /Returning to the Focus Tiger desktop app/);
		assert.match(html, /You can close this browser tab/);
		assert.match(html, /location\.replace/);
	});
});
