import { errorJson, json } from "../lib/http";
import { emailFromCheckoutSession, retrieveCheckoutSession } from "../lib/stripe";
import {
	COMPANION_ADDON_LIFETIME_ITEM_ID,
	normalizeEmail,
	readCompanionAddon,
	writeCompanionAddon,
} from "../lib/companionAddonKv";
import type { Env } from "../types";

/**
 * POST /api/confirm-companion-addon-session
 * Body: { sessionId: string }
 */
export async function handleConfirmCompanionAddonSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	if (!secret) {
		return errorJson(503, "misconfigured", "Stripe secret not configured");
	}
	if (!env.SANCTUARY_KV) {
		return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
	}

	let sessionId = "";
	try {
		const body = (await request.json()) as { sessionId?: unknown };
		if (typeof body?.sessionId === "string") sessionId = body.sessionId.trim();
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}
	if (!sessionId.startsWith("cs_")) {
		return errorJson(400, "invalid_session", "sessionId must be a Checkout Session id");
	}

	let session;
	try {
		session = await retrieveCheckoutSession({
			secretKey: secret,
			sessionId,
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_failed";
		return errorJson(502, "stripe_error", detail);
	}

	const product = session.metadata?.product;
	if (product !== "companion-addon") {
		return errorJson(
			403,
			"not_companion_addon",
			"Session is not a Companion add-on purchase",
		);
	}

	if (session.mode && session.mode !== "payment") {
		return errorJson(403, "not_one_time", "Expected one-time payment");
	}
	if (session.payment_status && session.payment_status !== "paid") {
		return json({ unlocked: false, reason: "not_paid" });
	}

	const emailRaw = emailFromCheckoutSession(session);
	if (emailRaw) {
		const email = normalizeEmail(emailRaw);
		const existing = await readCompanionAddon(env.SANCTUARY_KV, email);
		if (!existing) {
			await writeCompanionAddon(env.SANCTUARY_KV, email, {
				unlocked: true,
				unlockedAt: new Date().toISOString(),
				receiptId: session.id,
				itemId:
					session.metadata?.itemId || COMPANION_ADDON_LIFETIME_ITEM_ID,
			});
		}
	}

	return json({
		unlocked: true,
		sessionId: session.id,
		itemId: session.metadata?.itemId || COMPANION_ADDON_LIFETIME_ITEM_ID,
	});
}
