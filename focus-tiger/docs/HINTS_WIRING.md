# HINTS_WIRING.md — 场景 → Hint 接线表

创建日期：2026-08-03  
**最后修订**：2026-09-01（Idle 额头一次发现句不进本表 auto 池）
产品语义层级：位于 `PRODUCT_MOMENTS.md` / `ONBOARDING_HINTS.md` 之下、实现 Brief 之上。  
文案、圆点 tier 仍以 **`ONBOARDING_HINTS.md`** 为权威；机器可读 id / 锚点 / `triggerMode` 以 **`src/core/onboardingHintRegistry.js`** 为唯一真源（`hints:doc-sync`）。

> **2026-08-04 运行时政策覆盖本表部分历史行**：`resolveAutoHintIds` / `resolveRemedy*` 仍可存在于 Store（单测/考古），但 `OnboardingHintsUI` **不得**再因 sync / 点「?」铺开 tip。验收与 e2e 以「purpose only + pulse hover」为准。  
> **2026-08-05**：薄荷绿脉冲点**不得**因收窄 tip 喷洒而被删；⋯/抽屉行内 `.ft-secondary-menu-hint-dot` 与音符 `has-hint-mint` 仍按未读绘制。有脉冲的控件须去重原生/自绘悬停文案（见 `ONBOARDING_HINTS.md`）。  
> **2026-08-15**：`focus-hud-*` **例外**——不画浮动 mint 脉冲；悬停金环 / 今日同坐条 / 近日同坐环出 tip（同「?」无脉冲也能悬停出文案）。音符与 ⋯ 行内 mint **仍保留**。  
> **2026-09-01**：冷启动额头白玉句 `IDLE_YIN_TAP_HINT` **不是**本表 `triggerMode: auto` tip，不进 `OnboardingHintsUI` / mint。点额头一次后写入 `idle-yin-tap-hint.v1`。禁止借本条例恢复 auto tip 喷洒。

> **诚实边界（2026-08-03 分析师）**：本文件 + 库存机器块 = **必要条件**，不是充分条件。  
> - **已堵**：registry 新 tip 不登记批次簇 / 不同步库存表 → `docs:check` 失败；PR 模板批次钉。  
> - **格式已用簇 A 真实编辑检验（2026-08-03）** → 可宣称 **接线 SSOT 格式生效**。  
> - **④ 视觉护栏试点已合 develop（PR #93 · 2026-08-03）**：mint RGB + tip 几何 + tip 面板色；tip 软快照本地/opt-in。**≠** 替代人工观感验收。  
> - **④ 扩面暂停观察（2026-08-03 用户拍板）**：暂不扩 linux 软快照基线 / peeked 态 / 更多 hintId——等真实回归或另拍板再开。  
> - **未堵完**：⑤ viewport-context 与 Session chrome 解耦。

---

## 一、为什么要有这张表

仓库已有 registry + `OnboardingHintsStore`，但 Hints 仍易乱，因为：

1. **产品不断加 tip**，若拆成许多「各加一条」小 PR → 宽窄锚点 remap、互斥、与壳层 suppress 容易漂移。  
2. **观感契约**（尖角、mint、peeked/done）比情绪键更脆，一改 Idle 壳就炸。  
3. **场景门闩分散**：`resolveAutoHintIds` / 补救主条 / 窄屏 park 折叠 / 微仪式禁 Sit tip —— 若只改 UI if，难审计。

目标：像场景动画 Dispatcher 一样——**先定接线契约，再一批改、一批验**；禁止无限期「感觉该加一条 tip」。

**不是**：再造一套 coachmark / 集中式教程（仍遵守 `ONBOARDING_HINTS` §三禁令）。

---

## 二、文档分层（勿混）

| 层 | 文件 | 管什么 |
|---|---|---|
| **交互 / 文案 / 圆点语义** | `ONBOARDING_HINTS.md` | tip 文案、tier、触屏键盘、? 补救 UX、存储 |
| **场景接线（本文件）** | `HINTS_WIRING.md` | 时刻 × 候选 id × 互斥 / 门闩 / 宽窄规则 / 批次政策 |
| **机器真源** | `onboardingHintRegistry.js` | id、localeKey、selector、triggerMode、tier、anchorGroup |
| **编排实现** | `OnboardingHintsStore.js` + `OnboardingHintsUI.js` | `resolveAutoHintIds` / `selectExclusiveAutoHintIds` / park remap |

改接线 → 先改本表（或当回合书面确认）→ 再改 Store / UI；改锚点/模式 → registry → `hints:doc-sync`。

---

## 三、全局门闩（强制）

1. **auto 互斥**：同一时刻 **最多 1 条** `triggerMode: auto` 气泡（`selectExclusiveAutoHintIds` + `AUTO_HINT_PRIORITY`）。**click 圆点可并存**。  
2. **叠层忙碌**：Arrival / Honesty 面板 / Reflection / 微仪式 / Celebrating 等 → 按 `resolveAutoHintIds` 收窄；**禁止**在 Sit chrome 已藏时仍出指 Sit 的 tip（微仪式进行中 `ids = []`）。  
3. **无可见锚点 → 不出 tip**：禁止把气泡丢到空白画布（`_positionBubble` 无锚即收）。  
4. **窄屏 park + 抽屉关**：? 补救「更多」折叠为一次性 `narrow-drawer-menu`；**禁止**抽屉未开时尖角乱指抽屉内控件。  
5. **宽屏次要 chrome**：对称用 `wide-more-menu` park（见 Store）。  
6. **Honesty 桥接可见**：自动路径勿叠 micro-ritual / Honesty 入口 tip 挡 Yes/No（入口 suppress 见 `SHARED_RESOURCES` §6）。  
7. **补救不受已读限制**；自动 tip 点关 = `done`。

优先级数字权威在代码 `AUTO_HINT_PRIORITY`（本表只摘要，改权重要改代码 + 单测）。

| 档（约） | 代表 id |
|---|---|
| 100–90 | `help-affordance`、`reflection`、`sit-button` / `rise-button` |
| 85–80 | Arrival beats、`companion-mode`、Honesty 桥接/可选 |
| 70–55 | How shall we sit?、Quick Start、Focus HUD、ambient / 热力图 / 提醒 / 微仪式 |
| ≤50 | Companion 三模式说明条 |

---

## 四、接线总表（按表面）

图例：**自动** = `resolveAutoHintIds` 候选（再经互斥）；**click** = 圆点；**补救主条** = `resolvePrimaryRemedyHintId`；**仅 ?** = manual / catalog。

### 4.1 Idle / 冷启动（**簇 A 已用本表跑通 · 2026-08-03**）

权威实现：`resolveAutoHintIds` / `appendIdleChromeHintIds` / `filterHintsForNarrowDrawer`（`OnboardingHintsStore.js`）。  
簇 A id：`sit-button` · `quick-start` · `how-shall-we-sit` · `honesty-optional` · `idle-after-session`。

| 用户场景 | 候选 hintId（簇 A 加粗） | 方式 | 门闩 / 备注 |
|---|---|---|---|
| 冷 Idle · 从未同坐 | **`sit-button`** + **`how-shall-we-sit`**（+ help / idle chrome） | sit=**auto**；how=**click** | `resolveAutoHintIds` 冷路径同时放入二者；互斥只筛 **auto** → 通常先见 Sit 气泡 |
| ⚡ Quick Start 可见 | **`quick-start`** | click · simple | `quickStartVisible` 时经 `appendIdleChromeHintIds`；补救列表亦可补 |
| Honesty **面板**开 | **`honesty-optional`** | auto | `honestyVisible` → 列表几乎只有它（+ help 规则） |
| Honesty **入口**可见（Idle） | **`honesty-optional`** | auto | `honestyIdleEntryVisible` 时 append；与 Sit 可同批候选 |
| 会话结束后再 Idle | **`idle-after-session`** | click · simple | `hasEverCompletedSession` → 主候选换成本条（**不再**自动塞 sit-button） |
| 微仪式进行中 | — | — | `microRitualOpen` → **空列表**（禁 Sit / idle-after 孤儿 tip） |
| 窄屏 park · 抽屉关 | 去掉 how-shall-we-sit 等抽屉锚 | — | `narrowPark`：`how-shall-we-sit` 属 `DRAWER_PARKED`；**保留 sit-button** |
| 宽屏 ⋯ park | how / honesty 等可 park 到菜单 | — | `WIDE_MORE_PARKED` 含 how-shall-we-sit、honesty-optional |
| 首次空闲见「?」 | `help-affordance`（簇 E） | click · detailed | 非簇 A；常与 Sit **同屏候选**，但不进 **auto** 互斥池（Sit 仍是冷 Idle 的 exclusive auto） |
| 热力图 / 提醒 / 微仪式 / 音乐 | 簇 C | click | 经 idle chrome append；非本簇 |

**Idle 补救主条默认**：`sit-button`（有过完成后可为 `idle-after-session`）。

**簇 A 回归锚（本轮落地）**：单元 `hintsWiringClusterA.test.js`；既有 e2e 宽 `wide-idle-more-menu`（sit / how / quick-start）· 窄/补救 `onboarding-remedy-contract` · 微仪式禁 Sit tip `micro-ritual.spec.js`。

### 4.2 Arrival / Companion

| 用户场景 | 候选 hintId | 方式 | 门闩 / 备注 |
|---|---|---|---|
| Notice | `notice` | auto | Arrival 开 → 补救主条随 phase |
| Breath | `breathing` | auto | |
| Choose | `choose` | auto | |
| Companion 面板 | `companion-mode` + 三模式说明 | auto | 面板展开；点选模式 → done |
| 桥接 Yes/No | `honesty-bridge` | auto（首次）/ 补救 | 桥接可见时禁挡 Yes/No 的入口 tip |

### 4.3 Focusing / Rise / Reflection

| 用户场景 | 候选 hintId | 方式 | 门闩 / 备注 |
|---|---|---|---|
| Focusing | `rise-button` · `ambient-soundscape` · Focus HUD 三条 | rise click；ambient click；HUD **宿主悬停、无脉冲点** | auto 互斥下 rise 优先于 HUD；HUD 悬停绑金环/条/近日环，不画 `.onboarding-hint-badge`。**另**：主动 Recover 幽灵句 `ACTIVE_RECOVER_HINT`（`#active-recover-hint`）**不是**本表 hint，不走互斥/mint 对比护栏；错开与可读见 TRACKER + `DEV_WORKFLOW_QUALITY` §6.20 |
| Reflection | `reflection` | auto | 叠层开时不抢 help-affordance |
| 微仪式进行中 | — | — | **禁止** sit / idle-after-session 等指 Sit tip |

### 4.4 「?」补救主条优先级（摘要）

权威：`resolvePrimaryRemedyHintId`。顺序直觉：Reflection → Focusing(Rise) → Ambient 面板 → Arrival phase → Companion → Honesty 桥接/面板 → 窄屏抽屉开着仍 Sit → Dormant 兼容 → 有过完成 idle-after → 默认 Sit。

---

## 五、批次管理政策（对标动画 Dispatcher）

**原则**：新增 / 大改 hint **默认进一批**（按表面簇），不拆「一 tip 一 PR」除非热修。

| 簇 | 典型 id | 说明 |
|---|---|---|
| **A · Dock / Sit** | sit-button · quick-start · how-shall-we-sit · honesty-optional · **idle-after-session** | 主 CTA；动则双视口 |
| **B · Arrival / Companion** | notice…companion-* | 与门闩、stage 强耦合 |
| **C · Ambient / 次要 chrome** | ambient-*、heatmap、reminder、micro-ritual、narrow/wide menu | park / remap 高风险 |
| **D · Focus HUD / Rise** | focus-hud-*、rise-button | Focusing 表面 |
| **E · Help / 补救** | help-affordance、help-remedy、用途卡 | ? 与 tip 叠层 |

**一批交付最低线**：

1. 本表对应行已更新（或书面「仅修文案不改接线」）。  
2. registry + `hints:doc-sync` + locales。  
3. 宽 **与** 窄至少一条人工或 e2e 锚路径（见 `DEV_WORKFLOW_QUALITY` §8/§9）。  
4. `TEST_TRACKER` 登记；同主题步骤不互斥。  
5. 触及 suppress/hide → visibility 契约 / `test:e2e:visibility` 门禁照旧。

**驳回姿态**：

- 无锚点仍强制出 tip。  
- 抽屉未开尖角指抽屉内。  
- 用 Celebrating / 动画档冒充 onboarding。  
- 朱红 pulse 当 tip 未读（已拍板：tip = 薄荷绿 click 点）。

---

## 六、新增 hint 检查清单

1. [ ] 本表选好 **场景行** 与 **簇**（A–E）。  
2. [ ] `scripts/hints-doc-check.js` 的 `HINT_WIRING_BATCH_CLUSTER` 增加该 id（缺则 CI 红）。  
3. [ ] `onboardingHintRegistry.js`：`triggerMode`（及 click→`tier`）；相邻锚评估 `anchorGroup`。  
4. [ ] `npm run hints:doc-sync`；locales EN/JA（v1.0 ready）。  
5. [ ] 若进 auto：更新或确认 `AUTO_HINT_PRIORITY` / `resolveAutoHintIds`。  
6. [ ] 宽/窄 selector 与 remap（ActionBar / grabber / park）。  
7. [ ] `ONBOARDING_HINTS.md` §一文案行。  
8. [ ] `TEST_TRACKER` + 必要单测；`npm run test:smoke`（含 hints doc-check）。  
9. [ ] PR 描述勾选「Hints 批次簇」（见 `.github/PULL_REQUEST_TEMPLATE.md`）。

---

## 七、文档关系

| 文档 | 关系 |
|---|---|
| `ONBOARDING_HINTS.md` | 交互与文案 SSOT；本表不复述全文案 |
| `RESPONSIVE_LAYOUT.md` | 窄屏互斥 / clamp；本表引用门闩 |
| `SHARED_RESOURCES.md` §6 | 双壳 suppress 与 Honesty 入口 |
| `SCENE_ANIMATION_WIRING.md` | **管理方法论姊妹篇**（一批中央契约）；领域不同 |
| `PRODUCT_MOMENTS.md` | Five Moments；hint 服务引导而非替代 Moment；Moment Whisper（`#moment-whisper`）与 Hint registry **分轨** |
| `PROCESS.md` Backlog | ④ 扩面（观察中，勿默认开工）；⑤ viewport-context |

---

## 八、后续堵复发路径（分析师 · 排期）

| # | 项 | 状态 |
|---|---|---|
| ① | registry ↔ 本表库存机器块 + `HINT_WIRING_BATCH_CLUSTER` 硬闸 | **已落地**（`hints:doc-check` / `docs:check`） |
| ② | PR 模板强制批次簇 / 单 tip 例外说明 | **已落地**（`.github/PULL_REQUEST_TEMPLATE.md`） |
| ③ | 用真实 **簇 A** 跑一遍全流程，验收本表格式是否好用 | **已验证（2026-08-03）**：校正 §4.1 与 `resolveAutoHintIds` 漂移；补 cluster A 单测；宽窄路径指既有 e2e；§五补 idle-after。**可宣称接线表格式已被真实编辑检验**（非视觉快照、非壳层解耦） |
| ④ | 关键 hint 窄宽视觉护栏（尖角几何 / mint 色 / tip 软快照） | **试点已合（PR #93）· 观察中（2026-08-03 拍板）**：保持现状；**暂不**扩 linux 软快照 / peeked / 更多 hintId。触发再开：CI 绿但人眼抓到 tip 形/peeked 坏，或某 id remap 反复漂。观感关单仍人工。 |
| ⑤ | hint 锚点只吃传入 viewport-context，少直接摸壳层状态 | **Brief 已开**：`task-briefs/task-hints-redesign-phase2.md`（试点范围）· Whisper 分轨审计：`task-hints-whisper-boundary-audit.md` |

### 簇 A 试跑清单（③ · 已完成）

1. [x] 库存机器块簇 **A** 行：`sit-button` · `quick-start` · `how-shall-we-sit` · `honesty-optional` · `idle-after-session`。  
2. [x] 对照 §4.1 与 `resolveAutoHintIds` / 窄宽 park（发现并修正初版表过粗）。  
3. [x] 同 PR：§4/§五 +（cluster 映射未改 id 集合）+ 单测回归锚 + TEST_TRACKER；宽窄指既有 e2e。  
4. [x] 本表 §八 ③ 标为已验证。

---

## 八附、库存机器块（CI 硬闸）

<!-- hints-wiring-registry:inventory:begin -->

> **机器块 · 勿手改**。真源：`onboardingHintRegistry.js` + `HINT_WIRING_BATCH_CLUSTER`（`scripts/hints-doc-check.js`）。刷新：`npm run hints:doc-sync`。
> 硬闸：registry 每条 hint 必须出现在本表；新增 tip 须同时改 cluster 映射，否则 `docs:check` 失败。

| hintId | triggerMode | batchCluster |
|---|---|---|
| `dormant-open` | `legacy` | **legacy** |
| `sit-button` | `auto` | **A** |
| `quick-start` | `click` | **A** |
| `how-shall-we-sit` | `click` | **A** |
| `honesty-optional` | `auto` | **A** |
| `honesty-bridge` | `auto` | **B** |
| `notice` | `auto` | **B** |
| `breathing` | `auto` | **B** |
| `choose` | `auto` | **B** |
| `companion-mode` | `auto` | **B** |
| `companion-stay` | `auto` | **B** |
| `companion-away` | `auto` | **B** |
| `companion-across-tools` | `auto` | **B** |
| `ambient-gated` | `click` | **C** |
| `ambient-soundscape` | `click` | **C** |
| `rise-button` | `click` | **D** |
| `reflection` | `auto` | **B** |
| `idle-after-session` | `click` | **A** |
| `weekly-heatmap` | `click` | **C** |
| `language-preference` | `click` | **C** |
| `in-app-reminder` | `click` | **C** |
| `micro-ritual` | `click` | **C** |
| `focus-hud-ring` | `click` | **D** |
| `focus-hud-progress` | `click` | **D** |
| `focus-hud-streak` | `click` | **D** |
| `narrow-drawer-menu` | `manual` | **C** |
| `wide-more-menu` | `manual` | **C** |
| `help-affordance` | `click` | **E** |
| `help-remedy` | `manual` | **E** |
| `help-fallback` | `manual` | **E** |

<!-- hints-wiring-registry:inventory:end -->

---

## 九、变更记录

| 日期 | 说明 |
|---|---|
| 2026-08-03 | 初版：分层、全局门闩、按表面接线摘要、批次簇 A–E、新增清单；用户拍板「合理则办」单独立项 SSOT |
| 2026-08-03 | 分析师跟进：库存机器块硬闸、PR 批次钉、诚实边界与 ③–⑤ 排期；簇 A 试跑清单 |
| 2026-08-03 | **③ 簇 A 全流程验证**：校正 Idle 接线表；`hintsWiringClusterA.test.js`；宣称格式已检验 |
| 2026-08-03 | **④ 视觉护栏试点**：mint/几何/tip 软快照；Brief + e2e；明确不替代人工观感验收 |
| 2026-08-03 | 用户拍板：**保持 ④ 试点观察**——暂不扩 linux 软快照 / peeked / 更多 hintId |

