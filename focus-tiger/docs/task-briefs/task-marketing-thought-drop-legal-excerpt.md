# Task Brief · 营销站 Thought Drop 法律摘录（路线 X · 阶段 2 续）

> **状态**：**PO 2026-11-19 点头开工**（续 #1788 / #1790 非目标 · 合理则办）  
> **代号**：`marketing-thought-drop-legal-excerpt`（不得自编 T 号）  
> **类**：**B 类**（公网法律页可见文案）  
> **依赖**：阶段 2 [`task-thought-drop-guest-help-kb-catalog.md`](./task-thought-drop-guest-help-kb-catalog.md) **#1790 已合** · 窄口径 B 与 Plan A safe 短语一致  
> **旁支**：`feature/marketing-thought-drop-legal-excerpt`  
> **不是**：`focus-tiger/src/**` · Help/KB 再改 · `check:plan-a` 策略改码 · Cloudflare 部署 · 全文搬 `PRIVACY_NOTICE.md`

## 0. 大白话

App 里 Help 已承认 **Thought Drop / 觉察一句** 对客人开放、一次一句。  
`marketing-site/privacy.html` 与 `wellness.html` 仍写 **Chat with Yin 尚未对客人开放**——与第一份安装包必须能开入口矛盾。

本刀只改仓库根 `marketing-site/` 法律摘录 HTML + `slice0-contract.test.js`，让公网摘录与路线 X 一致。

## 0.1 Plan A 拍板（锁死 · 同阶段 2 窄 B）

| 可写 | 禁止写 |
|---|---|
| **Thought Drop**；入口已在当前发行版对客人可用 | Chat with Yin is ready now · open Chat with Yin |
| **一次一句**；**不是对话**；**固定句**接住（非聊天气泡里现场生成） | unlock companion · on-device generation · 本机自由聊天 |
| 非临床、无诊断治疗（保留既有免责结构） | 临床评估承诺 |
| 日語段落：**不暗示**日语菜单已开（与 App ja 隐藏一致） | 日语入口已开放 |

公网 HTML 须含 Plan A **safe 短语**（如 `one passing thought`、`not a conversation`、`fixed lines`），使 `npm run check:plan-a-guest-confide-copy` 绿。

## 1. 目标

1. **`privacy.html`**：§AI 说明 + **Thought Drop** 同意段（锚点 `id="thought-drop-consent"`）；删「not open to guests」。  
2. **`wellness.html`**：交叉引用 Thought Drop 段与锚点。  
3. **`slice0-contract.test.js`**：契约断言同步（禁止回退 Chat with Yin 闭客句）。  
4. **日条文**：改为「一念（Thought Drop）」类说明 + 非专业照护免责；**不写**日语 UI 已对客人开放。

## 2. 非目标

- 首页 Hero / Slice 1–2 营销文案  
- `samatia.net` / `twinsology.com` DNS · Pages 手动发布（合并后常规定点）  
- 改 `plan-a-guest-confide-copy-policy.js`（本刀文案自带 safe 短语即可）

## 3. 冲突扫描

对照 **T22** Help、阶段 2 Brief、**Plan A** guest 扫描、Slice 0 法律链。

| 轴 | 判断 |
|---|---|
| **强度** | 法律摘录降预期（非聊天、非诊疗），与 App Help 一致 |
| **语气** | 平静、非推销 |
| **职责** | 摘录页不替代 App 内全文隐私通知 |

无未决冲突（PO 已点头续篇）。

## 变体矩阵

| 变体 | 预期 |
|---|---|
| en `privacy.html` | Thought Drop 开放 + 一次一句 + 固定句 + 免责 |
| en `wellness.html` | 指向 `#thought-drop-consent` |
| ja `privacy.html` 段 | 免责仍在；不声称日语入口已开 |
| Plan A 扫描 | 绿 |
| 375 法律页 | 仍可读、链接可点（无改样式） |

## 点击反馈（0–1 秒）

仅静态链接。Q1/Q2：**不涉及可点击交互**（法律页既有 mailto / 内链不变）。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 外链 bookmark `#confide-consent` | 改为 `#thought-drop-consent`（旧锚废弃；站内只有 wellness 链） |
| 首页未提 Thought Drop | 不变（本刀非目标） |

## 共用机制 / 付款 / 后台网络

**不涉及**。

## 验收

1. `node --test marketing-site/slice0-contract.test.js`  
2. `cd focus-tiger && npm run check:plan-a-guest-confide-copy`  
3. 人工：`privacy.html` ↔ `wellness.html` 互链正确  
4. TRACKER：UI 待人工测试 — 公网法律摘录（部署后 twinsology.com / samatia.net 视现网绑定）

## 参考

- [`NOTICING_ONE_LINE.md`](../NOTICING_ONE_LINE.md)  
- [`task-thought-drop-guest-help-kb-catalog.md`](./task-thought-drop-guest-help-kb-catalog.md) §0.1  
- [`task-marketing-site.md`](./task-marketing-site.md)