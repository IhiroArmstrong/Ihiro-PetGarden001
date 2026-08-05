# LOGGED_NOT_FIXED_AUDIT.md — 「记入 ≠ 开修」盘点

创建日期：2026-08-05  
权威路径：`focus-tiger/docs/LOGGED_NOT_FIXED_AUDIT.md`  
盘点基线：本地 `develop` @ **`8867b3c`**（与当时 `origin/develop` 对齐检查以本机为准）  
性质：**只读审计**——不改运行时；**不改**被引用的原文档（`TEST_TRACKER` / `*_WIRING` / `DEVELOP_DEBT_INVENTORY` 等）。

---

## 0. 目的与范围

团队惯常模式：发现问题后记入验收/观察文档，并明确写「暂不修 / 可保留观察 / 先不修 / 已放弃 / 停接线 / 不挡 merge」等——**记入本身不启动修复**。本文件把这类条目收成一张可决策表，回答：**哪些其实该排进下一批修复**。

### 纳入标准（须同时满足）

1. 在权威文档（或明确 defer 的 commit / PR 描述）中有可追溯原文；  
2. 带有**明确搁置/观察/放弃/不挡合并/Backlog 暂不**口径，或 EDGE_CASES 式 **P1「先不修」/ P2「不主动开修」**且**未找到对应专修 commit**；  
3. 问题/缺口本身**仍未按该条目闭环**（未关单为「已修好且跟进完成」，或产品仍写「未接线 / 空实现 / 暂不扩」）。

### 明确排除（避免与债务清单重复劳动）

| 排除类 | 理由 | 去哪看 |
|---|---|---|
| 开放「有问题」且**正在走查 / 待复测 / 未写不修** | 属修复队列，不是「明确不修」 | `TEST_TRACKER` + `KNOWN_RISKY_TEST_CHECKLIST` |
| `DEVELOP_DEBT` 的 assumed-ok / verified 全表 | 那是验证置信度，不是 defer 决策 | `DEVELOP_DEBT_INVENTORY.md` |
| 已事后开修并关单的历史「记入≠开修」案例 | 作模式警示即可，不进开放表 | 例：2026-08-01 ⋯ 脉冲误绑 → 08-02 已修（见 `TEST_TRACKER` 薄荷绿行根因叙述） |
| 纯排期 Backlog 且从未当缺陷记入（如 Family Edition 远期） | 产品立项空白，非「发现后搁置」 | `PROCESS.md` Backlog；表中仅保留 **PRODUCT_MOMENTS 已点名优先级** 的空白 |

### 与 `DEVELOP_DEBT_INVENTORY` 交叉

债务清单答「验证置信度」；本文件答「**明确决定过不修/观察**的条目是否该重排」。重叠处以本表「出处」互链；**不复制**整份 known-risky 走查清单。

### 评分（1–3，3 最高）

| 维度 | 含义 |
|---|---|
| **频率** | 用户/测试撞见该问题的概率 |
| **严重度** | 违和感 → 功能损坏 / 数据错误 / 红线体验 |
| **修复成本** | 改动越小分**越高**（局部小改 = 3；架构/新品 = 1） |
| **搁置趋势** | 拖久了会不会更难修（会 → 高分） |

**总分** = 四项之和（满分 12）。

**建议列规则**：

- 总分 **≥ 9** → **进入下一批修复**  
- 总分 **≤ 5** → **继续观察**  
- **6–8** → **需要人工判断**（表内简述为何难判）

> 分数是排期启发式，**不是**自动开工授权。产品空白（如主动 Recover）即使 ≥9，仍须 Brief + 拍板。

---

## 1. 主表（按总分降序）

| # | 问题描述（摘录） | 出处 | 不修理由 | 涉及模块 | 频率 | 严重度 | 修复成本 | 搁置趋势 | 总分 | 建议 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `completionPending` 时 Sit `return false`，按钮未禁用 →「点了没反应」 | `EDGE_CASES.md` P1 #5（2026-07-22「先不修」）；`DEVELOP_DEBT` / `KNOWN_RISKY` #10；回归锁红线 | 批次 4–5 候选；等 1–3 验收后再排 | `main.js` FocusInput · `SessionUiGate` | 2 | 3 | 3 | 3 | **11** | **进入下一批修复** |
| 2 | Hints 尖角/补救/weekly tip 等「问题很多」→ 整体再设计；暂缓单点硬修 | `TEST_TRACKER`「? 补救」行（2026-08-04，严重度 `post-v1`）；`KNOWN_RISKY` #5 步5 / #7；`HINTS_WIRING` | 产品方向再设计；v1 不挡合 main | `OnboardingHints*` · `HINTS_WIRING.md` | 3 | 2 | 1 | 3 | **9** | **进入下一批修复**（须产品 Brief，非整行小补丁） |
| 3 | `playEmotion` 返回值常忽略；hold/强情绪 key 散落；新情绪漏登记难查 | `EDGE_CASES` P1 #17–19；`DEVELOP_DEBT` / `KNOWN_RISKY` #15「暂不处理（观察）」 | 工程观察；非产品走查主项 | `EmotionController.js` · 多调用方 | 2 | 2 | 2 | 3 | **9** | **进入下一批修复**（warn/契约小步即可） |
| 4 | Visibility 契约 `gap-*` 未全锁；改 suppress 易只绿一侧视口 | `DEVELOP_DEBT` known-risky；`SHARED_RESOURCES` §6 / `DOC_CODE_CONTRACT` V-gap；`KNOWN_RISKY` #11 | 建议「补测试」但长期未收口（无专修 commit） | `visibilityContractRegistry.js` · visibility e2e | 2 | 2 | 2 | 3 | **9** | **进入下一批修复** |
| 5 | `SessionComplete` 非模态观察式文案尚未实现（情绪/分流已有） | `PROCESS.md` 进度速览；`DEVELOP_DEBT` assumed-ok「产品拍板或暂不处理」；`PRODUCT_MOMENTS` Reflect 邻接 | 功能半截但静默；未立项开修 | 完成反馈 UI · locales | 2 | 2 | 3 | 2 | **9** | **进入下一批修复** |
| 6 | 主动 Recover 入口空白（被动 Re-focus 已有） | `PRODUCT_MOMENTS.md` §Recover；`DEVELOP_DEBT` §5；`EMOTION_BIBLE` Recover 边界 | 产品空白未接线；叙事点名「使用频率最高」却未排期 | 新入口 · 呼吸引导复用 | 3 | 3 | 1 | 2 | **9** | **进入下一批修复**（新品：先 Brief） |
| 7 | 提醒软提示缺口：`practiced_today_note` 未见；无「已保存」确认；hints 重叠 | `TEST_TRACKER` 提醒 UI 行（2026-07-25 夜书面）；P0 表 L242「**不挡** P0 / **不挡** merge」 | 明确不挡当轮 P0/PR#2 merge | `ReminderPreferenceUI` · InAppReminder* | 2 | 2 | 2 | 2 | **8** | **需要人工判断**：软文案债 vs 提醒主路径已大体 OK；是否并进提醒走查周 |
| 8 | Ambient 静音后再点为「重播」非「续播」——历史项「可保留观察」 | `TEST_TRACKER` 右上音符行（2026-08-04）；`DEVELOP_DEBT` Ambient 簇 | 未再测可保留观察；非当轮必关 | `AmbientSoundscape*` | 2 | 2 | 2 | 2 | **8** | **需要人工判断**：听感契约是否仍要「续播」产品承诺 |
| 9 | 非法 `companionMode` 静默 coerce 为 `stay` | `EDGE_CASES` P1 #8 | 批次 4–5；建议改 warn，未开修 | `FocusSession.start` | 1 | 2 | 3 | 2 | **8** | **需要人工判断**：真实脏数据概率低，但与门闩族相邻 |
| 10 | Re-focus 先占名额再因强情绪/额度静默 | `EDGE_CASES` P1 #9 | 「有意设计」；可补用户可感知说明，先不修 | `MindfulReminderController` | 2 | 2 | 2 | 2 | **8** | **需要人工判断**：改 UX 说明 vs 保持静默让位原则 |
| 11 | `main.js` 完成路径 / `pendingAutoStart*` 闭包；多 writer 历史 | `EDGE_CASES` P1 #20–23；`DEVELOP_DEBT` / `KNOWN_RISKY` #16「大重构暂不处理」 | 可顺带收口；大重构暂不处理 | `main.js` · `SessionEndFlow` | 2 | 2 | 1 | 3 | **8** | **需要人工判断**：风险高但成本像大手术——先走查异常回流再决定是否拆小 PR |
| 12 | Emotion `!started` / `smiling` 无 sprite 静默；Mood IDLE 对 hold 静默 return | `EDGE_CASES` P1 #14–16 | 批次 4–5；warn 不统一 | `EmotionController` · `MoodController` | 2 | 2 | 2 | 2 | **8** | **需要人工判断**：与 #3 可合并为「情绪可观测性」一小包 |
| 13 | Storage / Store `catch` 无 warn；非法分钟 `return null` | `EDGE_CASES` P1 #11–13 | 隐私模式合理；缺可观测性；先不修 | `Storage.js` · 各 Store | 1 | 2 | 3 | 2 | **8** | **需要人工判断**：工程卫生 vs 用户不可见 |
| 14 | Grow / `Milestone.js` 等 TODO 脚手架与 `MilestoneGlowStore` 两套叙事并存 | `DEVELOP_DEBT` / `KNOWN_RISKY` #17「暂不处理（Backlog）」 | 纪念奖励未完整产品化；勿当缺陷开修脚手架 | `Milestone.js` · `RewardToast.js` | 1 | 2 | 3 | 2 | **8** | **需要人工判断**：最小动作可以是文档标「脚手架」/删误导 TODO，不必做完整 Grow |
| 15 | 窄屏 Sit options / How 脉冲指引「维持现状、其它方面延迟」 | `KNOWN_RISKY` #1 步8（2026-08-04 用户书面）；`DEVELOP_DEBT` Idle chrome verified 注 | 产品延期；不按缺陷开修 | OnboardingHints · 窄壳 | 2 | 2 | 1 | 2 | **7** | **需要人工判断**：已并入 Hints 再设计（#2）；单独开修易与收窄契约冲突 |
| 16 | `welcomeBack` / 挥手新旧**暂时停接线**（空实现；池不含挥手） | `TEST_TRACKER` welcomeBack 行（2026-08-02 拍板）；`SCENE_ANIMATION_WIRING`；`EMOTION_BIBLE`；`KNOWN_RISKY` #12 步4 | 开场观感不行 → 停接线、以后另议 | `EmotionController.welcomeBack` · Dispatcher | 1 | 1 | 2 | 2 | **6** | **需要人工判断**：生命感叙事 vs 已验收欢迎池；重接易再闪/抢排期 |
| 17 | Day1 / 久别吹花鼓励：策略 C 已拍板，产品**未接线**（Lab 已入库） | `SCENE_ANIMATION_WIRING`（2026-08-05）；`FLOWER_BLOW_WELCOME_DESIGN.md`；`TEST_TRACKER` 变花吹散行；commit `8d8905b` / PR #124 | Phase 1 Lab；产品未开工 | `conjureFlowersBlowAway` · Dispatcher | 1 | 1 | 2 | 2 | **6** | **需要人工判断**：素材已备，差产品接线 Brief |
| 18 | Transition 完全未设计/未接线 | `PRODUCT_MOMENTS.md`；`DEVELOP_DEBT` §5 | 产品空白 | — | 2 | 2 | 1 | 1 | **6** | **需要人工判断**：战略优先级低于主动 Recover |
| 19 | Focus Confidence V1（完整 idle/分值）未实现；仅 Re-focus 最小切片 | `PROCESS.md`；`DEVELOP_DEBT` unknown；`EMOTION_BIBLE` | 明确范围外 / 暂不处理 | `AttentionSignals.js` | 1 | 2 | 1 | 2 | **6** | **需要人工判断**：叙事易混「半成品」；对外是否要更醒目标注 |
| 20 | EyeTracking 实时瞳孔跟随：**已放弃** | `TEST_TRACKER`；`EMOTION_BIBLE`；`CORE_LOOP`；2026-07-22 降级 | 实测错位；已决定放弃 | 已废弃 pupil 叠层 | 1 | 1 | 3 | 1 | **6** | **需要人工判断**：保持放弃即可；仅防误排期返工 |
| 21 | IncenseComplete 业务会话结束**未接线** →「已放弃/不适用」 | `TEST_TRACKER`（2026-07-25 拍板）；`DEVELOP_DEBT` | 退出验收队列；保留调试预览给 Backlog | `IncenseGreeting.js` | 1 | 1 | 2 | 1 | **5** | **继续观察** |
| 22 | Pointer 抚摸/轻点/绕圈：检测已接线、**无正式精灵** → 不挡合并 | `TEST_TRACKER`（2026-07-25）；`DEVELOP_DEBT` unknown | 产品壳不排视觉验收 | `PointerInteraction.js` | 1 | 1 | 2 | 1 | **5** | **继续观察** |
| 23 | `lookAtCursor` / `snoringZZZ` 等仅调试/占位 → 不挡合并 | `TEST_TRACKER`（2026-07-22）；`PROCESS` 合并前清理 | 产品壳不可见 | `#emotion-debug-ui` | 1 | 1 | 3 | 1 | **5** | **继续观察** |
| 24 | Hints 视觉护栏④：**保持试点观察**——暂不扩 linux 软快照 / peeked / 更多 hintId | `HINTS_WIRING.md`；`TEST_TRACKER` 护栏行；PR **#95** / commit `1b64406` · `8e2329b` | 用户书面「保持观察」；等真实回归或另拍板 | e2e `hints-visual-guardrail` | 1 | 1 | 2 | 1 | **5** | **继续观察** |
| 25 | Honesty `dormantWake`：**暂不接**闭眼呼吸淡入 / halo / 金光 | `EMOTION_BIBLE`；`PROCESS` 进度 | 明确暂不接奖励光效 | Honesty 睡醒路径 | 1 | 1 | 2 | 1 | **5** | **继续观察** |
| 26 | 轻完成池撤 `curiousTilt`：代码已撤；人工「须以后慢慢碰概率」（暂不关单） | `TEST_TRACKER`；`PROCESS` CapCut 条；PR #102 | 概率观感延后；非缺陷开修 | Dispatcher 轻完成池 | 1 | 1 | 2 | 1 | **5** | **继续观察** |
| 27 | sleepBreath 腹背鼓起实验：用户拍板「算啦」→ 放弃并 Undo 回原始 pingpong | `TEST_TRACKER` starlight-cloak 行（2026-08-04） | 实验放弃；睡循环子项已测 OK | Sleeping 序列 | 1 | 1 | 3 | 1 | **6** | **需要人工判断**：已放弃成功——仅确认勿再开同类实验除非新 Brief（分接近观察） |
| 28 | Hints 接线⑤：锚点只吃 viewport-context —— 架构 Backlog，不本轮全改 | `HINTS_WIRING.md` §批次 | 偏高风险；先 Brief/试点 | OnboardingHints · 壳层 | 1 | 1 | 1 | 2 | **5** | **继续观察** |
| 29 | Cloudflare Workers stub / v1.1 云端：前端暂不接线 | `DEVELOP_DEBT` unknown；`PROCESS` v1.0/v1.1 拍板 | v1.0 纯本地；云端延后 | `focus-tiger/cloud/` | 1 | 1 | 1 | 1 | **4** | **继续观察** |
| 30 | EDGE_CASES P2 簇（#24–30 等）：演示参数 coerce、normalize 静默、Companion overlay 未 disabled、Pointer 3D 几何、双写已文档化、dormantTrigger 有意设计、locale key 露出 | `EDGE_CASES.md` P2「观察，不主动开修」（2026-07-22） | 小/已文档化；先观察 | 各 Store / Companion / i18n | 1 | 1 | 2 | 1 | **5** | **继续观察**（单点升级时再拆行） |
| 31 | MilestoneGlow 曾「已知问题、不挡此次合并」（2026-07-23）；产品路径后已接线，**同刻时序**仍待人工 | commit `58ba921`；`PROCESS` 合并门禁；现 `KNOWN_RISKY` #13 | 历史 defer 合并；现转走查而非「永不修」 | `MilestoneGlow*` | 2 | 2 | 2 | 2 | **8** | **需要人工判断**：历史「不挡」≠ 今日仍 defer；建议当走查项而非本表「继续观察」 |

---

## 2. 统计摘要

| 建议桶 | 条数 | 编号 |
|---|---|---|
| **进入下一批修复**（≥9） | **6** | #1–#6 |
| **需要人工判断**（6–8） | **16** | #7–#20、#27、#31 |
| **继续观察**（≤5） | **9** | #21–#26、#28–#30 |
| **合计** | **31** | — |

### 总分 ≥9 清单（供第一批拍板）

1. **#1 Sit @ `completionPending` 静默 return**（回归锁红线；小改高收益）  
2. **#2 Hints 整体再设计**（`post-v1`；须 Brief，不是尖角热修）  
3. **#3 `playEmotion` 返回值 / hold key 可观测性**  
4. **#4 Visibility `gap-*` 收口**  
5. **#5 `SessionComplete` 观察式文案**  
6. **#6 主动 Recover 入口**（新品；与 #5 同属「半截体验」族）

### 历史模式警示（不进开放分）

- **2026-08-01 → 08-02**：⋯/抽屉脉冲误绑已记入「有问题」，同日其它 `fix/*` 明文「脉冲点 / Hints …**未改**」→ 用户追问「为何未修」。根因叙述写在 `TEST_TRACKER` 薄荷绿行（**记入 ≠ 开修**范式命名来源）。该缺陷**已于 08-02 开修**，故不进上表。

---

## 3. 扫描来源与方法

| 来源 | 用法 |
|---|---|
| `TEST_TRACKER.md` | 「可保留观察 / 暂不关单 / 已放弃 / 不挡合并 / post-v1 / 不挡 P0·merge」 |
| `EDGE_CASES.md` | P1「先不修」全表；P2「不主动开修」聚合为 #30 |
| `DEVELOP_DEBT_INVENTORY.md` | 「暂不处理」建议动作交叉核对 |
| `KNOWN_RISKY_TEST_CHECKLIST.md` | 步8 延期、#15–17 观察/Backlog、Hints 再设计 |
| `HINTS_WIRING.md` / `SCENE_ANIMATION_WIRING.md` | ④观察持有；挥手停接线；吹花未接线 |
| `EMOTION_BIBLE.md` / `PRODUCT_MOMENTS.md` | 停接线、已放弃、Recover/Transition 空白 |
| `PROCESS.md` | 合并门禁 defer、SessionComplete 文案、Focus Confidence |
| Git | `1b64406` / PR #95（observe-hold）；`58ba921`（MilestoneGlow deferral）；`8d8905b`（吹花策略 C）等 |

**未做**：现场复测；未改代码；未改原文档状态列。

---

## 4. 维护

- 某条开修并合入后：在本表对应行「建议」改为「已排期/已修」并链 PR，或整行移入文末「已闭环」附录。  
- **禁止**用本表分数直接改写 `TEST_TRACKER`「已通过」。  
- 新出现「记入但不修」时：优先补一行本表，再决定是否写入 `EDGE_CASES` / 债务清单。

---

## 5. 本回合未做

- 未改任何运行时代码  
- 未改 `TEST_TRACKER` / `*_WIRING` / `DEVELOP_DEBT_INVENTORY` / `EDGE_CASES`  
- 未启动 Vite / Playwright  
- 未对表内条目做现场复测（依据为文档 + commit/PR 阅读）
