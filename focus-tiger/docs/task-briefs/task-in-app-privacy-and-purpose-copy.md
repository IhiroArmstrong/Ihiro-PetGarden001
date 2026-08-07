# Task Brief · 应用内隐私入口 +「?」简介文案

> **状态（2026-08-07）**：实现于 `feature/in-app-privacy-purpose-copy`（已接线）。  
> **触发**：用户确认 Privacy → Reflection → 壁纸优先；同意并行开工。

## 权威边界

| 项 | 口径 |
|---|---|
| 简介卡 | 「?」→ `#onboarding-app-purpose` only（`ONBOARDING_HINTS.md`） |
| 完整隐私 | 应用内 `#onboarding-privacy-sheet`；叙事对齐 `PRIVACY_NOTICE.md` |
| **禁止** | 承诺具名云保管同步；简介卡内嵌整篇长文 |
| i18n | en + ja 对齐（zh draft 同步） |

## 简介气质（已接线 `HINT_APP_PURPOSE_BODY`）

> Focus Tiger is a mindful companion for focus and presence — a quiet place for practice, at your own pace.  
> No pressure, no ads. Practice stays on this device. We don’t mine your reflections.

**次要链**：`Privacy` → `#onboarding-privacy-sheet` → **Back** 回简介。

## 验收

主路径：? → 新简介文案 → Privacy → Back → Got it。回流：Rise 后再走一遍。375 可滚可关。  
自动化：`privacyNoticeCopy.test.js`；`e2e/onboarding-remedy-contract.spec.js` Privacy 行。
