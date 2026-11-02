import { json, errorJson } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import { buildCompanionChannelCopyPayload } from "../lib/tasteCompanionChannelCopyFreeze.ts";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Four-channel English copy overlay. overlayLive is false until a written deploy.
 * ja / zh requests get 204-equivalent empty via 200 with overlayLive false and
 * no usable pool — client must keep freeze tables.
 */
export async function handleCompanionChannelCopy(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const locale = String(parsed.locale || "");
	if (locale !== "en") {
		return json({
			schemaVersion: 1,
			locale,
			overlayLive: false,
			companionChannelCopy: { channels: [] },
			variantSeed: "0",
		});
	}

	const payload = buildCompanionChannelCopyPayload();
	if (!payload) {
		return errorJson(500, "companion_channel_copy_unpublishable", "Freeze pack failed review filter");
	}
	return json(payload);
}
