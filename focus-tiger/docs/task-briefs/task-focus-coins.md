# Task Brief · 同坐点（Focus Coins）

> **状态**：L1 本支待合 · `feature/focus-coins-l1-award`（2026-08-18）。L0 已合 #335。方向锁见 `FOCUS_COINS.md`。  
> **权威**：[`FOCUS_COINS.md`](../FOCUS_COINS.md)（语义 SSOT）· `FREE_PAID_MATRIX.md` A5 · `RISK_MITIGATION_PLAYBOOK.md`  
> **性质**：L1 完成钩子写入钱包（中高风险：Honesty / 完成记账邻接）。**一次只做一个 L 级**。无店、不改场景剧本、不扩备份 6 key。  
> **禁止**：建 entitlement gate key；L0–L2 改 `SCENARIO_TESTS.md`；用余额满足 `isEntitled`。

---

## 0. 一句话

练习入账后发「同坐点」，只能兑换身份/情感锦上添花；买不到 Lifetime ∪ Membership 的进阶能力。对外不叫积分。

---

## 1. 已拍板（勿再开放）

见 `FOCUS_COINS.md` §2 六条：隔离清单 · Honesty 半额日限 1 次 · 连续日只 +3 回声 · 不拦截自动纪念 · 徽章与货币两层同一账本 · 对外名同坐点。

---

## 2. 已好清单（L1+ 开工必守）

- 未达标 Rise **不**入完成、**不**发点。  
- Honesty 补登善意保留；同日再补登仍可记账，但 **不再发点**。  
- 练习徽章只增不减；Tea / Sanctuary `badgeIds` 不因兑点被写入。  
- 莲花池 Slice A（#330）按终身分钟自动开花；不得改成花点才出朵。  
- Sit / Arrival / Honesty 主路径不增加强制商城步。  
- `isEntitled` 行为与无钱包时一致。

**保护面**：场景 A 完成分流、场景 D 桥接、Idle 徽章 chrome、芥子印、莲花池 Slice A、tip↔Sanctuary 零耦合。

---

## 3. 切片（一次一 L）

工作量见 `FOCUS_COINS.md` §9–§10。人天 = 1 名熟悉本仓前端。

| 级 | 分支建议 | 做 | 不做 | 人日 | 验收一句话 |
|---|---|---|---|---|---|
| **L0** | `feature/focus-coins-l0-ledger` | 纯函数：分档发点、封顶、回声、兑换资格、隔离断言 | 不挂 `main.js`、无 UI、不改 localStorage 白名单 | 2–4 | 防刷表单测全绿；未达标/二次 Honesty/`isEntitled` 失败用例锁住 |
| **L1** | `feature/focus-coins-l1-award` | 完成钩子写入钱包；key 进 L-01；flag 可关 | 无店、不改场景剧本、不扩备份 6 key | 4–6 | 达标一场 Stay 见余额涨；未达标为 0；关 flag 无写入 |
| **L2** | `feature/focus-coins-l2-redeem` | 称号 + 稀有章 + ≥1 空间变体；稀缺双门槛 | 新角色序列换装柜 | 4–6（无新美术） | 花点留下只增不减资产；会员/请茶跳不过须弥坐 |
| **L3** | `feature/focus-coins-l3-surface` | 抽屉「同坐点」；装备称号；en/ja；375 | 改场景 D；B 轨 key | 3–5 | 次级入口可忽略；0–1s 按压；不挡主球 |

**Feature flag**：L1 起 `FOCUS_COINS_USER_MOUNT_ENABLED`（或同等）。关 = 完全回到无同坐点正式路径（Playbook 红线 C：禁止半套简化默认）。

**备份**：L1 不把钱包塞进 `PRACTICE_BACKUP_STORE_KEYS`（保持 6 key）。L3 再单独决定 schema v2。

### L1 硬闸（2026-08-18 分析师 · 非口头）

开 `feature/focus-coins-l1-award` **之前**必须在开工回复里写明扫描结果。口头「注意避开 Honesty」**不算过闸**。

1. 扫开放中 PR 与 `origin/develop` 近提交：是否改 `HonestyCheckInController`、`DailyCompletionStore`、`PracticeDaysStore`、`onTimedSessionCompleted` / `recordCompletion`。  
2. **有并行改动** → 停在「待你决定」，不得同时接线发点（防表面无冲突、语义已漂）。  
3. **无** → 写清日期 + 扫了哪些 PR/文件，再开 L1。  

**本 L0 开工时快照（2026-08-18）**：`gh pr list --base develop --state open` 无 Honesty / 完成记账主题 PR（仅 QA seed / dependabot）。此快照 **不能**替代 L1 开工当日的再扫。

**L1 开工扫描（2026-08-18）**：开放 PR 无 Honesty / `DailyCompletionStore` / `PracticeDaysStore` / `recordCompletion` 主题改动。#328 为 QA seed（`qaPracticeSeed` + `main.js` 接线），**未**改上述控制器。`origin/develop` 自 8-15 起这些文件仅版权头 `ba46e25`。硬闸通过。#328 仅作 main.js 合并注意。

---

## 4. L0 必锁单测（不得拖到 L1）

1. 未达标 Rise → 0 点。  
2. Stay 25 分 → 5 点；Across tools 25 分 → 2 点。  
3. Honesty 30 分 → 3 点；同日第二次 Honesty → 0 点（完成仍可记）。  
4. 日时长池 >36 后只停发点。  
5. 昨日无练习 → 无 +3 回声；昨日有 → 今日首笔合格发点 +3。  
6. 被动 Recover 事件 → 0 点。  
7. `redeem` 不得把 `ambient.deep.play` / 任一 `ritual.*.access` 标 entitled。  
8. 须弥坐：缺 360 点或 `lifetimeMinutes < 600` 均失败；entitlement lifetime 不能跳过。

---

## 5. 点击反馈（L3；本 Brief 文档阶段不涉及）

L3 PR 须答：点抽屉「同坐点」后 **0–1 秒内**入口按压 + 面板开始出现（玻璃泡，对齐 Honesty 桥接半透明，禁止厚卡片挡住阿寅）。设计静默（日封顶无 toast、冷却）须挂 `SILENT_BEHAVIORS.md` 新 `SB-xx` 或复用已有「无挫败文案」条。

冲突扫描：见 `FOCUS_COINS.md` §0。

---

## 6. 文档 / 回归（各 L 合入时）

| L | 必更 |
|---|---|
| L0 | `FOCUS_COINS.md` 接线状态；`TEST_TRACKER` 纯后端行 |
| L1 | `SHARED_RESOURCES` key；`localStateKeys`；TRACKER |
| L2 | 目录落地对照；TRACKER UI 行（若有可见兑换） |
| L3 | i18n；`Z_INDEX` 若新叠层；**此时才考虑**场景附录（另开，不夹带改 D） |

自动化：L0–L1 以 unit/smoke 为主。L3 DOM 若做 e2e：**单文件** spec，遵守 `e2e-local-budget`。

人工：L1+ 主路径一场 Stay + 一条回流（Rise 后再坐）；L3 另测 375 抽屉不挡三球。

---

## 7. 明确不做（整包）

- 建 `FEATURE_CATALOG` key 或第三档付费  
- 用点买 Deep Ambient / 仪式 / Seasonal / 多端同步 / Enso / 付费章包  
- 请茶 ↔ 点 互兑  
- 连续日锁 SKU  
- 把自动纪念改成商店货  
- 与桌面智能体、桌面步骤 B 绑一次验收  

---

## 8. 验收（整包，非本 docs PR）

免费用户靠练习涨点、可兑称号/变体/稀有章；会员不能买到须弥坐；关 flag 后主路径与今日 develop 无异。
