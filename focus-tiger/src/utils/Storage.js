// 职责：localStorage 的 JSON 安全封装。
// localStorage 被禁用（隐私模式、iframe 限制等）时静默回退，不抛错、不阻断主流程。

export function getStorage(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setStorage(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // 持久化不可用时放弃写入，调用方不依赖写入成功。
  }
}
