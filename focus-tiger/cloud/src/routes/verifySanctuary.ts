import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail, readSanctuary } from "../lib/sanctuaryKv";
import type { Env } from "../types";

/**
 * POST /api/verify-sanctuary
 * Body: { email: string }
 * Restores Lifetime unlock on another device (email → SANCTUARY_KV).
 */
export async function handleVerifySanctuary(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.SANCTUARY_KV) {
		return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
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

	const record = await readSanctuary(env.SANCTUARY_KV, normalizeEmail(email));
	if (!record) {
		return json({ unlocked: false });
	}
	return json({
		unlocked: true,
		unlockedAt: record.unlockedAt,
		itemId: record.itemId,
	});
}
