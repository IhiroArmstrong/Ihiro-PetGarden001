/**
 * Cloud soft-schedule config client（路径 B）。
 *
 * 默认 mode:'local'——不发起网络请求；形状与将来 remote 对齐（A2/A4/A5）。
 * 原则 5：调用方不得在交互热路径 await 本 client 才播动画；
 * remote 启用后只做预取 / 当日缓存。
 */

import {
  DEFAULT_CELEBRATE_DANCE_WEIGHTS,
  SOFT_SCHEDULE_SCHEMA_VERSION,
  getLocalEmotionWeightTable,
  pickDailyMessageKey
} from './softScheduleConfig.js';

/**
 * @typedef {'local' | 'remote'} CloudConfigMode
 */

/**
 * @param {object} [options]
 * @param {CloudConfigMode} [options.mode]
 * @param {string} [options.baseUrl] remote 时 Workers 根 URL（路径 B 默认不用）
 * @param {() => string} [options.getLocalDate] YYYY-MM-DD
 * @param {typeof fetch} [options.fetchImpl]
 */
export function createCloudConfigClient({
  mode = 'local',
  baseUrl = '',
  getLocalDate = () => new Date().toISOString().slice(0, 10),
  fetchImpl = globalThis.fetch?.bind(globalThis)
} = {}) {
  /** @type {Map<string, unknown>} */
  const dayCache = new Map();

  function cacheKey(kind, localDate, extra = '') {
    return `${kind}:${localDate}:${extra}`;
  }

  function resolveDate(localDate) {
    return String(localDate || getLocalDate() || '').trim();
  }

  /**
   * A4 形态 2：权重表。celebrating 以外返回空表 + 标记未配置。
   * @param {string} emotionKey
   * @param {string} [sessionPhase]
   * @param {{ localDate?: string }} [opts]
   */
  async function getEmotionWeightTable(emotionKey, sessionPhase = 'focus', opts = {}) {
    const localDate = resolveDate(opts.localDate);
    const key = cacheKey('emotion', localDate, `${emotionKey}:${sessionPhase}`);
    if (dayCache.has(key)) {
      return /** @type {ReturnType<typeof localEmotionPayload>} */ (dayCache.get(key));
    }

    let payload = localEmotionPayload(emotionKey);
    if (mode === 'remote') {
      try {
        payload = await fetchEmotionRemote(emotionKey, sessionPhase);
      } catch {
        payload = localEmotionPayload(emotionKey);
      }
    }

    if (localDate) dayCache.set(key, payload);
    return payload;
  }

  /**
   * A2：只给 messageKey（+ seed）。
   * @param {{ locale?: string, localDate?: string, slot?: string }} [opts]
   */
  async function getDailyMessage(opts = {}) {
    const localDate = resolveDate(opts.localDate);
    const locale = opts.locale || 'en';
    const slot = opts.slot || 'tech_verify';
    const key = cacheKey('daily', localDate, `${locale}:${slot}`);
    if (dayCache.has(key)) {
      return /** @type {ReturnType<typeof pickDailyMessageKey>} */ (dayCache.get(key));
    }

    let payload = pickDailyMessageKey({ locale, localDate, slot });
    if (mode === 'remote') {
      try {
        payload = await fetchDailyRemote({ locale, localDate, slot });
      } catch {
        payload = pickDailyMessageKey({ locale, localDate, slot });
      }
    }

    if (localDate) dayCache.set(key, payload);
    return payload;
  }

  /** 测试 / DEV：清当日缓存（换日后自然错键）。 */
  function clearCache() {
    dayCache.clear();
  }

  /**
   * @param {string} emotionKey
   */
  function localEmotionPayload(emotionKey) {
    const table = getLocalEmotionWeightTable(emotionKey);
    if (!table) {
      return {
        schemaVersion: SOFT_SCHEDULE_SCHEMA_VERSION,
        configured: false,
        variants: /** @type {typeof DEFAULT_CELEBRATE_DANCE_WEIGHTS} */ ([])
      };
    }
    return {
      schemaVersion: SOFT_SCHEDULE_SCHEMA_VERSION,
      configured: true,
      variants: table
    };
  }

  /**
   * @param {string} emotionKey
   * @param {string} sessionPhase
   */
  async function fetchEmotionRemote(emotionKey, sessionPhase) {
    if (typeof fetchImpl !== 'function' || !baseUrl) {
      throw new Error('remote_unavailable');
    }
    const res = await fetchImpl(`${stripSlash(baseUrl)}/api/emotion-weight`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ emotionKey, sessionPhase })
    });
    if (!res.ok) throw new Error(`emotion_http_${res.status}`);
    const body = await res.json();
    if (!Array.isArray(body?.variants)) throw new Error('emotion_shape');
    return {
      schemaVersion: Number(body.schemaVersion) || SOFT_SCHEDULE_SCHEMA_VERSION,
      configured: true,
      variants: body.variants
    };
  }

  /**
   * @param {{ locale: string, localDate: string, slot: string }} args
   */
  async function fetchDailyRemote({ locale, localDate, slot }) {
    if (typeof fetchImpl !== 'function' || !baseUrl) {
      throw new Error('remote_unavailable');
    }
    const res = await fetchImpl(`${stripSlash(baseUrl)}/api/daily-message`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ locale, localDate, slot })
    });
    if (!res.ok) throw new Error(`daily_http_${res.status}`);
    const body = await res.json();
    if (!body?.messageKey || typeof body.messageKey !== 'string') {
      throw new Error('daily_shape');
    }
    return {
      schemaVersion: Number(body.schemaVersion) || SOFT_SCHEDULE_SCHEMA_VERSION,
      messageKey: body.messageKey,
      variantSeed: String(body.variantSeed || `${localDate}:${locale}:${slot}`)
    };
  }

  return {
    mode,
    getEmotionWeightTable,
    getDailyMessage,
    clearCache,
    /** @deprecated 测试别名 */
    DEFAULT_CELEBRATE_DANCE_WEIGHTS
  };
}

function stripSlash(url) {
  return String(url || '').replace(/\/$/, '');
}
