# Task Brief · Reflection Companion · Shipping（骨架 · 未批准开工）

> **状态（2026-09-17）**：**Brief 骨架** · **不是**开工令 · **无 runtime**  
> **前置**：`task-local-ai-reflection-companion-validation.md`（1C lab · PR #486 · #507）· PO V3 validation 书面结论  
> **政策 SSOT**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` · `LOCAL_AI_SCENARIOS_V1.md` §1 Phase 1C  
> **验收轨 Epic**：[#647](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/647) · **父线 Epic**：[#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639)

**签字**：_待 PO 书面批准 shipping 后填写_

---

## 0. 本 Brief 管什么

| 层 | 文档 | 职责 |
|---|---|---|
| **Validation（已完成 runtime）** | `task-local-ai-reflection-companion-validation.md` | lab `?reflectionCompanion=1` · fail-soft · 危机闸门 · 场景 AL |
| **Shipping（本文）** | 本文件 | 去 lab · 默认路径 · entitlement/Companion 就绪 · 升格 SCENARIO_TESTS · 人工关单 |

**硬规则**

- **Validation approval ≠ shipping approval**（PO 2026-08-28）  
- 本文存在 ≠ 开工；须口令 **「开工 Reflection Companion Shipping」** + PO 书面拍板  
- **禁止**与 Confide mount / Checkout / 1A·1B 同 PR（分轨纪律同 Phase 1 计划）

---

## 1. 产品定位（继承 validation · 不变）

> **Reflection Companion = a second mirror**  
> **≠ AI coach · ≠ therapist · ≠ task list**

用户已完成 Reflection（用户自己看见）→ **可选**主动邀请 Yin 再照见一次。

---

## 2. Shipping 相对 lab 的增量（待 PO 逐条确认）

| # | 增量 | 现网 lab 行为 | Shipping 目标（草案） |
|---|---|---|---|
| S.1 | **去掉 lab query** | `?reflectionCompanion=1` 才出 invite | Electron 宽屏 + Companion entitled + 非低配：末题非空 Continue 后出现 invite（**仍**用户主动点，**禁止**提交后自动 generate） |
| S.2 | **Companion 未就绪 fail-soft** | 已有 `corpus_fallback` / `corpus_safety` | 保持：不得空白挡 Celebrating；`data-source` 仍可见 |
| S.3 | **Entitlement / 付费** | lab 不验付费 | 对齐 Confide：`isCompanionEntitled` 或 PO 另批的 Reflection-only 政策（**待 PO**） |
| S.4 | **Web / 375** | 禁止 generate | **维持** PO Web 不挂载本地 AI；无 invite 或仅确定性 echo 池 |
| S.5 | **文案 / i18n** | 已有 `REFLECTION_COMPANION_*` 键 | 设计师审 invite / observation 语气；升格前须 en+ja 人审 |
| S.6 | **场景 AL → 生产场景** | 场景 AL 标 lab | `SCENARIO_TESTS.md` 升格或新增生产场景行；`TEST_TRACKER` 关单分工明示 |
| S.7 | **ISSUE_LEDGER** | 优化项未跟进 | 关 shipping 时同步 ledger 行「Reflection 给客户用」 |

---

## 3. 明确不做（PO 已锁 · shipping 不得扩 scope）

| 项 | PO |
|---|---|
| Reflection **提交后自动** generate | **否决** |
| RitualFlow 三仪式 / Arrival / Breath / Celebrating / X2 | V4 MUST NOT ENTER |
| Web 浏览器端本地模型 | `LOCAL_AI_WEB_MOUNT_PO_DECISION.md` 暂不立项 |
| 与 CI-02 / 1A Show memory / 1B Presence 同 PR | **禁止** |
| Operating Layer 入口混用 | `LOCAL_AI_OPERATING_LAYER.md` |

---

## 4. 冲突扫描（开工前必填）

对照 `SCENARIO_TESTS.md`：

| 轴 | 邻接 |
|---|---|
| **强度** | 确定性 `reflection-companion-echo` · Celebrating · Reflection CTA 层级 |
| **人设** | `EMOTION_BIBLE` · V5 禁止 coach/diagnose |
| **职责** | Reflection 固定 UI · Confide · Memory 注入 · Daily Wisdom 底栏 |

开工回复须含三轴结论；有疑点 **等待 PO 拍板** 后再写代码。

---

## 5. 验收（Shipping 关单 · 草案）

**环境**：Electron `desktop:dev` · 宽屏 ≥480 · Companion **ready** · **无** `?reflectionCompanion=1`

1. **主路径**：`?product=1&sessionMinutes=1`（+ PO 确认的 entitlement harness）→ Sit 达标 → Reflection 末题非空 Continue → **0–1s** invite → 点 invite → Listening… → observation `data-source=generate`（或 fail-soft corpus）。  
2. **无 entitlement / 未就绪**：仍 fail-soft；Celebrating 不被挡。  
3. **危机**：末题危机语料 → `corpus_safety`；禁止 generate。  
4. **Web / 375**：无 invite；无 generate。  
5. **回流**：第二场会话行为符合 PO 确认的「是否再次 offer」政策（**待 PO**：每场都 offer vs 频控）。

**自动化（最低）**：扩 `reflectionCompanionValidation.test.js` 或新增 shipping 门闩单测（去 lab 后的 `canOffer*` 契约）；e2e 若无法锁 generate，须 TEST_TRACKER 人工锁场景 AL 升格行。

**人工关单**：`TEST_TRACKER`「Reflection Companion Validation」行或新 shipping 行 → 用户书面 + `qa-develop-tip`。

---

## 6. 分 PR 建议（骨架）

| PR | 内容 | 备注 |
|---|---|---|
| 1 | 纯函数：`isReflectionCompanionLabEnabled` → shipping gate；feature flag 或 PO 确认的去 lab 逻辑 | 先单测红绿 |
| 2 | UI：`TigerReflectionMoment` invite 默认路径 + 文案 | 不动 Confide |
| 3 | 文档：`SCENARIO_TESTS` · `TEST_TRACKER` · `LOCAL_AI_PHASE1_TASK_PLAN` §shipping | 与代码同批 |

---

## 7. 开工口令与门禁

| 口令 | 含义 |
|---|---|
| `开工 Reflection Companion Shipping` | PO 已书面批准 §2 表 + §5 验收；可起 PR 1 |

**未满足不得开工**：1C validation 设计师+PO 书面结论 · Companion fail-soft 回归绿 · §4 冲突扫描无开放疑点。

---

## 8. 交叉引用

- Validation Brief：`task-local-ai-reflection-companion-validation.md`  
- 执行计划：`LOCAL_AI_PHASE1_TASK_PLAN.md` §4.3 · §1C.4  
- 场景 AL（lab）：`SCENARIO_TESTS.md`「场景 AL」  
- 代码：`reflectionCompanionValidation.js` · `TigerReflectionMoment.js` · `buildReflectionCompanionPrompt`（`desktop/companion/l2Persona.js`）  
- Epic 切片：见 `planning/task-lines-issue-map.md`「Local AI Phase 1 切片」
