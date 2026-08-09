# Five Moments 用户可感表面 · 排期决策（2026-08-09）

> **状态**：产品拍板 · 文档排期（本回合不写运行时）。  
> **触发**：用户确认 — (1) **B 罗盘指南优先安排**；(2) **应用内 Journey Log**（Tea Log 同类本地留痕）可行则排；(3) **A′ 轻量 Moment 感知**须有万全之策（Settings  alone 不够），可行则排。  
> **权威叙事**：`PRODUCT_MOMENTS.md` §5.6（本决策写入）；Hints 产品面仍以 `ONBOARDING_HINTS.md` 为准。

---

## 一、总原则

1. **显性化 ≠ 说明书**：不复活 auto tip 喷洒、不做常驻五点轴、不做顶部「Moment of X」教导 Banner。  
2. **先让人「认出」，再让人「查阅」**：日常靠轻量 Whisper +「?」简介；完整地图放 ⋯/Settings 与可跳过首卡。  
3. **一次一任务**：实现顺序 **B → A′ → D′**（见下）；禁止同一 PR 三线并行改 Hints + 新 Store + 罗盘。  
4. **与空心 Moment 解耦**：Whisper / Journey 对 **尚未存在的主动 Recover / Transition** 可先登记键与文案槽，**运行时不触发**，待对应 Moment 实体合入后再接线（已有 `feature/active-recover-tiger-anchor` worktree）。  
5. **观察式文案**：禁止 Preachy；禁止怀疑语气；见 `EMOTION_BIBLE` 观察式规范。

---

## 二、三项均「可行且应排」——结论

| 代号 | 名称 | 可行性 | 风险 | 排期 |
|---|---|---|---|---|
| **B** | Five Moments Compass（⋯/Settings + 可跳过首卡） | 高 | 低 | **P0 · 下一可开工实现** |
| **A′** | Moment Whisper +「?」简介桥接 | 高（复用既有叠层纪律） | 中低（文案/限频/叠层互斥） | **P1 · B 合入后** |
| **D′** | Journey Log（应用内 · Tea Log 模式） | 高（与 HealthKit **无关**） | 低–中（记账时机/入口位置） | **P2 · A′ 合入后** |

**HealthKit / Health Connect**：仍 **非 v1**（壳期）；**不**在本排期。Journey Log **不是** Health Log 的假名冒充。

---

## 三、A′ 万全之策（替代原「Contextual Banner」）

用户顾虑：不爱开 Settings → 完全懵懂。对策用 **三层发现脊**，缺一不可，但都不做成常驻 Banner：

### Layer 0 — 永远可查（零新 chrome）

- 扩展现有「?」→ `#onboarding-app-purpose`：在简介正文末增加 **1 段** Five Moments 观察式说明（Arrive→Focus→Recover→Transition→Reflect 链名即可）。  
- 次要链：**「The five moments」**（或 i18n 等价）→ 打开与 B **同一份** Compass 内容（Sheet / 内嵌折叠），**不是**喷本页 tips。  
- 理由：用户已学会点「?」；Settings 冷门不再是唯一入口。

### Layer 1 — Moment Whisper（一生一次 / 每 Moment 键一次）

- **形态**：阿寅旁（或贴近角色）一行极淡观察句，**约 3–4s 自动淡出**，可点关；**禁止**顶部常驻条、禁止「Moment of Arrive · …」教导头。  
- **触发**：用户**首次进入**该 Moment 的产品态时（lifetime，`focus-tiger.moment-whispers-seen.v1`）。  
- **Focus**：一生最多 **一次**，极短；之后 Focusing **永久静默**（守「不打扰」）。  
- **互斥**：Arrival / Honesty / Companion / Reflection / 微仪式等叠层打开时 **不**出 Whisper；忙时 suppress。  
- **文案气质示例（EN 方向，定稿进 locales）**：  
  - Arrive: “A soft arriving.”  
  - Focus: “Sitting quietly together.”  
  - Reflect: “A moment to notice what stayed.”  
  - Recover / Transition：槽位预留，实体未上线前不播。

### Layer 2 — B Compass（完整地图 · 自愿）

见任务 B Brief。

### 明确不做（本排期）

- 常驻 5-Dot Compass Bar  
- 每次状态切换都弹 Banner  
- 复活 auto tip 喷洒  
- 把 Rise 标成 Transition（语义仍按 `PRODUCT_MOMENTS`）

---

## 四、D′ Journey Log（为何「类似 Tea Log」可行）

| | Tea Log | Journey Log（本排期） | HealthKit Mindful（非本排期） |
|---|---|---|---|
| 存储 | `tip-jar.v1` → `tipLog[]` | 新 key `journey-log.v1` → `entries[]` | 系统健康库 |
| 平台 | 纯 Web 本地 | 纯 Web 本地 | 需原生壳 |
| 语义 | 打赏留痕 | 有头有尾的正念旅程留痕 | 系统正念分钟 |
| UI | Tip Jar 卡内 | ⋯/抽屉「Journey log」轻面板（或热力图邻接；Brief 定） | 系统 App |

**记账时机（建议锁）**：一场 Focus（或等价计时完成）且用户走完 / 跳过 Reflection 关闭后，若本场曾完成 Arrival（或 Honesty 桥接进 Arrival）则 `arrive: true`；若 Reflection 面板曾打开并关闭（含跳过）则 `reflect: true`。条目示例：`25 min · arrived & reflected`（观察式，i18n）。  
**上限**：与 Tea Log 同级（如最近 30 条）。  
**不算**：主动 Recover / Transition（除非日后产品决定计入；默认 **不**进 Journey，避免与「专注旅程」混淆）。

---

## 五、实现顺序与 Brief

| 序 | Brief | 分支建议 |
|---|---|---|
| 1 | `task-briefs/task-five-moments-compass-b.md` | `feature/five-moments-compass` |
| 2 | `task-briefs/task-five-moments-whisper-a.md` | `feature/five-moments-whisper` |
| 3 | `task-briefs/task-journey-log-d.md` | `feature/journey-log` |

**并行约束**：可与 `feature/active-recover-*` **文档/排期**并存；**实现**勿与 Recover 大 PR 抢同一共享面（Hints UI / locales 大文件）而无姊妹分支同步。

---

## 六、验收与文档义务（各任务收尾）

- `TEST_TRACKER` 新行「待人工测试」  
- 触及 localStorage → `SHARED_RESOURCES.md`  
- 文案 → `locales` + 观察式自检  
- B / A′ 触及引导哲学 → 回写 `PRODUCT_MOMENTS` §5.6 / `ONBOARDING_HINTS` 指针  
- 本地 commit；push 须用户授权 + 旁支 PR（禁直推 develop）
