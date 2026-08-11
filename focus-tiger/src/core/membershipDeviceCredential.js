/**
 * Membership device credential — opaque token from confirm or OTP verify.
 * Used by cloud entitlement provider + Billing Portal; not a password.
 */

export const MEMBERSHIP_DEVICE_CREDENTIAL_KEY =
  'focus-tiger.membership-device.v1';

/**
 * @typedef {{ email: string, deviceToken: string }} MembershipDeviceCredential
 */

/**
 * @param {unknown} raw
 * @returns {MembershipDeviceCredential | null}
 */
export function normalizeMembershipDeviceCredential(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const email =
    typeof o.email === 'string' && o.email.trim() ? o.email.trim().toLowerCase() : '';
  const deviceToken =
    typeof o.deviceToken === 'string' && o.deviceToken.trim()
      ? o.deviceToken.trim()
      : '';
  if (!email || !deviceToken || deviceToken.length < 16) return null;
  return { email, deviceToken };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {MembershipDeviceCredential | null}
 */
export function readMembershipDeviceCredential(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(MEMBERSHIP_DEVICE_CREDENTIAL_KEY);
    if (!raw) return null;
    return normalizeMembershipDeviceCredential(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ email?: unknown, deviceToken?: unknown } | null | undefined} cred
 */
export function writeMembershipDeviceCredential(storage, cred) {
  if (!storage) return;
  const n = normalizeMembershipDeviceCredential(cred);
  if (!n) return;
  try {
    storage.setItem(MEMBERSHIP_DEVICE_CREDENTIAL_KEY, JSON.stringify(n));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Persist from confirm / verify JSON body when both fields present.
 * @param {Storage | null | undefined} storage
 * @param {unknown} body
 * @returns {boolean} true if stored
 */
export function persistMembershipDeviceCredentialFromBody(storage, body) {
  if (!body || typeof body !== 'object') return false;
  const o = /** @type {Record<string, unknown>} */ (body);
  const n = normalizeMembershipDeviceCredential({
    email: o.email,
    deviceToken: o.deviceToken
  });
  if (!n) return false;
  writeMembershipDeviceCredential(storage, n);
  return true;
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearMembershipDeviceCredential(storage) {
  if (!storage) return;
  try {
    storage.removeItem(MEMBERSHIP_DEVICE_CREDENTIAL_KEY);
  } catch {
    // ignore
  }
}
