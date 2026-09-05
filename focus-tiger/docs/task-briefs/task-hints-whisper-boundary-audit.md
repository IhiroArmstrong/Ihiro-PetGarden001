# Task Brief · Hints × Whisper × ? 简介 · 边界审计

> **状态（2026-09-06）**：**Brief 已开 · 不写代码**（与 `task-hints-redesign-phase2.md` 同批 PO 口令；实现仍 **一次一任务**）。  
> **父决策**：`task-five-moments-surface-plan.md` §三「万全之策」三层发现脊。  
> **已合运行时**：B Compass **#201** · A′ Whisper **#203** · D′ Journey Log **#205**。

---

## 一句话目标

对照 Five Moments 表面计划，把 **Moment Whisper**（一生一次淡出观察句）、**Hints 薄荷绿脉冲 tip**、**? 产品简介卡** 三条用户可感通路的 **职责边界、叠层互斥、存储键、验收 gap** 写成可执行清单——防止再设计 Hints 时误伤 Whisper，或借 Whisper 复活已取消的 hint 喷洒。

---

## 三轨对照（SSOT 摘要）

| 轨道 | DOM / 键 | 触发 | 寿命 | 文案气质 | 权威 |
|---|---|---|---|---|---|
| **Whisper** | `#moment-whisper` · `focus-tiger.moment-whispers-seen.v1` | 首次进入 Moment 产品态（arrive/focus/reflect；recover/transition 槽位预留） | 每 Moment 键 **一生一次**；约 3–4s 淡出 | 极淡观察句；**无**「Moment of X」教导头 | `task-five-moments-whisper-a.md` |
| **Hints 脉冲 tip** | hint registry · `focus-tiger.hints-seen.v1` | 悬停薄荷绿脉冲（或 HUD 宿主悬停） | peeked / done；**非**一生一次全局 | 控件级微提示；移开即收 | `ONBOARDING_HINTS.md` · `HINTS_WIRING.md` |
| **? 简介** | `#onboarding-app-purpose` | 点/悬停 `help-affordance` | 每次可查；非 tip 喷洒 | 产品是什么 + Five Moments 段 + Compass 次要链 | `ONBOARDING_HINTS.md` §产品面 |

**硬边界**：Whisper **不是** `triggerMode: auto` hint；? **禁止**同屏喷 registry tips。

---

## 已好清单（#203 合入后须守住）

1. Whisper：**非**顶部 Banner；阿寅旁一行；可点关；Focusing 第二次会话 **永久静默**。  
2. Whisper **互斥**：Arrival / Honesty / Companion / Reflection / Celebrating / postSession overlay busy → **不出**。  
3. ? purpose 含 Moments 观察段；可打开与 B **同一份** Compass（Sheet），**不是**喷 tips。  
4. Hints 产品面仍只有脉冲悬停 + ? 简介（2026-08-04 收窄）。  
5. `recover` / `transition` Whisper 键已登记，**主动 Recover / Transition 未上线前永不 play**。

---

## Gap 清单（本 Brief 产出 · 待实现/待测勾选）

### G1 · 文档与验收

| # | Gap | 现状 | 建议动作 |
|---|---|---|---|
| G1.1 | TEST_TRACKER 无独立「Whisper 三 Moment」关单行（与 Hint 行混谈） | `task-five-moments-whisper-a.md` 有步骤，tracker 分散 | 补一行或扩 Five Moments 族；分列 arrive/focus/reflect |
| G1.2 | ? → Compass 链与 purpose 文案回归 | B #201 已合 | 再设计前跑一遍 e2e + 人工 ? 指错锚历史（L714） |
| G1.3 | `ONBOARDING_HINTS` 与 `PRODUCT_MOMENTS` §5.6 指针一致性 | 已有指针 | 再设计改文案时强制交叉读 |

### G2 · 运行时互斥（须人工 + 单测锁）

| # | Gap | 风险 | 验证 |
|---|---|---|---|
| G2.1 | Arrival 开着时 Whisper 是否绝对 suppress | 叠层吵 | Sit→Arrival 首次应只出 arrive whisper **或** 被 busy 压住——须与产品意图一致并写死 |
| G2.2 | Honesty 呼吸/桥接 vs Whisper | 与 Hint 历史 bug 同族 | Honesty busy 不出 whisper；不出 idle-after hint 指虚空 |
| G2.3 | postSession / 芥子印 / Compass 首卡 vs Whisper | overlay 仲裁 | 对照 `overlaySlotArbitration` C1–C3 矩阵 |
| G2.4 | Focusing 第二次无 Whisper | 已规格 | 清 whispers seen → 两场 Focusing 只第一场 |

### G3 · 存储与职责

| # | Gap | 说明 |
|---|---|---|
| G3.1 | `moment-whispers-seen.v1` vs `hints-seen.v1` | 禁止合并；`SHARED_RESOURCES` 已分键 |
| G3.2 | Journey Log 记账 vs Whisper | Journey 是留痕面板；Whisper 是发现句；勿混文案 |
| G3.3 | Confide / Yin Memory 无 Whisper | 倾诉叠层不出 Five Moments whisper |

### G4 · 再设计耦合风险（交 `task-hints-redesign-phase2.md`）

| # | 风险 | 缓解 |
|---|---|---|
| G4.1 | 再设计 ? 时误恢复 tip 喷洒 | PR 模板 Q1–Q3 + 本表 G1.2 |
| G4.2 | weekly tip 尖角修进 Whisper 组件 | 禁止；尖角属 Hints 簇 |
| G4.3 | viewport-context 试点未含 `momentWhispersGate` busy 输入 | slice0 derive 须读同 busy 源 |

---

## 建议人工验收脚本（develop tip · 约 15 分钟）

**前置**：Electron 或 `?product=1` 宽屏；清 `focus-tiger.moment-whispers-seen.v1` 与 `focus-tiger.hints-seen.v1`（或实验室重置）。

1. **Whisper arrive**：冷启动 → Sit → Arrival Notice 可见时 → 见一行淡观察句 → 3–4s 消失；再走一遍 **不再出**。  
2. **Whisper focus**：完成 Arrival → Focusing 首次 → 见 focus 句一次；**第二场 Focusing 不出**。  
3. **Whisper reflect**：达标 → Reflection 打开首次 → 见 reflect 句；Skip all 后再开仍遵守 seen。  
4. **? 简介**：Idle 点 ? → **只有** purpose 卡；可开 Compass；**无** mint tip 喷洒。  
5. **Hints 脉冲**：悬停 Sit 脉冲（若有）→ tip → 移开即收；与 Whisper **不同 DOM**。  
6. **互斥 spot-check**：Arrival 开着点 ? → 不应叠 Whisper + 一堆 hints；Honesty 呼吸中同理。  
7. **375**：Whisper 不挡三主钮；? 仍可开 purpose。

失败项记入 TEST_TRACKER 对应行；**禁止**用 Whisper 修 Hints 尖角。

---

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **强度** | Whisper 极轻；Hints 悬停非模态；? 简介可关——三者不应叠成教程墙 |
| **人设** | 三轨均观察式；禁止 Preachy |
| **职责** | Whisper = 认 Moment；Hints = 认控件；? = 认产品 |

**无冲突**（审计文档）；实现 gap _closure 逐条扫。

---

## 实现口令（拍板后）

- 「开工 Whisper tracker 关单」→ 只补 G1.1 + 人工脚本  
- 「开工 Whisper busy 回归锁」→ G2.x 单测/e2e  
- 不与 `task-hints-redesign-phase2` 序 3 同 PR

---

## ❌ 本 Brief 明确不做

- 改 Whisper 文案大表（除非 PO 另口令）  
- 接 active Recover / Transition 实体（槽位仍预留）  
- 恢复 ? 补救喷洒  
- 把 Compass 首卡改成 Hint auto

---

## 文档义务

- `task-five-moments-surface-plan.md` §三 加本 Brief 指针  
- `HINTS_WIRING.md` 一句：Whisper 分轨审计见本文件  
- `TEST_TRACKER`：Whisper 关单行（或 Five Moments 族扩展）  
- `SHARED_RESOURCES.md`：确认 whispers seen 键（若缺则补）
