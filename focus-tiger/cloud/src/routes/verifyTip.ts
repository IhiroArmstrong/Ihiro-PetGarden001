import { errorJson, json } from "../lib/http";
import { requireJsonFields } from "../lib/validate";
import {
	isPlausibleEmail,
	normalizeEmail,
	readTip,
} from "../lib/tipKv";
import type { Env } from "../types";

/**
 * POST /api/verify-tip
 * Body: { email: string }
 * Lookup-only restore — not login / magic link.
 */
export async function handleVerifyTip(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.TIP_KV) {
		return errorJson(503, "misconfigured", "TIP_KV not bound");
	}

	const fields = await requireJsonFields(request, ["email"]);
	if (fields instanceof Response) return fields;

	if (!isPlausibleEmail(fields.email)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}

	const email = normalizeEmail(fields.email);
	const record = await readTip(env.TIP_KV, email);
	if (!record) {
		return json({ tipped: false });
	}

	return json({
		tipped: true,
		tipCount: record.tipCount,
		lastTippedAt: record.lastTippedAt,
	});
}
