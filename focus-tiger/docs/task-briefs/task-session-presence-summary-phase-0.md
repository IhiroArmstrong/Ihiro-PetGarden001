# Task Brief · T50 会话存在摘要 Phase 0（影子采集）

> **状态（2026-10-23）**：Brief 待 PO 点头后开工。队列登记另走治理 PR（`docs/t50-queue-register`）。  
> **代号**：**T50**。**不是** Presence Signals（`presence-signals.v1`）、**不是**练习观察纸、**不是** YPE、**不是**键盘/跨窗口监控。  
> **类**：**A**（影子 / 审计。用户看不见标签、不改结束句、不改路由/等待）。Phase 1 接结束句是 **B 类**，本 Brief **禁止实现**。  
> **从属**：[`DESIGN.md`](../DESIGN.md) Companion Mode · [`PRACTICE_PAPER.md`](../PRACTICE_PAPER.md) · [`PRINCIPLES.md`](../PRINCIPLES.md) 观照者不贴诊断 · [`RETENTION_FUNNEL.md`](../RETENTION_FUNNEL.md) 本地 `console.log` 模式

## 一句话目标

一场计时同坐结束后，本机压出一份很小的「这一次顺不顺」摘要，只打本地日志（可加独立环缓）。**倒计时照旧。阿寅说话方式本刀不变。** 用来看真实分布，再决定 Phase 1 要不要用规则估计器改结束句分桶。

## 背景

产品要的内核是：阿寅能感到「这一次练习是顺还是挣扎」，而不是再造番茄钟。原提案里的键盘节奏、跨 App 监控、高维向量 **不适合** Web SPA + Electron 壳，也和「陪伴而非监控」冲突。

现网已经有零权限信号：`AttentionSignals`（blur / focus / `visibilitychange`）、三档陪伴模式（此时此地 / 离线空间 / 心流状态）、暂停与提前起身。心流状态会关掉「切走 = 分心」。本刀只把这些 **会话级** 收成摘要，不发明新传感器。

## 范围（in · Phase 0）

1. **会话范围**：只接正式 `FocusSession` 计时同坐（含桌面 Open-ended）。开始 → 内存记事件 → 结束立刻压摘要 → 原始事件丢掉。  
2. **信号（零权限）**  
   - 已有 `AttentionSignals`：离开次数、总离开秒数、最长一次离开（沿用现网 ≥20s 才记一次回来；托盘隐藏 SB-18 不算离开）  
   - `FocusSession`：计划时长、实际时长、暂停次数、是否延长、是否提前结束（`incomplete` Rise）  
   - 本场陪伴模式：`stay` / `stepAway` / `acrossTools`  
3. **摘要结构**（字段名实现时可微调，语义锁死）：

| 字段 | 含义 |
|---|---|
| `companionMode` | 本场声明的模式 |
| `plannedMinutes` | 计划；open 模式写 `null` |
| `actualSeconds` | 墙钟有效时长（扣暂停） |
| `leaveCount` / `leaveTotalSeconds` / `leaveLongestSeconds` | 离开统计（**所有模式都记**，供看分布） |
| `pauseCount` | 暂停次数 |
| `extended` | 是否延长过目标 |
| `endedEarly` | 未达标主动起身 |
| `durationMode` | `fixed` / `open` |

4. **Sink**：`console.log('[SessionPresence]', summary)`，模式对齐 `RetentionTelemetry`。可选独立环缓 `focus-tiger.session-presence-ring.v1`（建议最多 40 条）。须进 `FOCUS_TIGER_LOCAL_STORAGE_KEYS` 与 DEV 重置。  
5. **单测**：persona 表只断言 **摘要数字**（本刀不接标签到 UI）。可附纯函数 `estimateSessionPresence(summary)` **且零消费端**；标签永不渲染。

## 范围（out）

- 键盘、Input Monitoring、Screen Recording、其它窗口内容、高维向量 / ML。  
- Electron `powerMonitor.getSystemIdleTime()`（**Phase 2**）。  
- 改结束句 / Whisper / 句库分桶 / 精灵仲裁 / 下次默认时长（**Phase 1+**；时长 v1 明确不做）。  
- Honesty 补登、微仪式、RitualFlow、呼吸练习平行路径。  
- 观察纸、成长旅程、莲花、今日已练、累计分钟、Journey Log、练习备份、YPE、`presence-signals.v1`、`retention-funnel.v1` 漏斗指标。  
- 用户可见文案出现 SETTLED / DRIFTING / STRUGGLING，或「焦虑 / 分心 / 心流」诊断。  
- 后台网络。Never-Cloud：不上云。

## 禁碰账本

实现时 `git grep` 不得把本摘要写入：

| 禁止写入 | 原因 |
|---|---|
| `focus-tiger.practice-days.v1` | 近日同坐分钟 |
| `focus-tiger.lotus-pond.v1` | 终身分钟 / 花 |
| `focus-tiger.daily-completions.v1` | 今日已练 |
| `focus-tiger.journey-log.v1` | Journey 留痕 |
| `focus-tiger.growth-journey-stage.v1` | 阶段 |
| `focus-tiger.presence-signals.v1` | Arrival / Ritual / Reflection 封闭标签 |
| `focus-tiger.retention-funnel.v1` | 留存漏斗，不是本摘要 |
| `focus-tiger.practice-backup.v1` 云快照白名单 | 本刀不上备份 |
| `focus-tiger.focus-coins.v1` / essence / scoreFormula | 经济与分数 |

新 key 只允许 `focus-tiger.session-presence-ring.v1`（若做环缓）。**禁止**复用 `presence-signals` 这个名字。

## Persona 表（回归合同）

与 `growthPersonaFixtures.js` 同思路：假会话进纯函数。Phase 0 **必锁摘要**；估计器若同 PR 落地则锁标签，且标签不得出 UI。

阈值本刀 **不冻死产品数字**（先看 1–2 周分布）。下表是 **测试夹具意图**，实现可把具体门槛放配置常量，改门槛须改夹具。

| id | 模式 | 种子（意图） | 摘要断言 | 估计器（若同 PR） |
|---|---|---|---|---|
| `stay-settled` | `stay` | 25 分坐满；离开 0–1 次且总离开短；暂停 0 | `endedEarly=false`；`leaveCount` 低 | SETTLED |
| `stay-drifting` | `stay` | 坐满；≥3 次短离开（每次 ≥20s） | `leaveCount≥3` | DRIFTING（不得标焦虑） |
| `stay-struggling` | `stay` | 提前起身，或暂停 ≥3，或前段密集离开 | `endedEarly` 或 `pauseCount≥3` | STRUGGLING |
| `across-tools-busy` | `acrossTools` | 切走很多次但坐满、少暂停 | **仍记录**高 `leaveCount` | **禁止**因离开判 DRIFTING；宜 UNKNOWN 或 SETTLED（只看暂停/提前结束） |
| `step-away-offline` | `stepAway` | 长时间离开（别处练） | 高离开秒数 | 同 across-tools：离开不驱动 DRIFTING |
| `too-short` | 任一 | 实际 &lt; 60s | 仍可写摘要 | UNKNOWN |
| `tray-hide-not-leave` | `stay` | 仅托盘隐藏 | `leaveCount` 不因此 +1（SB-18） | 不得当 DRIFTING |

## 消费端合同（本刀不接线，Phase 1 只准这三处）

Phase 1 若做，**只**作为现有精灵通道仲裁的一个输入，不新建仲裁层：

1. 会话结束姿态 / 轻声选句  
2. 句库分桶：DRIFTING 偏 Arrive / Transition；STRUGGLING 偏 Recover（Five Moments 已有桶）  
3. **下次默认时长：v1 不做**（不当教练）

标签永不展示。文案须诚实：只能判断「在不在本窗口、有没有暂停/提前起身」，**判断不了**别的 App 里是否专注。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

（计时同坐 Web/Electron 同一套摘要；Open-ended 仅桌面已有入口，本刀不新开入口。）

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 用户看不见任何新 UI | 坐、暂停、切走、起身与现网一致 |
| 心流状态频繁切 App | 摘要可记离开；**不得**因此改提醒（现网 `suppressAwayReminders` 保持） |
| DEV 一键重置 | 若有环缓 key，须被清掉 |
| 崩溃/未正常结束 | 不写半截摘要进账本；内存丢即可 |

无付款/已购分支。练习结束路径本身不改可见结果。

## 冲突扫描

相邻：Companion Mode（`DESIGN.md`）· Re-focus / 离开提醒 · 场景 AD 会话结束仍醒着 · 练习观察纸 · Presence Signals（场景 AF）· Open-ended 休眠未接 `powerMonitor`。

| 轴 | 判断 |
|---|---|
| **a. 强度** | Phase 0 不新增打断或更重仪式。被动离开仍不得比主动 Recover 更重（现网已收）。 |
| **b. 语气** | 本刀无新文案。内部禁止用焦虑/心流当用户可见词。 |
| **c. 职责** | 不替代用户声明的陪伴模式；不替代 Presence Signals；不把观察纸做成拓扑。离开统计与 Re-focus **共用同一信号源**，只多写摘要，不抢提醒。 |

无用户可见路径冲突。Phase 1 接结束句须另 Brief + 再扫语气/职责。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

- **后台网络**：不涉及。  
- **受保护路径**：不涉及 Support FAB / 付款 CTA。

## 验收（Phase 0）

- [ ] 一场 Sit 结束，控制台有 `[SessionPresence]` 且含上表字段  
- [ ] 原始离开流不落盘；只有摘要  
- [ ] 上列 persona 单测绿；`across-tools-busy` 高离开不得在估计器里变成 DRIFTING（若估计器同 PR）  
- [ ] `test:smoke` 绿；不改任何用户可见 DOM / 文案 / 结束句  
- [ ] DEV 重置清掉新 key（若做环缓）  
- [ ] `SHARED_RESOURCES.md` 登记新 key 一行（实现 PR，本 Brief PR 可先不改）

## 开工闸

- 队列 **T50** 已由治理 PR 登记。  
- Phase 0 为 **A 类**：PO 点头本 Brief 后，口令「按 T50 Brief 开工」即可写 `src/`。  
- **禁止**同一 PR 改结束句或接精灵仲裁。  
- 实现旁支 **禁止**改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`。
