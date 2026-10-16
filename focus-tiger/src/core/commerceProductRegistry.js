/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A9 · Monetized checkout products — single registry (slice 1: return + Support wiring).
 *
 * Practice kinds (end voice / save-image naming) land in a follow-up slice.
 *
 * @see docs/root-cause-audit-2026-10-12.md A9
 */

import { DESKTOP_CHECKOUT_KINDS } from './desktopCheckoutPending.js';
import { emotionKeyForPaymentThanks } from './paymentCheckoutThanks.js';

/**
 * @typedef {import('./desktopCheckoutPending.js').DesktopCheckoutKind} DesktopCheckoutKind
 * @typedef {import('./paymentCheckoutThanks.js').PaymentThanksKind} PaymentThanksKind
 *
 * @typedef {'tip-query' | 'stripe-session'} CommerceReturnQueryMode
 * @typedef {'none' | 'art-collection-sheets' | 'art-edition-catalog'} CommerceHdGrantSource
 * @typedef {'none' | 'art-edition-serial'} CommerceSerialRuleSource
 *
 * @typedef {object} CommerceProductRow
 * @property {DesktopCheckoutKind} desktopCheckoutKind
 * @property {PaymentThanksKind | null} thanksKind
 * @property {CommerceReturnQueryMode} returnQueryMode
 * @property {string | null} stripeSessionParam e.g. `pro_session` when mode is stripe-session
 * @property {boolean} peekProductShellThanks `peekCheckoutReturnThanksKind` participates
 * @property {string | null} thanksEmotionKey emotion played after web thanks return
 * @property {string | null} supportModalCheckoutKind `_runCheckout('…')` kind when wired
 * @property {string | null} supportCardTestId `data-testid` on Support card
 * @property {'lifetimeActive' | 'membershipActive' | 'addonActive' | null} supportPaidSettledFlag
 * @property {CommerceHdGrantSource} hdGrantSource
 * @property {CommerceSerialRuleSource} serialNumberRuleSource
 */

/** @type {ReadonlyArray<CommerceProductRow>} */
const COMMERCE_PRODUCT_ROWS = Object.freeze([
  Object.freeze({
    desktopCheckoutKind: 'tea',
    thanksKind: 'tip',
    returnQueryMode: 'tip-query',
    stripeSessionParam: null,
    peekProductShellThanks: true,
    thanksEmotionKey: emotionKeyForPaymentThanks('tip'),
    supportModalCheckoutKind: 'tea',
    supportCardTestId: 'yin-support-tea-card',
    supportPaidSettledFlag: null,
    hdGrantSource: 'none',
    serialNumberRuleSource: 'none'
  }),
  Object.freeze({
    desktopCheckoutKind: 'sanctuary',
    thanksKind: 'sanctuary',
    returnQueryMode: 'stripe-session',
    stripeSessionParam: 'sanctuary_session',
    peekProductShellThanks: true,
    thanksEmotionKey: emotionKeyForPaymentThanks('sanctuary'),
    supportModalCheckoutKind: 'sanctuary',
    supportCardTestId: 'yin-support-sanctuary-card',
    supportPaidSettledFlag: 'lifetimeActive',
    hdGrantSource: 'none',
    serialNumberRuleSource: 'none'
  }),
  Object.freeze({
    desktopCheckoutKind: 'membership',
    thanksKind: 'membership',
    returnQueryMode: 'stripe-session',
    stripeSessionParam: 'membership_session',
    peekProductShellThanks: true,
    thanksEmotionKey: emotionKeyForPaymentThanks('membership'),
    supportModalCheckoutKind: 'membership',
    supportCardTestId: 'yin-support-membership-card',
    supportPaidSettledFlag: 'membershipActive',
    hdGrantSource: 'none',
    serialNumberRuleSource: 'none'
  }),
  Object.freeze({
    desktopCheckoutKind: 'pro',
    thanksKind: 'pro',
    returnQueryMode: 'stripe-session',
    stripeSessionParam: 'pro_session',
    peekProductShellThanks: true,
    thanksEmotionKey: emotionKeyForPaymentThanks('pro'),
    supportModalCheckoutKind: 'pro',
    supportCardTestId: 'yin-support-pro-card',
    supportPaidSettledFlag: null,
    hdGrantSource: 'none',
    serialNumberRuleSource: 'none'
  }),
  Object.freeze({
    desktopCheckoutKind: 'companion-addon',
    thanksKind: 'companion-addon',
    returnQueryMode: 'stripe-session',
    stripeSessionParam: 'companion_addon_session',
    peekProductShellThanks: true,
    thanksEmotionKey: emotionKeyForPaymentThanks('companion-addon'),
    supportModalCheckoutKind: 'companion-addon',
    supportCardTestId: 'yin-support-companion-addon-card',
    supportPaidSettledFlag: 'addonActive',
    hdGrantSource: 'none',
    serialNumberRuleSource: 'none'
  }),
  Object.freeze({
    desktopCheckoutKind: 'art-collection',
    thanksKind: null,
    returnQueryMode: 'stripe-session',
    stripeSessionParam: 'art_session',
    peekProductShellThanks: false,
    thanksEmotionKey: null,
    supportModalCheckoutKind: null,
    supportCardTestId: null,
    supportPaidSettledFlag: null,
    hdGrantSource: 'art-collection-sheets',
    serialNumberRuleSource: 'art-edition-serial'
  })
]);

const BY_DESKTOP_KIND = new Map(
  COMMERCE_PRODUCT_ROWS.map((row) => [row.desktopCheckoutKind, row])
);

/**
 * @returns {ReadonlyArray<CommerceProductRow>}
 */
export function listCommerceProducts() {
  return COMMERCE_PRODUCT_ROWS;
}

/**
 * @param {DesktopCheckoutKind} kind
 * @returns {CommerceProductRow}
 */
export function getCommerceProduct(kind) {
  const row = BY_DESKTOP_KIND.get(kind);
  if (!row) {
    throw new Error(`[commerce-product-registry] unknown desktop checkout kind: ${kind}`);
  }
  return row;
}

/**
 * @returns {ReadonlyArray<CommerceProductRow>}
 */
export function listCommerceProductsWithSupportCard() {
  return COMMERCE_PRODUCT_ROWS.filter((row) => row.supportModalCheckoutKind != null);
}

/**
 * Dev/test guard: registry must cover every `DESKTOP_CHECKOUT_KINDS` entry exactly once.
 */
export function assertCommerceRegistryCoversDesktopCheckoutKinds() {
  const registryKinds = COMMERCE_PRODUCT_ROWS.map((r) => r.desktopCheckoutKind).sort();
  const desktopKinds = [...DESKTOP_CHECKOUT_KINDS].sort();
  if (registryKinds.join('\0') !== desktopKinds.join('\0')) {
    throw new Error(
      `[commerce-product-registry] DESKTOP_CHECKOUT_KINDS mismatch: registry=${registryKinds.join(',')} desktop=${desktopKinds.join(',')}`
    );
  }
}

assertCommerceRegistryCoversDesktopCheckoutKinds();
