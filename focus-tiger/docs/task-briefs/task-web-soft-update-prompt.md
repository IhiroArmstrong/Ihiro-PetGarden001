# Task Brief · Web 轻量版本更新提示（点一下刷新）

> **状态（2026-08-12）**：产品口径已拍板；**实现于** `feature/web-soft-update-prompt`（本支）。  
> **文档支**：`docs/web-soft-update-prompt` / PR #261。

## 拍板（2026-08-12）

1. **先做 Web 轻提示**：发现新版本 → 用户点一下 → **刷新拿新前端**。  
   **不是**补丁包下载；桌面壳（Electron / Tauri）真更新器另议，等打包选型。
2. **入口**：仅在**确认有新版本**时出现（更安静）；无更新时**不**常驻左下角。

## 产品约束

| 项 | 口径 |
|---|---|
| 打断 | Focus / Arrival / Reflection / 微仪式进行中：**不弹窗、不抢主 CTA**；芯片可延后显示到 Idle/可点态 |
| 动作 | 点击 → `location.reload()`（或等价整页刷新）；禁止后台强刷打断一炷香 |
| 文案 | 轻量、观察式，如「Update to Ver x.y.z」/「有新版本可用」；**禁止** FOMO、倒计时、强制 |
| 语义 | Web 阶段**禁止**写成「下载补丁包」 |
| 付费 | 与 Stripe / entitlement **解耦**；会员与免费用户同一更新提示 |
| 推送 | **不做**系统推送（PWA 任务六仍「不做推送」）；本项仅应用内 UI |
| 离线 | 核心路径仍可离线；无网则不显示更新入口（静默） |

## 工程草图（实现时）

1. **版本源**：构建写入同域 `version.json`（或 build id / SemVer）；启动后（及可选低频轮询）`fetch` 对比本地。  
   Worker 可日后托管清单，**v1 不必**绑死云请求。
2. **UI**：左下角一带小可点芯片（靠近 `?`，**勿压住** `.onboarding-hint-help`）；登记 `Z_INDEX.md`（建议与 `?` 同带 ~22，略抬或错位）。
3. **i18n**：`en` + `ja`（zh draft 可同步）；禁止硬编码业务句。
4. **单测**：版本比较 / 「仅更新时显示」契约；可选 DEV `?forceUpdatePrompt=1`。
5. **TRACKER**：UI 可见行「待人工测试」；主路径 + 回流（刷新后芯片消失）。

## 明确不做（本任务）

- 差分补丁包 / app-update.exe 类下载  
- Service Worker Cache Storage 离线优先（仍守方案 A network-only）  
- 推送通知「有新版」  
- 用更新提示推销 Membership / Tea  

## 排期口令

- 文档已本支：`docs/web-soft-update-prompt`  
- 实现：`开工 Web 版本提示` → `feature/web-soft-update-prompt` worktree  

## 权威交叉

- PWA 基础：`TASKS.md` 任务六；`TEST_TRACKER` PWA 两行（安装 / 发版抽查仍延后）  
- 宁静 / 不制造焦虑：`PRINCIPLES.md`  
- z-index：`Z_INDEX.md`（左下 `?` = 22）  
- PROCESS 最近拍板 + Backlog 列名
