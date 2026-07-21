import { errorJson, json } from "./lib/http";
import { enforceRateLimit } from "./middleware/rateLimit";
import { handleDailyMessage } from "./routes/dailyMessage";
import { handleEmotionWeight } from "./routes/emotionWeight";
import type { Env } from "./types";

/**
 * Focus Tiger · Cloudflare Workers API stubs.
 * No frontend wiring yet — local `wrangler dev` only.
 */
export default {
	async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === "GET" && url.pathname === "/health") {
			return json({ ok: true, service: "focus-tiger-cloud" });
		}

		const rateLimited = enforceRateLimit(request);
		if (rateLimited) {
			return rateLimited;
		}

		if (url.pathname === "/api/daily-message") {
			if (request.method !== "POST") {
				return errorJson(405, "method_not_allowed", "Use POST");
			}
			return handleDailyMessage(request);
		}

		if (url.pathname === "/api/emotion-weight") {
			if (request.method !== "POST") {
				return errorJson(405, "method_not_allowed", "Use POST");
			}
			return handleEmotionWeight(request);
		}

		return errorJson(404, "not_found", `No route for ${url.pathname}`);
	},
} satisfies ExportedHandler<Env>;
