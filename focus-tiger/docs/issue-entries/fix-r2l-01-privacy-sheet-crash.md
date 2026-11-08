---
ledger: R2L-01：隐私设置页打开抛 `_refreshT54ResearchOptInCopy is not a function`
kind: progress
status: 跟进中
updated: 2026-11-08
---

## 本支做了什么

- `OnboardingHintsUI._refreshT54ResearchOptInCopy`：与 YPE / 付费漏斗开关同款，同步 `hasT54ResearchConsent` 与 `T54_RESEARCH_CONSENT_*` 文案。
- 契约：`privacyNoticeCopy.test.js` 锁方法体存在；`e2e/onboarding-remedy-contract.spec.js` 已有「打开 Privacy 页 + T54 勾选」路径。

## 还剩什么

- PR CI 绿后合入 develop。
- V1 补跑（六个同意开关）待本修复合入后再做 R2-lite 窄范围复跑。

## 登记

- PO 队列：**P1**（R2-lite 否决项复核阻塞）。
