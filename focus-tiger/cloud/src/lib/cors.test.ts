/**
 * CORS origin allowlist (comma-separated + desktop custom protocol).
 * Run: cd focus-tiger/cloud && npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAllowedOrigins, resolveAllowedOrigin } from "./cors.ts";
import type { Env } from "../types";

function env(origin: string): Env {
	return { ALLOWED_ORIGIN: origin } as Env;
}

describe("cors allowlist", () => {
	it("parses comma-separated origins", () => {
		assert.deepEqual(
			parseAllowedOrigins("http://127.0.0.1:5173, focus-tiger://app"),
			["http://127.0.0.1:5173", "focus-tiger://app"],
		);
	});

	it("echoes a matching desktop custom origin", () => {
		const request = new Request("https://focus-tiger-cloud.ihiro.workers.dev/api/x", {
			headers: { origin: "focus-tiger://app" },
		});
		assert.equal(
			resolveAllowedOrigin(
				env("http://127.0.0.1:5173,focus-tiger://app"),
				request,
			),
			"focus-tiger://app",
		);
	});

	it("rejects an origin that is not on the list (no silent echo)", () => {
		const request = new Request("https://focus-tiger-cloud.ihiro.workers.dev/api/x", {
			headers: { origin: "https://evil.example" },
		});
		assert.equal(
			resolveAllowedOrigin(env("http://127.0.0.1:5173"), request),
			null,
		);
	});
});
