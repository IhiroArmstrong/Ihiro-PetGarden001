import { errorJson, json } from "../lib/http";
import {
	isPlausibleEmail,
	normalizeEmail,
	readMembership,
} from "../lib/membershipKv";
import type { Env } from "../types";

/**
 * POST /api/verify-membership
 * Body: { email: string }
 * Restores subscription entitlement on another device (email → MEMBERSHIP_KV).
 * Lookup-only — not login / magic link (same pattern as verify-sanctuary).
 */
export async function handleVerifyMembership(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}

	let email = "";
	try {
		const body = (await request.json()) as { email?: unknown };
		if (typeof body?.email === "string") email = body.email;
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}
	if (!isPlausibleEmail(email)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}

	const record = await readMembership(env.MEMBERSHIP_KV, normalizeEmail(email));
	if (!record) {
		return json({ active: false, unlocked: false });
	}
	return json({
		active: true,
		unlocked: true,
		periodEndsAt: record.periodEndsAt,
		planId: record.planId,
		subscriptionId: record.subscriptionId,
	});
}
