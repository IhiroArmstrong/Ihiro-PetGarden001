import { errorJson, json } from "../lib/http";
import { requireJsonFields } from "../lib/validate";
import {
	isPlausibleEmail,
	normalizeEmail,
	readSupporter,
} from "../lib/supporterKv";
import type { Env } from "../types";

/**
 * POST /api/verify-supporter
 * Body: { email: string }
 * Lookup-only restore — not login / magic link.
 */
export async function handleVerifySupporter(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.SUPPORTER_KV) {
		return errorJson(503, "misconfigured", "SUPPORTER_KV not bound");
	}

	const fields = await requireJsonFields(request, ["email"]);
	if (fields instanceof Response) return fields;

	if (!isPlausibleEmail(fields.email)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}

	const email = normalizeEmail(fields.email);
	const record = await readSupporter(env.SUPPORTER_KV, email);
	if (!record) {
		return json({ supporter: false });
	}

	return json({
		supporter: true,
		purchasedAt: record.purchasedAt,
	});
}
