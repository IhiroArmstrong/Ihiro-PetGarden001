# 品味层 × Calm Action · 落地排期表（SSOT）

> **地位**：把防剽窃层答疑、Calm Action 接线、后排三池、权重分叉等产品决策，收成**一条可执行的先后次序**。  
> **不等于** `TASKS.md` 全产品排期——只覆盖本主题扇出。  
> **维护**：拍板新决策或某步关单后，更新对应行的状态与「最后更新」行。  
> **日期**：2026-09-07 · 用户拍板 Recover 第一刀 + 权重表暂不分叉

---

## 一、已拍板（本表前提）

| # | 决策 | 结论 | 生效 |
|---|---|---|---|
| **D1** | Calm Action **第一刀**接哪个表面 | **Recover**（打断回来后 S/M 卡/次屏；**不替换**现网 `ACTIVE_RECOVER` toast） | 2026-09-07 |
| **D2** | Calm Action **第二刀** | **Arrive**（Recover 机制验证通过、关单后**立刻**排，非无限期延后） | 2026-09-07 |
| **D3** | Dispatcher 权重 / Honesty 分档 **生产分叉** | **暂不做**——无具体调参目标时，分叉只增验收成本、防剽窃收益≈0 | 2026-09-07 |
| **D4** | 日签 14→N 与 Calm Action | **分 PR、分池**——禁止把 70 条灌进 Daily Wisdom | 既有硬边界 |
| **D5** | chrome 文案（Sit/Rise/Companion/Arrival HUD 等） | **永远不进**防剽窃 overlay；须离线完整、改句可能动门闩 | 既有 §3 排除 |

---

## 二、总览：五层先后（看这一张就够）

```text
Layer A  已完成管道（#349/#543/#548…）          ✅ 不必回头重做
Layer B  产品硬前置（冷启动审计等）              ⏳ 与 C 并行时可插队，但不挡 C 口令
Layer C  Calm Action 运行时（Recover → Arrive → Reflect）  ▶ Reflect 本旁支
Layer D  Calm Action / Daily Wisdom overlay      ✅ D1 已合 · 📋 Reflect overlay 本旁支
Layer E  后排三池 + 权重分叉                      ⏸ 另口令 · D3 权重分叉冻结
```

**复制测试口径**（`ANTI_PLAGIARISM_LAYER.md` §3.2）：overlay 在、现网仍等于 git 冻表 → 管道≠秘密。D3 冻结期间 **Layer E 权重项一律「管道在、秘密薄」**。

---

## 三、执行排期表（按逻辑次序）

> **列说明**  
> - **序**：全局执行顺序；同序号内仍须 **一次一任务 / 一 PR**。  
> - **门禁**：开工前必须满足。  
> - **口令**：用户口头明确后才写代码（Focus Tiger 纪律）。  
> - **状态**：✅ 已合 / ⏳ 进行中 / 📋 待 Brief / ⏸ 冻结 / 🚫 不做。

### Layer A · 已完成（基线，勿重复立项）

| 序 | 项 | SSOT / PR | 状态 | 备注 |
|---|---|---|---|---|
| A0 | 防剽窃概念 + 准入四问 + §3.1 分叉闸 | `ANTI_PLAGIARISM_LAYER.md` · #542 | ✅ | |
| A1 | 品味层预取管道 `/api/emotion-weight` | #349 · `task-cloud-taste-layer.md` | ✅ | 权重现网仍≈冻表 |
| A2 | Quiet Line 句包 overlay | #543 · `task-quiet-line-copy-overlay.md` | ✅ | EN `DAILY_ZEN_QUOTE_1` 已生产分叉 |
| A3 | YPE V2 + `algorithmVersion` | #545 · `task-ype-v2-secret-transform.md` | ✅ | 生产须「部署」才生效 |
| A4 | Confide 句库 overlay + 在场/boundary EN 分叉 | #548/#550/#551 | ✅ | |
| A5 | Calm Action 70 条 CMS + 四池边界 | `CALM_ACTION_WISDOM.md` · #580 | ✅ | **无运行时** |
| A6 | 值得保护四测入库 | §3.2 · PR #599 口径 | ✅ | 纯文档 |

---

### Layer B · 产品硬前置（可与 C 并行，不替代 C 口令）

> 下列 **不** 因「防剽窃」插队；是 **产品优先级 / 风险收口**。Calm Action Recover **不必**等 B 全关才开工，但 **Arrive 第二刀** 强烈建议等 B1 至少 PO 拍板 gate SSOT（叠层冲突历史最重）。

| 序 | 项 | 用户碰到什么 | Brief / 清单 | 门禁 | 口令 | 状态 |
|---|---|---|---|---|---|---|
| B1 | 冷启动第一幕 11 入口审计 | 首屏叠层 / 吹花 / Compass / Wellness 仲裁 | `task-cold-start-first-scene-audit.md` · `cold-start-first-scene-audit-inventory.md` | 逐条 ok/gap/risk → gap 另 PR | 「开工冷启动第一幕审计」 | 📋 清单草案已出 |
| B2 | 冷启动目标问答 | 首次打开 1 问（blocked） | `task-cold-start-goal-onboarding.md` | **硬前置 B1** | （B1 后另开） | ⏸ blocked |
| B3 | Confide 5173 跟进（茶句复读 / 耳钮叠 HUD 等） | Confide 体验 | TRACKER §6.23 · ISSUE_LEDGER | 回归锁 §7 | 按 Issue 分拆 fix PR | ⏳ 跟进中 |
| B4 | 静思典藏首枚印关单 | 芥子须弥三 case | `CONTEMPLATIVE_ARCHIVE.md` | TRACKER 人工 | （验收口令） | ⏳ 待人工 |

**我认为最合理的并行策略**：B3/B4 与 **C1 Recover** 可并行不同旁支；**C2 Arrive** 应排在 **B1 gate SSOT 拍板之后**（用户 2026-09-07 书面：Arrive 叠层包袱重，不宜作首次机制验证面）。

---

### Layer C · Calm Action 运行时（当前主线）

| 序 | 项 | 落点 | Brief | 门禁 | 口令 | 验收要点 | 状态 |
|---|---|---|---|---|---|---|---|
| **C1** | **Recover 第一刀** | 打断回来后 **追加** S/M 句（卡/次屏）；toast 仍观察式 | `task-briefs/task-calm-action-recover-runtime.md` | `FEATURE_CONFLICT_REVIEW` + `CALM_ACTION_WISDOM.md` §三；禁止替换 `ACTIVE_RECOVER_*` | **「开工 Calm Action Recover」** | Recover 回流路径；慢网；与 Re-focus toast 分池；375 e2e 锁可见句 | ✅ **#625 已合 develop**（TRACKER 待人工） |
| **C2** | **Arrive 第二刀** | Sit 前 / Arrival 欢迎后降门槛 S/M | `task-briefs/task-calm-action-arrive-runtime.md` | **B1 gate SSOT 已拍板**；Arrival 叠层冲突扫描；`overlaySlotArbitration` | **「开工 Calm Action Arrive」** | 不碰 Honesty 补登；Welcome/CapCut/Choose 保护面清单 | ✅ **#665 已合 develop**（TRACKER 待人工） |
| C3 | Focus 标语（可选第三刀） | Focusing 页 **仅 S**、低频 | 另 Brief | 默认安静；禁止会话中轮播 | 另口令 | 频控 + 不比 Recover 吵 | ⏸ 未立项 |
| **C4** | **Reflect 第三场景** | Reflection 卡内、Daily Wisdom 上方 | `task-calm-action-reflect-runtime.md` | C1+C2 已合；分池 Daily Wisdom | **「开工 Calm Action Reflect」** | 不替代 echo / 三问；同日锁 | 📋 **本旁支开工** |
| **C5** | **Transition Moment** | Idle 微入口 + ~10s overlay | `task-calm-action-transition-mvp.md` | overlay 仲裁 + P4 不开 Whisper | **「开工 Calm Action Transition」** | Y-Transition；排除上一条 CAW-T | ✅ **#679 已合 develop**（TRACKER 待人工） |
| **C5.1** | **Compass 改路由** | Transition 芯片 → overlay | 同上 Brief §十 | 与 C5 同路径；**不**开 Whisper | **「开工 Calm Action Transition compass」** | Compass 芯片开 overlay；Work Transition 仍留菜单 | 📋 **本旁支开工** |

**C1 → C2 硬衔接（用户 D2）**：C1 须完成 **§7 Bug 关单口径**（smoke/e2e + TRACKER 人工 + push CI）后，**同一产品线内下一任务即 C2**，不得无限期搁置 Arrive。

---

### Layer D · 内容 overlay（等运行时关单后再做）

> 过 §3.2：**先长内容/运行时，再锁 overlay**。C 关单前 **禁止**为 Calm Action 单独开 overlay PR「防抄」。

| 序 | 项 | 依赖 | Brief 指针 | 口令 | 状态 |
|---|---|---|---|---|---|
| D1 | Calm Action 句包 overlay（Recover+Arrive） | **C1+C2 已合**（#625/#665） | `task-calm-action-copy-overlay.md` | 「开工 Calm Action overlay」 | ✅ **#670 已合**（生产已部署） |
| D1b | Calm Action Reflect overlay 扩面 | **C4 已合**（#672/#674） | `task-calm-action-reflect-overlay.md` | 「同意开工 Reflect overlay」 | ✅ **#675 已合**（生产已部署） |
| D2 | Daily Wisdom 日签 **14→N** | 与 Calm Action **分 PR**；升 `schemaVersion` + 本地兜底 | `task-daily-wisdom-expand.md`（待建） | 「开工日签扩容」 | ⏸ 后排 |
| D3 | Quiet Line §四 8 条候选审定 | 内容审定 + overlay | 扩 `#543` 或 locale | 「开工 Quiet Line 扩句」 | ✅ **2026-09-06 已接线**（schema 2 · 29 键） |

**较弱方案（禁止）**：D2 与 C1 并 PR——Daily Wisdom 与 Calm Action 职责混池。

---

### Layer E · 后排权重池 + 生产分叉（D3 冻结权重分叉）

| 序 | 项 | 用户碰到什么 | 现网 | D3 决策 | 何时做 | 口令 |
|---|---|---|---|---|---|---|
| E1 | 伸懒腰池权重 | Rise 后 60/25/15 动画 | 冻表 + overlay **可**覆盖 | **不分叉** | 有具体调参目标（如 55/30/15）且产品拍板 | 「开工伸懒腰权重 overlay」 |
| E2 | 好奇池权重 | Idle 低概率彩蛋 | 同上 | **不分叉** | 同上 | 「开工好奇池权重 overlay」 |
| E3 | Honesty 分档 | ≤29 点头 / ≥30 金辉 | Dispatcher overlay 层；**不改** `HonestyCheckInController` | **不分叉** | 有 secret 阈值需求 | 「开工 Honesty 分档 overlay」 |
| E4 | YPE V2 阈值 secret 化 | Pack 闭包 | git 锚 0.6/0.4 | 未拍板 | insight 真实消费 + 阈值分叉需求 | 「开工 YPE 阈值分叉」 |

**E 区操作纪律**（若将来做 E1–E3）：① 产品拍板具体数字 → ② **只在 Worker 改** → ③ Redeploy → ④ **禁止**写回 `tasteLayerFreeze`/locale → ⑤ `__tasteLayer.status()` 确认现网≠冻表。

---

### 永久排除（本表不排期）

| 项 | 原因 |
|---|---|
| chrome 文案（`src/locales` Sit/Rise/Companion/Arrival HUD/底栏等） | 语气契约 + 离线必须 + 门闩绑定；见 §一 D5 |
| Confide 路由 / 支付 / 备份 / `aggression_toward_others` | 不算防剽窃 IP 层 |
| 挥手点播（珍藏） | 明确不属于品味层 |
| Calm Action 70 条灌进 Daily Wisdom / Quiet Line | `CALM_ACTION_WISDOM.md` §一硬边界 |

---

## 四、推荐甘特（2026-09-07 起）

```text
周次    主线                          可并行旁支
────    ────                          ──────────
W0      本文档 + C1 Brief 入库         —
W1      C1 Recover runtime PR         B3 Confide fix · B4 典藏验收
W2      C1 人工关单 + §7              B1 审计清单标 ok/gap
W3      C2 Arrive runtime PR          B1 gate SSOT 拍板（Arrive 硬前置）
W4      C2 关单                       D1 Brief 起草（可选）
W5+     口令触发 D2 日签 / D3 QL      E 区仅在有调参目标时
```

**权重分叉（E 区）**：D3 冻结期间 **不占用** W1–W4 主线带宽。

---

## 五、关单检查清单（C 层每一刀）

1. `FEATURE_CONFLICT_REVIEW.md` 扫描已写入 Brief  
2. `npm run test:smoke` + 相关 e2e 绿  
3. TRACKER 行 + `docs/tracker-entries/<branch>.md`  
4. push + CI 绿（§7）  
5. 保护面自检：列「未动 / 必复测邻接」  
6. **C1 关单后**：在 `TASKS.md` 与本表 C2 行改状态 → 排 C2

---

## 六、文档互引

| 文档 | 关系 |
|---|---|
| `ANTI_PLAGIARISM_LAYER.md` §3.2 / §3.2.2 C / §5 / §6 | 四测 · 兑现清单主线依赖 · 口令队列 · 后排池定义 |
| `CALM_ACTION_WISDOM.md` | 70 条 CMS · 四池 · Recover/Arrive 表面 |
| `TASKS.md` §防剽窃层 + §Calm Action | 摘要索引 → **本表 SSOT** |
| `PROCESS.md` 当前进度速览 | 重大关单后补一行 |
| PR #599 / `docs-anti-plagiarism-worth-tests` | 四测入库 tracker |

---

## 七、最后更新

| 字段 | 值 |
|---|---|
| 日期 | 2026-09-09 |
| 拍板 | D1 Recover+Arrive overlay · C4 Reflect 运行时 · Reflect overlay 本旁支 |
| 下一口令 | **Reflect overlay 本旁支** → 后排 Transition / Focus 标语 / D2 日签 |
| develop 对照 | 排期编写时 `origin/develop` tip `6418153e`（若漂移以 git 为准） |
