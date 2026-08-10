/**
 * Post-Stripe Checkout thank-you emotions (product shell return).
 *
 * success_url intentionally lands on `?product=1` (+ tip/session query).
 * Cold-start WELCOME_APP must not overwrite these acknowledgements.
 *
 * @see docs/YIN_TIP_JAR.md · YIN_SANCTUARY.md · YIN_MEMBERSHIP.md
 */

/** @typedef {'tip' | 'sanctuary' | 'membership'} PaymentThanksKind */

/** @type {Readonly<Record<PaymentThanksKind, string>>} */
export const PAYMENT_THANKS_EMOTIONS = Object.freeze({
  tip: 'teaDrinking',
  sanctuary: 'mindfulAcknowledge',
  membership: 'sessionComplete'
});

/**
 * @param {PaymentThanksKind} kind
 * @returns {string}
 */
export function emotionKeyForPaymentThanks(kind) {
  return PAYMENT_THANKS_EMOTIONS[kind];
}

/**
 * Peek Checkout return query (before consume/confirm strips it).
 *
 * @param {string} [search]
 * @returns {PaymentThanksKind | null}
 */
export function peekCheckoutReturnThanksKind(search = '') {
  const raw = String(search || '');
  const params = new URLSearchParams(
    raw.startsWith('?') ? raw.slice(1) : raw
  );
  const tip = params.get('tip') ?? params.get('tea');
  if (tip === '1' || tip === 'success') return 'tip';
  if ((params.get('sanctuary_session') || '').startsWith('cs_')) {
    return 'sanctuary';
  }
  if ((params.get('membership_session') || '').startsWith('cs_')) {
    return 'membership';
  }
  return null;
}

/**
 * Tip is optimistic (`?tip=1`) — play at the welcome boot slot.
 * Sanctuary / Membership require server confirm — only skip welcome until confirm.
 *
 * @param {PaymentThanksKind | null} kind
 * @returns {{ skipWelcome: boolean, playAtWelcomeSlot: string | null }}
 */
export function resolveCheckoutReturnWelcomeGate(kind) {
  if (!kind) {
    return { skipWelcome: false, playAtWelcomeSlot: null };
  }
  if (kind === 'tip') {
    return {
      skipWelcome: true,
      playAtWelcomeSlot: emotionKeyForPaymentThanks('tip')
    };
  }
  return { skipWelcome: true, playAtWelcomeSlot: null };
}
