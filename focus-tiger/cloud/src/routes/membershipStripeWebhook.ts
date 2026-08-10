/**
 * Yin Membership · Stripe webhook event handlers (Prompt 9).
 * Called from stripeWebhook after signature verification.
 */

import { errorJson, json } from "../lib/http";
import {
	MEMBERSHIP_PLAN_ID,
	normalizeEmail,
	readMembership,
	readMembershipSubIndex,
	revokeMembership,
	upsertActiveMembership,
	type MembershipRecord,
} from "../lib/membershipKv";
import {
	emailFromCheckoutSession,
	emailFromSubscription,
	isActiveMembershipSubscriptionStatus,
	isMembershipProductMetadata,
	isPastDueMembershipSubscriptionStatus,
	periodEndsAtFromSubscription,
	retrieveSubscription,
	subscriptionIdFromCheckoutSession,
	subscriptionIdFromInvoice,
	type StripeCheckoutSession,
	type StripeInvoice,
	type StripeSubscription,
} from "../lib/stripe";
import type { Env } from "../types";

type MembershipWebhookResult = Response;

function ignored(reason: string): Response {
	return json({ received: true, ignored: true, reason, product: "membership" });
}

function stored(action: string): Response {
	return json({
		received: true,
		stored: true,
		product: "membership",
		action,
	});
}

async function resolveMembershipEmail(opts: {
	env: Env;
	secretKey: string;
	hintEmail?: string | null;
	subscriptionId?: string | null;
	subscription?: StripeSubscription | null;
}): Promise<string | null> {
	if (opts.hintEmail && opts.hintEmail.trim()) {
		return normalizeEmail(opts.hintEmail);
	}
	const subId = (opts.subscriptionId || "").trim();
	if (subId.startsWith("sub_")) {
		const fromIndex = await readMembershipSubIndex(opts.env.MEMBERSHIP_KV, subId);
		if (fromIndex) return fromIndex;
	}
	const sub =
		opts.subscription ||
		(subId.startsWith("sub_")
			? await retrieveSubscription({
					secretKey: opts.secretKey,
					subscriptionId: subId,
				}).catch(() => null)
			: null);
	if (!sub) return null;
	const fromStripe = await emailFromSubscription({
		secretKey: opts.secretKey,
		subscription: sub,
	});
	return fromStripe ? normalizeEmail(fromStripe) : null;
}

function planIdFromMeta(
	metadata: Record<string, string> | null | undefined,
): string | null {
	if (typeof metadata?.planId === "string" && metadata.planId) {
		return metadata.planId;
	}
	return null;
}

/** True if this subscription is (or was) our Membership product. */
function acceptsMembershipSubscription(
	sub: StripeSubscription,
	hasSubIndex: boolean,
): boolean {
	if (isMembershipProductMetadata(sub.metadata)) return true;
	// Legacy / race: index written by confirm or checkout.completed before metadata existed.
	if (hasSubIndex) return true;
	// No product tag and no index → do not touch tip/sanctuary/unknown subs.
	return false;
}

async function activateOrRefreshMembership(opts: {
	env: Env;
	email: string;
	subscription: StripeSubscription;
	/** Prefer Checkout Session id; keep existing on renewals. */
	receiptId?: string | null;
	clearPaymentFailed?: boolean;
}): Promise<"stored" | "missing_period"> {
	const periodEndsAt = periodEndsAtFromSubscription(opts.subscription);
	if (!periodEndsAt) return "missing_period";

	const existing = await readMembership(opts.env.MEMBERSHIP_KV, opts.email);
	const receiptId =
		(typeof opts.receiptId === "string" && opts.receiptId) ||
		existing?.receiptId ||
		opts.subscription.id;

	const record: MembershipRecord = {
		active: true,
		periodEndsAt,
		planId:
			planIdFromMeta(opts.subscription.metadata) ||
			existing?.planId ||
			MEMBERSHIP_PLAN_ID,
		receiptId,
		subscriptionId: opts.subscription.id,
	};
	// Clear failure stamp on successful checkout / invoice.paid; keep on soft refresh.
	if (!opts.clearPaymentFailed && existing?.lastPaymentFailedAt) {
		record.lastPaymentFailedAt = existing.lastPaymentFailedAt;
	}

	await upsertActiveMembership(opts.env.MEMBERSHIP_KV, opts.email, record);
	return "stored";
}

export async function handleMembershipCheckoutCompleted(opts: {
	env: Env;
	session: StripeCheckoutSession;
}): Promise<MembershipWebhookResult> {
	const { env, session } = opts;
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	if (!secret) {
		return errorJson(503, "misconfigured", "Stripe secret not configured");
	}

	if (!isMembershipProductMetadata(session.metadata)) {
		console.info(
			"[stripe-webhook] subscription checkout ignored (not membership); session=",
			session.id,
		);
		return ignored("not_membership_product");
	}

	const emailRaw = emailFromCheckoutSession(session);
	if (!emailRaw) {
		console.warn(
			"[stripe-webhook] membership checkout.session.completed without email; session=",
			session.id,
		);
		return ignored("missing_email");
	}

	const subscriptionId = subscriptionIdFromCheckoutSession(session);
	if (!subscriptionId) {
		console.warn(
			"[stripe-webhook] membership checkout missing subscription; session=",
			session.id,
		);
		return ignored("missing_subscription");
	}

	let subscription: StripeSubscription;
	try {
		subscription = await retrieveSubscription({
			secretKey: secret,
			subscriptionId,
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_failed";
		console.error(
			"[stripe-webhook] membership checkout retrieveSubscription failed",
			detail,
		);
		return errorJson(502, "stripe_error", detail);
	}

	if (!isActiveMembershipSubscriptionStatus(subscription.status)) {
		console.info(
			"[stripe-webhook] membership checkout sub not active/trialing; status=",
			subscription.status,
			"session=",
			session.id,
		);
		return ignored("subscription_not_active");
	}

	const email = normalizeEmail(emailRaw);
	const result = await activateOrRefreshMembership({
		env,
		email,
		subscription,
		receiptId: typeof session.id === "string" ? session.id : null,
		clearPaymentFailed: true,
	});
	if (result === "missing_period") {
		return errorJson(502, "stripe_error", "subscription missing current_period_end");
	}
	return stored("checkout_completed");
}

export async function handleMembershipInvoicePaid(opts: {
	env: Env;
	invoice: StripeInvoice;
}): Promise<MembershipWebhookResult> {
	const { env, invoice } = opts;
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	if (!secret) {
		return errorJson(503, "misconfigured", "Stripe secret not configured");
	}

	const subscriptionId = subscriptionIdFromInvoice(invoice);
	if (!subscriptionId) {
		return ignored("invoice_not_subscription");
	}

	const indexed = await readMembershipSubIndex(env.MEMBERSHIP_KV, subscriptionId);
	let subscription: StripeSubscription;
	try {
		subscription = await retrieveSubscription({
			secretKey: secret,
			subscriptionId,
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_failed";
		console.error("[stripe-webhook] invoice.paid retrieveSubscription failed", detail);
		return errorJson(502, "stripe_error", detail);
	}

	if (!acceptsMembershipSubscription(subscription, Boolean(indexed))) {
		return ignored("not_membership_subscription");
	}

	if (!isActiveMembershipSubscriptionStatus(subscription.status)) {
		console.info(
			"[stripe-webhook] invoice.paid sub status not active/trialing;",
			subscription.status,
		);
		return ignored("subscription_not_active");
	}

	const email = await resolveMembershipEmail({
		env,
		secretKey: secret,
		hintEmail: invoice.customer_email,
		subscriptionId,
		subscription,
	});
	if (!email) {
		console.error(
			"[stripe-webhook] invoice.paid cannot resolve email; sub=",
			subscriptionId,
		);
		return ignored("missing_email");
	}

	const result = await activateOrRefreshMembership({
		env,
		email,
		subscription,
		// Keep original Checkout Session receiptId on renewals.
		receiptId: null,
		clearPaymentFailed: true,
	});
	if (result === "missing_period") {
		return errorJson(502, "stripe_error", "subscription missing current_period_end");
	}
	return stored("invoice_paid");
}

export async function handleMembershipInvoicePaymentFailed(opts: {
	env: Env;
	invoice: StripeInvoice;
}): Promise<MembershipWebhookResult> {
	const { env, invoice } = opts;
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	if (!secret) {
		return errorJson(503, "misconfigured", "Stripe secret not configured");
	}

	const subscriptionId = subscriptionIdFromInvoice(invoice);
	if (!subscriptionId) {
		return ignored("invoice_not_subscription");
	}

	const indexed = await readMembershipSubIndex(env.MEMBERSHIP_KV, subscriptionId);
	let subscription: StripeSubscription | null = null;
	try {
		subscription = await retrieveSubscription({
			secretKey: secret,
			subscriptionId,
		});
	} catch (err) {
		console.warn(
			"[stripe-webhook] invoice.payment_failed retrieveSubscription failed",
			err instanceof Error ? err.message : err,
		);
	}

	if (
		subscription &&
		!acceptsMembershipSubscription(subscription, Boolean(indexed))
	) {
		return ignored("not_membership_subscription");
	}
	if (!subscription && !indexed) {
		return ignored("not_membership_subscription");
	}

	const email = await resolveMembershipEmail({
		env,
		secretKey: secret,
		hintEmail: invoice.customer_email,
		subscriptionId,
		subscription,
	});
	if (!email) {
		console.error(
			"[stripe-webhook] invoice.payment_failed cannot resolve email; sub=",
			subscriptionId,
		);
		return ignored("missing_email");
	}

	const existing = await readMembership(env.MEMBERSHIP_KV, email);
	if (!existing) {
		console.info(
			"[stripe-webhook] invoice.payment_failed no KV record yet; sub=",
			subscriptionId,
		);
		return ignored("no_membership_record");
	}

	const failedAt = new Date().toISOString();
	await upsertActiveMembership(env.MEMBERSHIP_KV, email, {
		...existing,
		lastPaymentFailedAt: failedAt,
	});

	console.warn("[stripe-webhook] invoice.payment_failed stamped", {
		subscriptionId,
		invoiceId: invoice.id || null,
		attempt_count: invoice.attempt_count ?? null,
		lastPaymentFailedAt: failedAt,
		// email omitted from structured log body — use sub id for support join
	});

	return stored("payment_failed_stamped");
}

export async function handleMembershipSubscriptionUpdated(opts: {
	env: Env;
	subscription: StripeSubscription;
}): Promise<MembershipWebhookResult> {
	const { env, subscription } = opts;
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	if (!secret) {
		return errorJson(503, "misconfigured", "Stripe secret not configured");
	}

	const indexed = await readMembershipSubIndex(
		env.MEMBERSHIP_KV,
		subscription.id,
	);
	if (!acceptsMembershipSubscription(subscription, Boolean(indexed))) {
		return ignored("not_membership_subscription");
	}

	const email = await resolveMembershipEmail({
		env,
		secretKey: secret,
		subscriptionId: subscription.id,
		subscription,
	});
	if (!email) {
		console.error(
			"[stripe-webhook] subscription.updated cannot resolve email; sub=",
			subscription.id,
		);
		return ignored("missing_email");
	}

	if (subscription.status === "canceled") {
		await revokeMembership(env.MEMBERSHIP_KV, email, subscription.id);
		console.info(
			"[stripe-webhook] subscription.updated canceled → revoked; sub=",
			subscription.id,
		);
		return stored("subscription_canceled_revoked");
	}

	if (isActiveMembershipSubscriptionStatus(subscription.status)) {
		const result = await activateOrRefreshMembership({
			env,
			email,
			subscription,
			receiptId: null,
			clearPaymentFailed: false,
		});
		if (result === "missing_period") {
			return errorJson(
				502,
				"stripe_error",
				"subscription missing current_period_end",
			);
		}
		return stored(
			subscription.cancel_at_period_end
				? "subscription_active_cancel_at_period_end"
				: "subscription_active_refreshed",
		);
	}

	if (isPastDueMembershipSubscriptionStatus(subscription.status)) {
		const existing = await readMembership(env.MEMBERSHIP_KV, email);
		if (existing) {
			await upsertActiveMembership(env.MEMBERSHIP_KV, email, {
				...existing,
				lastPaymentFailedAt:
					existing.lastPaymentFailedAt || new Date().toISOString(),
			});
		}
		console.info(
			"[stripe-webhook] subscription.updated past_due/unpaid — no revoke; sub=",
			subscription.id,
		);
		return stored("subscription_past_due_kept");
	}

	console.info(
		"[stripe-webhook] subscription.updated ignored status=",
		subscription.status,
		"sub=",
		subscription.id,
	);
	return ignored("subscription_status_unhandled");
}

export async function handleMembershipSubscriptionDeleted(opts: {
	env: Env;
	subscription: StripeSubscription;
}): Promise<MembershipWebhookResult> {
	const { env, subscription } = opts;
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}
	const secret = (env.STRIPE_SECRET_KEY || "").trim();

	const indexed = await readMembershipSubIndex(
		env.MEMBERSHIP_KV,
		subscription.id,
	);
	if (!acceptsMembershipSubscription(subscription, Boolean(indexed))) {
		return ignored("not_membership_subscription");
	}

	const email = await resolveMembershipEmail({
		env,
		secretKey: secret || "unused",
		subscriptionId: subscription.id,
		subscription,
	});
	if (!email) {
		// Still drop reverse index if present.
		if (indexed) {
			await revokeMembership(env.MEMBERSHIP_KV, indexed, subscription.id);
			console.warn(
				"[stripe-webhook] subscription.deleted revoked via sub-index only; sub=",
				subscription.id,
			);
			return stored("subscription_deleted_revoked");
		}
		console.error(
			"[stripe-webhook] subscription.deleted cannot resolve email; sub=",
			subscription.id,
		);
		return ignored("missing_email");
	}

	await revokeMembership(env.MEMBERSHIP_KV, email, subscription.id);
	console.info(
		"[stripe-webhook] subscription.deleted → revoked; sub=",
		subscription.id,
	);
	return stored("subscription_deleted_revoked");
}
