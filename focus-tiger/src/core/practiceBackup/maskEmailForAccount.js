/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Menu / account-page masking: keep the first local character and the domain.
 * Short local parts still hide the rest so the address is not copy-identifiable.
 *
 * @param {string | null | undefined} email
 * @returns {string}
 */
export function maskEmailForAccount(email) {
  const raw = String(email || '').trim();
  const at = raw.lastIndexOf('@');
  if (at <= 0 || at === raw.length - 1) return '•••';
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1).trim();
  if (!local || !domain) return '•••';
  const lead = local.slice(0, 1);
  return `${lead}•••@${domain}`;
}
