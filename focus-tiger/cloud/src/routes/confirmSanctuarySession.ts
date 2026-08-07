import { errorJson, json } from "../lib/http";
import {
	emailFromCheckoutSession,
	retrieveCheckoutSession,
} from "../lib/stripe";
import {
	normalizeEmail,
	readSanctuary,
	writeSanctuary,
} from "../lib/sanctuaryKv";
import type { Env } from "../types";

/**
 * POST /api/confirm-sanctuary-session
 * Body: { sessionId: string }
 *
 * Server retrieves Checkout Session from Stripe. Only unlocks when
 * metadata.product === sanctuary and payment_status === paid.
 * Client must NOT unlock from query alone.
 */
export async function handleConfirmSanctuarySession(
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
	if (product !== "sanctuary") {
		return errorJson(403, "not_sanctuary", "Session is not a Sanctuary purchase");
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
		const existing = await readSanctuary(env.SANCTUARY_KV, email);
		if (!existing) {
			await writeSanctuary(env.SANCTUARY_KV, email, {
				unlocked: true,
				unlockedAt: new Date().toISOString(),
				receiptId: session.id,
				itemId: session.metadata?.itemId || "yin-sanctuary-lifetime",
			});
		}
	}

	return json({
		unlocked: true,
		sessionId: session.id,
		itemId: session.metadata?.itemId || "yin-sanctuary-lifetime",
	});
}
