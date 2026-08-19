# Task Brief · 寅币（Focus Coins）/ Yin's Collections

> **状态**：L3 抽屉 #352+#353 已合 `develop`。挥手点播本旁支接线。花园 vs 珍藏、叠层退役、Collections 商店目录已锁。L0 #335 · L1 #338 · L2 #339 已合（TRACKER 待人工）。方向锁见 `FOCUS_COINS.md`（含 §1.2 已废止提案）。  
> **权威**：[`FOCUS_COINS.md`](../FOCUS_COINS.md)（语义 SSOT）· `FREE_PAID_MATRIX.md` A5 · `RISK_MITIGATION_PLAYBOOK.md`  
> **性质**：C 轨口径修订 + L3 目录过滤（中风险：徽章隔离 / 莲花池不拦截 / Idle chrome）。不改发点数学、不改 Honesty 分档、不扩备份 6 key。  
> **禁止**：建 entitlement gate key；用余额满足 `isEntitled`；Support 三卡样式；常驻 HUD；把叠层 SKU 再摆进抽屉；复活「8 条叠层全列」。

---

## 0. 一句话

练习入账后发「寅币」，只能在 **Yin's Collections** 结缘身份/记忆；买不到 Lifetime ∪ Membership 的进阶能力。对外不叫积分 / Shop。

---

## 1. 已拍板（勿再开放）

见 `FOCUS_COINS.md` §2：隔离清单 · Honesty 半额日限 · 余温回声 · 不拦截花园 · 徽章两层 · 寅币 / Yin's Collections · 叠层退役 · 删除 `emotion.premium.trigger`。

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
| **L2** | `feature/focus-coins-l2-redeem` + `docs/yin-collections-c-track` | 称号 + 稀有章 + 珍藏静物；叠层退役 | 新角色序列换装柜；PNG 叠层 | 已合 + 本支退役叠层 | 花点留下只增不减资产；晨露新兑失败 |
| **L3** | `feature/focus-coins-wave-playback` | **Yin's Collections** 抽屉已合；已结缘挥手点播；en/ja；375 | 改场景 D；B 轨 key；改 PNG；复活 welcomeBack | 本旁支 | 点播 0–1s 按压 + 已入库挥手；欢迎池仍无挥手 |

**Feature flag**：L1 起 `FOCUS_COINS_USER_MOUNT_ENABLED`（或同等）。关 = 完全回到无寅币钱包的正式路径（Playbook 红线 C：禁止半套简化默认）。

**备份**：L1 不把钱包塞进 `PRACTICE_BACKUP_STORE_KEYS`（保持 6 key）。L3 再单独决定 schema v2。

### L1 硬闸（2026-08-18 分析师 · 非口头）

L1 **#338 已合**。本硬闸对后续「再碰 Honesty / 完成记账邻接」仍有效（品味层权重接线、L2 若改 Honesty 时长分档）。

开会碰该邻接的分支 **之前**必须在开工回复里写明扫描结果。口头「注意避开 Honesty」**不算过闸**。

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
8. `title.long-sitter`：缺 360 点或 `lifetimeMinutes < 600` 均失败；entitlement lifetime 不能跳过。  
9. `space.lotus-dew` / `bundle.sumeru-seat` 新兑 → `retired-overlay`。  
10. `FEATURE_CATALOG` 不含 `emotion.premium.trigger`。

---

## 5. 点击反馈（L3；本 Brief 文档阶段不涉及）

L3 PR 须答：点 **Yin's Collections / 阿寅的珍藏** 后 **0–1 秒内**入口按压 + 面板开始淡入（Journey 同族玻璃，禁止厚卡片挡住阿寅）。不足结缘：按压 + 行内缺口句 + toast，**不是**哑点击。设计静默（日封顶无 toast）须挂 `SILENT_BEHAVIORS.md`。

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

人工：L1+ 主路径一场 Stay（产品档最短 **10** 分）+ 一条回流（Rise 后再坐）；L3 另测 375 抽屉不挡三球。

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
