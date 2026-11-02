import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCompanionChannelCopyPayload } from "./tasteCompanionChannelCopyFreeze.ts";

describe("buildCompanionChannelCopyPayload", () => {
	it("publishes only reviewed English channels and keeps overlayLive false", () => {
		const payload = buildCompanionChannelCopyPayload();
		assert.ok(payload);
		assert.equal(payload.overlayLive, false);
		assert.equal(payload.locale, "en");
		assert.equal(payload.schemaVersion, 1);
		assert.equal(payload.companionChannelCopy.channels.length, 5);
		const ids = payload.companionChannelCopy.channels.flatMap((c) =>
			c.lines.map((l) => l.id),
		);
		assert.equal(ids.length, 40);
		assert.ok(
			payload.companionChannelCopy.channels.every((c) =>
				c.lines.every(
					(l) => l.reviewed === true && Boolean(l.reviewer) && Boolean(l.contentHash),
				),
			),
		);
	});
});
