import { errorJson, json } from "../lib/http";
import { resolveSessionReturnUrls } from "../lib/checkoutReturnUrls";
import { createArtCollectionCheckoutSession } from "../lib/stripe";
import { findArtCollectionWork } from "../lib/artCollectionCatalog";
import type { Env } from "../types";

/**
 * POST /api/create-art-collection-checkout-session
 * Body: { artId: string, returnSurface?: "desktop", pageOrigin?: string }
 */
export async function handleCreateArtCollectionCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const successUrl = (env.ART_COLLECTION_CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.ART_COLLECTION_CHECKOUT_CANCEL_URL || "").trim();
	if (!secret || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			"Art Collection Checkout is not configured",
		);
	}

	let artId = "";
	let parsedBody: unknown = null;
	try {
		parsedBody = await request.json();
		const body = parsedBody as { artId?: unknown };
		if (typeof body?.artId === "string") artId = body.artId.trim();
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}
	const work = findArtCollectionWork(artId);
	if (!work) {
		return errorJson(400, "unknown_art", "That piece is not for sale");
	}

	const returns = resolveSessionReturnUrls(
		successUrl,
		cancelUrl,
		parsedBody,
		request,
	);

	try {
		const session = await createArtCollectionCheckoutSession({
			secretKey: secret,
			artId: work.id,
			productName: work.name,
			unitAmount: work.unitAmount,
			successUrl: returns.successUrl,
			cancelUrl: returns.cancelUrl,
		});
		return json({ url: session.url, sessionId: session.id });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "checkout_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
