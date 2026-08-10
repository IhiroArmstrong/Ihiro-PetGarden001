import { errorJson, json } from "./lib/http";
import { preflightResponse, resolveAllowedOrigin, withCors } from "./lib/cors";
import {
	enforceRateLimit,
	RATE_LIMIT_PER_MINUTE,
	STRIPE_WEBHOOK_RATE_LIMIT_PER_MINUTE,
	VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
} from "./middleware/rateLimit";
import { handleDailyMessage } from "./routes/dailyMessage";
import { handleEmotionWeight } from "./routes/emotionWeight";
import { handleCreateTipCheckoutSession } from "./routes/createTipCheckoutSession";
import { handleCreateSanctuaryCheckoutSession } from "./routes/createSanctuaryCheckoutSession";
import { handleCreateMembershipCheckoutSession } from "./routes/createMembershipCheckoutSession";
import { handleConfirmSanctuarySession } from "./routes/confirmSanctuarySession";
import { handleConfirmMembershipSession } from "./routes/confirmMembershipSession";
import { handleVerifySanctuary } from "./routes/verifySanctuary";
import { handleVerifyMembership } from "./routes/verifyMembership";
import { handleStripeWebhook } from "./routes/stripeWebhook";
import { handleVerifyTip } from "./routes/verifyTip";
import type { Env } from "./types";

/**
 * Focus Tiger · Cloudflare Workers API.
 * A Tip Jar + B Sanctuary Lifetime + Yin Membership (separate Price / KV / routes).
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

		if (
			request.method === "OPTIONS" &&
			(url.pathname === "/api/create-tip-checkout-session" ||
				url.pathname === "/api/verify-tip" ||
				url.pathname === "/api/create-sanctuary-checkout-session" ||
				url.pathname === "/api/confirm-sanctuary-session" ||
				url.pathname === "/api/verify-sanctuary" ||
				url.pathname === "/api/create-membership-checkout-session" ||
				url.pathname === "/api/confirm-membership-session" ||
				url.pathname === "/api/verify-membership" ||
				url.pathname === "/api/daily-message" ||
				url.pathname === "/api/emotion-weight")
		) {
			return preflightResponse(origin);
		}

		if (url.pathname === "/api/stripe-webhook") {
			if (request.method !== "POST") {
				return errorJson(405, "method_not_allowed", "Use POST");
			}
			const webhookLimited = enforceRateLimit(request, {
				limit: STRIPE_WEBHOOK_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "stripe-webhook",
			});
			if (webhookLimited) return webhookLimited;
			return handleStripeWebhook(request, env);
		}

		if (url.pathname === "/api/verify-tip") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const verifyLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "verify-tip",
			});
			if (verifyLimited) return withCors(verifyLimited, origin);
			return withCors(await handleVerifyTip(request, env), origin);
		}

		if (url.pathname === "/api/verify-sanctuary") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const verifyLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "verify-sanctuary",
			});
			if (verifyLimited) return withCors(verifyLimited, origin);
			return withCors(await handleVerifySanctuary(request, env), origin);
		}

		if (url.pathname === "/api/verify-membership") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const verifyLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "verify-membership",
			});
			if (verifyLimited) return withCors(verifyLimited, origin);
			return withCors(await handleVerifyMembership(request, env), origin);
		}

		if (url.pathname === "/api/confirm-sanctuary-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const confirmLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "confirm-sanctuary",
			});
			if (confirmLimited) return withCors(confirmLimited, origin);
			return withCors(await handleConfirmSanctuarySession(request, env), origin);
		}

		if (url.pathname === "/api/confirm-membership-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const confirmLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "confirm-membership",
			});
			if (confirmLimited) return withCors(confirmLimited, origin);
			return withCors(await handleConfirmMembershipSession(request, env), origin);
		}

		const rateLimited = enforceRateLimit(request, {
			limit: RATE_LIMIT_PER_MINUTE,
			bucketPrefix: "global",
		});
		if (rateLimited) {
			return withCors(rateLimited, origin);
		}

		if (url.pathname === "/api/create-tip-checkout-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(await handleCreateTipCheckoutSession(request, env), origin);
		}

		if (url.pathname === "/api/create-sanctuary-checkout-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(
				await handleCreateSanctuaryCheckoutSession(request, env),
				origin,
			);
		}

		if (url.pathname === "/api/create-membership-checkout-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(
				await handleCreateMembershipCheckoutSession(request, env),
				origin,
			);
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
