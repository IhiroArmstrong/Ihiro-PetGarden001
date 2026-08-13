/**
 * Mock newsletter provider — pretends submit succeeds (labs / no Cloud URL).
 * Production uses createWorkerNewsletterProvider when VITE_CLOUD_API_BASE_URL is set.
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
