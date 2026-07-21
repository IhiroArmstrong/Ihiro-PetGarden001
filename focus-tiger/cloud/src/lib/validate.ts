import { errorJson } from "./http";

/**
 * Parse JSON body and require the listed string fields (non-empty after trim).
 * Missing / wrong type / empty → 400.
 */
export async function requireJsonFields(
	request: Request,
	fields: readonly string[],
): Promise<Record<string, string> | Response> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorJson(400, "invalid_json", "Request body must be valid JSON");
	}

	if (body === null || typeof body !== "object" || Array.isArray(body)) {
		return errorJson(400, "invalid_body", "Request body must be a JSON object");
	}

	const record = body as Record<string, unknown>;
	const out: Record<string, string> = {};
	const missing: string[] = [];

	for (const field of fields) {
		const value = record[field];
		if (typeof value !== "string" || value.trim() === "") {
			missing.push(field);
			continue;
		}
		out[field] = value.trim();
	}

	if (missing.length > 0) {
		return errorJson(
			400,
			"missing_fields",
			`Missing or empty required fields: ${missing.join(", ")}`,
		);
	}

	return out;
}
