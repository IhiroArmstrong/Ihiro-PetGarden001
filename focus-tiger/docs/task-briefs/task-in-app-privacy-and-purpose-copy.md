# Task Brief · 应用内隐私入口 +「?」简介文案

> **状态（2026-08-07）**：产品口径已锁；**实现另开 feature**（本回合只文档）。  
> **触发**：用户同意简介英文气质；并问完整隐私说明是否应在产品内可打开。

## 权威边界

| 项 | 口径 |
|---|---|
| 简介卡 | 「?」→ `#onboarding-app-purpose` only（既有产品面，见 `ONBOARDING_HINTS.md`） |
| 完整隐私 | [`PRIVACY_NOTICE.md`](../PRIVACY_NOTICE.md)；**须**应用内可浏览 |
| **禁止** | 文案承诺 **iCloud** / 未实现云同步；简介卡内嵌整篇隐私长文 |
| i18n | v1.0.0 对外 en + ja；实现时键对齐 |

## 「?」简介卡正文（定稿气质 · 待接线 i18n）

保留定位一句 + 价值主张，避免与 *at your own pace* 啰嗦重复：

**EN（建议替换 / 扩展 `HINT_APP_PURPOSE_BODY`）**：

> Focus Tiger is a mindful companion for focus and presence — a quiet place for practice, at your own pace.  
> No pressure, no ads. Practice stays on this device. We don’t mine your reflections.

**次要链**：`Privacy` → 打开应用内 `PRIVACY_NOTICE` 只读层（Dismiss / 返回简介）。

## 实现要点（将来）

1. locales：更新 purpose body；新增 `HINT_APP_PURPOSE_PRIVACY` / aria。  
2. UI：简介卡底一行文字链，打开 `#…-privacy-sheet`（登记 `Z_INDEX`）。  
3. 正文：静态摘录或 fetch 同仓 markdown 的构建时嵌入（勿依赖外网）。  
4. 验收：点 ? → 见新文案 → Privacy → 可读本地优先 / 不挖矿反思 / 无 iCloud 承诺 → 关闭回流。  

Brief 实现分支建议：`feature/in-app-privacy-purpose-copy`。
