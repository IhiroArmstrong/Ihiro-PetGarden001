import { errorJson, json } from "./lib/http";
import { preflightResponse, resolveAllowedOrigin, withCors } from "./lib/cors";
import {
	enforceRateLimit,
	RATE_LIMIT_PER_MINUTE,
	RESTORE_OTP_REQUEST_RATE_LIMIT_PER_MINUTE,
	STRIPE_WEBHOOK_RATE_LIMIT_PER_MINUTE,
	VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
} from "./middleware/rateLimit";
import { handleDailyMessage } from "./routes/dailyMessage";
import { handleEmotionWeight } from "./routes/emotionWeight";
import { handleMonetizationFunnelIngest } from "./routes/monetizationFunnelIngest";
import { handleCreateTipCheckoutSession } from "./routes/createTipCheckoutSession";
import { handleCreateSanctuaryCheckoutSession } from "./routes/createSanctuaryCheckoutSession";
import { handleCreateMembershipCheckoutSession } from "./routes/createMembershipCheckoutSession";
import { handleConfirmSanctuarySession } from "./routes/confirmSanctuarySession";
import { handleConfirmMembershipSession } from "./routes/confirmMembershipSession";
import { handleCreateMembershipPortalSession } from "./routes/createMembershipPortalSession";
import { handleMembershipEntitlement } from "./routes/membershipEntitlement";
import { handleRequestRestoreOtp } from "./routes/requestRestoreOtp";
import { handleRequestPracticeBackupOtp } from "./routes/requestPracticeBackupOtp";
import { handleVerifyPracticeBackup } from "./routes/verifyPracticeBackup";
import { handlePutPracticeBackup } from "./routes/putPracticeBackup";
import { handleGetPracticeBackup } from "./routes/getPracticeBackup";
import { handleDeletePracticeBackup } from "./routes/deletePracticeBackup";
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
		ctx: ExecutionContext,
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
				url.pathname === "/api/membership-entitlement" ||
				url.pathname === "/api/create-membership-portal-session" ||
				url.pathname === "/api/restore/request-otp" ||
				url.pathname === "/api/practice-backup/request-otp" ||
				url.pathname === "/api/practice-backup/verify" ||
				url.pathname === "/api/practice-backup/put" ||
				url.pathname === "/api/practice-backup/get" ||
				url.pathname === "/api/practice-backup/delete" ||
				url.pathname === "/api/daily-message" ||
				url.pathname === "/api/emotion-weight" ||
				url.pathname === "/api/monetization-funnel-ingest")
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

		if (url.pathname === "/api/restore/request-otp") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const otpLimited = enforceRateLimit(request, {
				limit: RESTORE_OTP_REQUEST_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "restore-otp-request",
			});
			if (otpLimited) return withCors(otpLimited, origin);
			return withCors(await handleRequestRestoreOtp(request, env, ctx), origin);
		}

		if (url.pathname === "/api/practice-backup/request-otp") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const otpLimited = enforceRateLimit(request, {
				limit: RESTORE_OTP_REQUEST_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "practice-backup-otp-request",
			});
			if (otpLimited) return withCors(otpLimited, origin);
			return withCors(
				await handleRequestPracticeBackupOtp(request, env, ctx),
				origin,
			);
		}

		if (url.pathname === "/api/practice-backup/verify") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const verifyLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "practice-backup-verify",
			});
			if (verifyLimited) return withCors(verifyLimited, origin);
			return withCors(await handleVerifyPracticeBackup(request, env), origin);
		}

		if (url.pathname === "/api/practice-backup/put") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const limited = enforceRateLimit(request, {
				limit: RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "practice-backup-put",
			});
			if (limited) return withCors(limited, origin);
			return withCors(await handlePutPracticeBackup(request, env), origin);
		}

		if (url.pathname === "/api/practice-backup/get") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const limited = enforceRateLimit(request, {
				limit: RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "practice-backup-get",
			});
			if (limited) return withCors(limited, origin);
			return withCors(await handleGetPracticeBackup(request, env), origin);
		}

		if (url.pathname === "/api/practice-backup/delete") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const limited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "practice-backup-delete",
			});
			if (limited) return withCors(limited, origin);
			return withCors(await handleDeletePracticeBackup(request, env), origin);
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

		if (url.pathname === "/api/membership-entitlement") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const entitlementLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "membership-entitlement",
			});
			if (entitlementLimited) return withCors(entitlementLimited, origin);
			return withCors(await handleMembershipEntitlement(request, env), origin);
		}

		if (url.pathname === "/api/create-membership-portal-session") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			const portalLimited = enforceRateLimit(request, {
				limit: VERIFY_TIP_RATE_LIMIT_PER_MINUTE,
				bucketPrefix: "membership-portal",
			});
			if (portalLimited) return withCors(portalLimited, origin);
			return withCors(
				await handleCreateMembershipPortalSession(request, env),
				origin,
			);
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

		if (url.pathname === "/api/monetization-funnel-ingest") {
			if (request.method !== "POST") {
				return withCors(
					errorJson(405, "method_not_allowed", "Use POST"),
					origin,
				);
			}
			return withCors(
				await handleMonetizationFunnelIngest(request, env),
				origin,
			);
		}

		return withCors(
			errorJson(404, "not_found", `No route for ${url.pathname}`),
			origin,
		);
	},
} satisfies ExportedHandler<Env>;
