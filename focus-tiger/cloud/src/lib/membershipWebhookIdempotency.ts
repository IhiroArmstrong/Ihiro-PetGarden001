import { json } from "./http.ts";
import {
	readMembershipWebhookEvent,
	writeMembershipWebhookEvent,
} from "./membershipKv.ts";
import type { Env } from "../types.ts";

export async function withMembershipWebhookIdempotency(
	env: Env,
	eventId: string,
	run: () => Promise<Response>,
): Promise<Response> {
	if (eventId && env.MEMBERSHIP_KV) {
		const seen = await readMembershipWebhookEvent(env.MEMBERSHIP_KV, eventId);
		if (seen) {
			return json({
				received: true,
				duplicate: true,
				eventId,
				product: "membership",
			});
		}
	}
	const response = await run();
	if (response.ok && eventId && env.MEMBERSHIP_KV) {
		await writeMembershipWebhookEvent(env.MEMBERSHIP_KV, eventId);
	}
	return response;
}
