import { errorJson, json } from "../lib/http";
import { emailFromCheckoutSession, retrieveCheckoutSession } from "../lib/stripe";
import { ART_COLLECTION_PRODUCT, findArtCollectionWork } from "../lib/artCollectionCatalog";
import {
	grantArtPiece,
	indexArtCollectionPurchase,
	isArtPieceOwned,
	normalizeArtEmail,
	readArtCollection,
	writeArtCollection,
} from "../lib/artCollectionKv";
import type { Env } from "../types";

/**
 * POST /api/confirm-art-collection-session
 * Body: { sessionId: string }
 */
export async function handleConfirmArtCollectionSession(
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
		session = await retrieveCheckoutSession({ secretKey: secret, sessionId });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_failed";
		return errorJson(502, "stripe_error", detail);
	}

	if (session.metadata?.product !== ART_COLLECTION_PRODUCT) {
		return errorJson(403, "not_art_collection", "Session is not an art collection purchase");
	}
	const artId = session.metadata?.artId || "";
	if (!findArtCollectionWork(artId)) {
		return errorJson(403, "unknown_art", "Session piece is not on this shelf");
	}
	if (session.mode && session.mode !== "payment") {
		return errorJson(403, "not_one_time", "Expected one-time payment");
	}
	if (session.payment_status && session.payment_status !== "paid") {
		return json({ owned: false, pending: true, artId });
	}

	const emailRaw = emailFromCheckoutSession(session);
	if (!emailRaw) {
		return json({ owned: false, pending: false, reason: "email_required", artId });
	}
	const email = normalizeArtEmail(emailRaw);
	const existing = await readArtCollection(env.SANCTUARY_KV, email);
	const already = existing.items[artId];
	if (already && isArtPieceOwned(existing, artId)) {
		return json({
			owned: true,
			email,
			artId,
			ownedAt: already.ownedAt,
			receiptId: already.receiptId,
		});
	}
	const ownedAt = new Date().toISOString();
	const receiptId = session.id;
	const next = grantArtPiece(existing, artId, ownedAt, receiptId);
	await writeArtCollection(env.SANCTUARY_KV, email, next);
	await indexArtCollectionPurchase(env.SANCTUARY_KV, {
		email,
		artId,
		receiptId,
	});
	const saved = next.items[artId];
	return json({
		owned: true,
		email,
		artId,
		ownedAt: saved?.ownedAt || ownedAt,
		receiptId: saved?.receiptId || receiptId,
	});
}
