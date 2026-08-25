# Task Brief · 同坐深练 · 实体周边优先权（账号门槛 · 无钱包）

> **状态（2026-08-24）**：**Phase 0 文档锁** — 可先运营手工名单；产品壳 Phase 1 待 imprint / score 稳定后再排。  
> **接哪里**：增长 / 运营 · **不**进 `FEATURE_CATALOG` · **不**用链上持有证明。

---

## 一句话目标

对达到**明确练习门槛**且已绑定**邮箱 OTP 身份**的核心用户，提供**实体周边优先兑换 / 候补**资格（木念珠、蒲团等）；验证靠 **账号 + 本地/服务端门槛快照**，**不要**钱包、NFT 或 token-gate。

---

## Phase 0（现在可做 · 无代码）

| 项 | 口径 |
|---|---|
| 门槛（建议） | 与 imprint 对齐：例 lifetimeMinutes≥6000 **或** practice score≥84 **或** 已揭示芥子印 Case 2 + 额外 30 天练习；**禁止**「连坐 100 天」对外标题 |
| 身份 | 已有 **邮箱 OTP**（练习备份 / restore 同一套）；未绑邮箱 = 无优先权 + 温和说明 |
| 履约 | 手工：导出 Worker 或本地 support 脚本核对门槛 → 邮件邀请；**不**承诺自动发货 |
| 文案 | 「同坐已久的陪伴者优先」；禁 crypto / NFT |

---

## Phase 1（产品壳 · 待排）

**做**：

1. 设置 / Support 底或 Collections 内 **「周边候补」** 只读状态（Eligible / 已登记 / 未达门槛 + 缺口句）。  
2. 「登记意向」= 写本地 + 可选 opt-in 回传（复用 `monetization-funnel` 同类同意，**新事件名**须 Privacy 明示）。  
3. 单测：门槛边界；未绑邮箱禁用提交并有 0–1s 反馈。

**不做**：

- 应用内商城结账实体（Stripe 实体 SKU 另立项）。  
- Token-gated 壁纸/音效（B 轨）。  
- 链上验证。

---

## 依赖

| 前置 | 说明 |
|---|---|
| `task-practice-imprint-badges` 或稳定 score API | 门槛 SSOT 与 imprint 共用 |
| 邮箱 OTP 备份 | A 轨已合；未绑邮箱须可引导绑定 |

**预估**：Phase 1 ≈ 2–3 人日（只读状态 + 登记表）；不含物流。

---

## 建议分支

`feature/companion-merch-priority`（Phase 1 时）

---

## 后台网络

Phase 0 无。Phase 1 用户点「登记」→ 一次 Worker 写入（须答 `BACKGROUND_NETWORK.md` 三问；**不得**与 Arrival 叠化重叠排队）。
