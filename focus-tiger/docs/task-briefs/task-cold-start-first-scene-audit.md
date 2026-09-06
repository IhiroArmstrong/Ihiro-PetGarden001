# Task Brief · 冷启动第一幕 11 入口分散仲裁审计

> **状态（2026-09-06）**：**approved · 待开工** — 产品已拍板为本任务独立先行；是 `task-cold-start-goal-onboarding.md` 的**硬前置**。  
> **本文件无运行时**（审计阶段只读排查 + 文档收口；修复须另开 `fix/*` PR）。

## 一句话

把冷启动第一幕所有「抢第一眼 / 抢第一情绪 / 抢第一张卡」的入口列成一张可核对总表，标出仲裁归属、优先级、已知缺口与回归锚；收口后才允许叠加新 gate（含目标问答）。

## 背景

`DEV_WORKFLOW_QUALITY.md` §6.17 已落地 `spriteChannelArbitration.js`，吸收 #341/#347 部分规则，但冷启动仍有多层并行决策：

| 层 | 模块 | 管什么 |
|---|---|---|
| A · 精灵通道 | `spriteChannelArbitration.resolveBootSpriteOccupancy` | 第一帧 Yin 播什么（睡/欢迎/吹花/致谢/Idle） |
| B · 叠层首卡 | `FIRST_CARD_DEFER_PRIORITY` + `scheduleFirstCardOffers` | 第一张 growth/hint 卡（吹花气泡 / Compass / wellness） |
| C · 并行发现 | `idleYinTapHintGate`、提醒横幅、Onboarding auto hints | 与首卡并行或延迟出现的提示 |

历史上 §6.9（欢迎+深夜茶/哈欠同 tick）、§6.10（欢迎+鹦鹉信使）、§6.7（开场即睡）均源于**多入口各判、无总表**。

## 范围

### 做

1. 核对并维护 **`cold-start-first-scene-audit-inventory.md`**（11 核心入口 + 观察卫星项）。
2. 逐条标注：代码入口、仲裁 owner、优先级、localStorage 门闩、SCENARIO_TESTS / TEST_TRACKER 回归锚、审计状态（`ok` / `gap` / `risk`）。
3. 产出**收口结论**：gate 顺序 SSOT 一段文字 + 是否允许新入口及建议插入 tier。
4. 列出须另开 fix PR 的 gap（本 Brief **不**顺手改运行时）。

### 不做

- 不实现冷启动目标问答（另 Brief）。
- 不重写 `main.js` 冷启动路径（除非用户另口令开工 fix PR）。
- 不碰 Practice Identity 运行时。

## 11 核心入口（索引）

完整字段见 `cold-start-first-scene-audit-inventory.md`。

| ID | 名称 | 层 |
|---|---|---|
| E01 | Checkout 付款回跳致谢 | A 精灵 |
| E02 | 吹花欢迎情绪（Day1 / ≥3 日） | A 精灵 |
| E03 | Wellness 清晨苏醒仪式 | A 精灵 |
| E04 | Wellness 深夜披毯进睡 | A 精灵 |
| E05 | 欢迎池（魔法书 / 点头） | A 精灵 |
| E06 | Expand A 深夜 Idle→DORMANT | A 精灵 |
| E07 | 默认 Idle 闭目坐禅 | A 精灵 |
| E08 | 吹花欢迎白玉气泡 | B 叠层 |
| E09 | Five Moments Compass 首卡 | B 叠层 |
| E10 | Wellness 免责首卡（`?wellnessFirst=1`） | B 叠层 |
| E11 | 额头摸头发现提示 | C 并行 |

**观察卫星**（不计入 11，但审计须记录互斥）：E12 应用内提醒横幅+鹦鹉、E13 Onboarding auto hints、E14 Purpose/Privacy 卡。

## 验收标准

- [ ] `cold-start-first-scene-audit-inventory.md` 11 行均有：owner / 门闩 key / 优先级 / 测试锚 / 状态。
- [ ] 每条 `gap` 或 `risk` 有对应 SCENARIO_TESTS 场景或 TEST_TRACKER 行引用（或写明「无锚 · 须补」）。
- [ ] 产出「gate 顺序 SSOT」小节写入清单文首（或 `DEV_WORKFLOW_QUALITY.md` §6.17 补表 — 须用户确认后二选一）。
- [ ] 收口结论明确：`task-cold-start-goal-onboarding.md` 是否解除 blocked。
- [ ] 无代码改动，或若有文档 typo 修正须同批说明。

## 建议执行顺序

1. **只读走读**（本回合草案已完成 inventory 初稿）→ 人工对照 `?product=1` 清库冷启动。
2. **标状态**：每条 E01–E11 标 `ok` / `gap` / `risk`。
3. **gap 扇出**：每条 `gap` 开独立 fix Brief（禁止与大功能混 PR）。
4. **拍板收口**：PO 确认 gate 顺序 SSOT → 更新 goal-onboarding Brief 依赖为可开工。

## 冲突扫描

对照 `SCENARIO_TESTS.md` **场景 AD**（精灵占用）、**场景 V**（吹花欢迎）、wellness 免责、开场即睡 TRACKER 行。本任务为文档审计，Q1–Q3 写「无用户路径变更」。

## 风险

- 审计只锁文档不补测试 → 假收口。每条 `ok` 须有测试锚或明确「人工-only + TRACKER 行」。
- 把卫星项（E12–E14）误并入 11 导致范围膨胀 — 卫星只记互斥，不阻塞 goal-onboarding 解除 blocked（除非发现硬冲突）。
