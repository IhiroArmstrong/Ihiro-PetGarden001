/**
 * Mock entitlement provider — no Stripe / Worker.
 * Lab: localStorage script + optional `?entitlementMock=`.
 */

export const ENTITLEMENT_MOCK_STORAGE_KEY = 'focus-tiger.entitlement-mock.v1';

/**
 * @typedef {'none' | 'lifetime' | 'subscription' | 'both'} EntitlementMockScenario
 *
 * @typedef {{
 *   scenario: EntitlementMockScenario,
 *   periodEndsAt: string | null,
 *   failFetch: boolean
 * }} EntitlementMockConfig
 */

/**
 * @param {unknown} raw
 * @returns {EntitlementMockConfig}
 */
export function normalizeEntitlementMockConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return { scenario: 'none', periodEndsAt: null, failFetch: false };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const scenario =
    o.scenario === 'lifetime' ||
    o.scenario === 'subscription' ||
    o.scenario === 'both' ||
    o.scenario === 'none'
      ? o.scenario
      : 'none';
  return {
    scenario,
    periodEndsAt:
      typeof o.periodEndsAt === 'string' && o.periodEndsAt
        ? o.periodEndsAt
        : null,
    failFetch: Boolean(o.failFetch)
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {EntitlementMockConfig}
 */
export function readEntitlementMockConfig(storage) {
  if (!storage) return normalizeEntitlementMockConfig(null);
  try {
    const raw = storage.getItem(ENTITLEMENT_MOCK_STORAGE_KEY);
    if (!raw) return normalizeEntitlementMockConfig(null);
    return normalizeEntitlementMockConfig(JSON.parse(raw));
  } catch {
    return normalizeEntitlementMockConfig(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Partial<EntitlementMockConfig>} config
 */
export function writeEntitlementMockConfig(storage, config) {
  if (!storage) return;
  try {
    const n = normalizeEntitlementMockConfig({
      ...readEntitlementMockConfig(storage),
      ...config
    });
    storage.setItem(ENTITLEMENT_MOCK_STORAGE_KEY, JSON.stringify(n));
  } catch {
    // ignore
  }
}

/**
 * URL override: `?entitlementMock=none|lifetime|subscription|both`
 *
 * @param {string} [search]
 * @returns {EntitlementMockScenario | null}
 */
export function parseEntitlementMockSearch(search = '') {
  const m = /(?:^|[?&])entitlementMock=(none|lifetime|subscription|both)(?:&|$)/.exec(
    String(search || '')
  );
  return m ? /** @type {EntitlementMockScenario} */ (m[1]) : null;
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 * @param {() => Date} [opts.now]
 * @returns {import('./entitlementProvider.js').EntitlementProvider}
 */
export function createMockEntitlementProvider({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  search = typeof location !== 'undefined' ? location.search : '',
  now = () => new Date()
} = {}) {
  return {
    id: 'mock',
    async fetchEntitlement() {
      const fromUrl = parseEntitlementMockSearch(search);
      const cfg = readEntitlementMockConfig(storage);
      if (cfg.failFetch) {
        throw new Error('mock entitlement fetch failed');
      }
      const scenario = fromUrl || cfg.scenario;
      if (scenario === 'none') {
        return {
          lifetime: { active: false, unlockedAt: null, itemId: null, via: null },
          subscription: {
            active: false,
            periodEndsAt: null,
            planId: null,
            via: null
          }
        };
      }

      /** @type {import('./entitlementProvider.js').EntitlementProviderPatch} */
      const patch = {};
      if (scenario === 'lifetime' || scenario === 'both') {
        patch.lifetime = {
          active: true,
          unlockedAt: now().toISOString(),
          itemId: 'mock-lifetime',
          via: 'mock'
        };
      } else {
        patch.lifetime = {
          active: false,
          unlockedAt: null,
          itemId: null,
          via: null
        };
      }

      if (scenario === 'subscription' || scenario === 'both') {
        const ends =
          cfg.periodEndsAt ||
          new Date(now().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        patch.subscription = {
          active: true,
          periodEndsAt: ends,
          planId: 'mock-subscription',
          via: 'mock'
        };
      } else {
        patch.subscription = {
          active: false,
          periodEndsAt: null,
          planId: null,
          via: null
        };
      }
      return patch;
    }
  };
}
