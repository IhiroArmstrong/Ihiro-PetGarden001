import { errorJson, json } from "./lib/http";
import { preflightResponse, resolveAllowedOrigin, withCors } from "./lib/cors";
import {
	enforceRateLimit,
	RATE_LIMIT_PER_MINUTE,
	STRIPE_WEBHOOK_RATE_LIMIT_PER_MINUTE,
	VERIFY_SUPPORTER_RATE_LIMIT_PER_MINUTE,
} from "./middleware/rateLimit";
import { handleDailyMessage } from "./routes/dailyMessage";
import { handleEmotionWeight } from "./routes/emotionWeight";
import { handleCreateCheckoutSession } from "./routes/createCheckoutSession";
import { handleStripeWebhook } from "./routes/stripeWebhook";
import { handleVerifySupporter } from "./routes/verifySupporter";
import type { Env } from "./types";

/**
 * Focus Tiger · Cloudflare Workers API.
 * Founder Supporter Pack: Checkout + webhook + email restore (one-time only).
 */
export default {
	async fetch(
		request: Request,
		env: Env,
		_ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);
		const origin = resolveAllowedOrigin(env, request);

		if (request.method === "GET" && url.pathname === "/health") {
			return json({ ok: true, service: "focus-tiger-cloud" });
		}

		// CORS preflight for browser POSTs (not webhook).
		if (
			request.method === "OPTIONS" &&
			(url.pathname === "/api/create-checkout-session" ||
				url.pathname === "/api/verify-supporter" ||
				url.pathname === "/api/daily-message" ||
				url.pathname === "/api/emotion-weight")
		) {
			return preflightResponse(origin);
		}

		if (url.pathname === "/api/stripe-webhook") {
			if (request.method !== "POST") {
				return errorJson(405, "method_not_allowed", "Use POST");
			}
			// Exempt from global 60/min; still IP-capped to blunt HMAC DoS.
			const webhookLimited = enforceRateLimit(request, {
				limit: STRIPE_WEBHOOK_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "stripe-webhook",
			});
			if (webhookLimited) return webhookLimited;
			return handleStripeWebhook(request, env);
		}

		if (url.pathname === "/api/verify-supporter") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const verifyLimited = enforceRateLimit(request, {
				limit: VERIFY_SUPPORTER_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "verify-supporter",
			});
			if (verifyLimited) return withCors(verifyLimited, origin);
			return withCors(await handleVerifySupporter(request, env), origin);
		}

		const rateLimited = enforceRateLimit(request, {
			limit: RATE_LIMIT_PER_MINUTE,
			bucketPrefix: "global",
		});
		if (rateLimited) {
			return withCors(rateLimited, origin);
		}

		if (url.pathname === "/api/create-checkout-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(await handleCreateCheckoutSession(request, env), origin);
		}

		if (url.pathname === "/api/daily-message") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(await handleDailyMessage(request), origin);
		}

		if (url.pathname === "/api/emotion-weight") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(await handleEmotionWeight(request), origin);
		}

		return withCors(
			errorJson(404, "not_found", `No route for ${url.pathname}`),
			origin,
		);
	},
} satisfies ExportedHandler<Env>;
