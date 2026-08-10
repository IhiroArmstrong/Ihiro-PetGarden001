/**
 * Mock newsletter provider — pretends submit succeeds (UI / wiring labs).
 * Swap for a real ESP or Worker later without changing call sites.
 */

/**
 * @param {object} [opts]
 * @param {number} [opts.delayMs]
 * @param {boolean} [opts.fail]
 * @returns {import('./newsletterProvider.js').NewsletterProvider}
 */
export function createMockNewsletterProvider({
  delayMs = 180,
  fail = false
} = {}) {
  return {
    id: 'mock',
    async subscribe(email) {
      const normalized = String(email || '')
        .trim()
        .toLowerCase();
      await new Promise((r) => setTimeout(r, Math.max(0, delayMs)));
      if (!normalized || !normalized.includes('@')) {
        return { ok: false, error: 'invalid_email' };
      }
      if (fail) {
        return { ok: false, error: 'mock_fail' };
      }
      return { ok: true };
    }
  };
}
