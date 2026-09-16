# Epic 覆盖度审计（存量扫描）

审计日期：2026-09-16  
范围：已合并 PR + 任务书/权威文档 + `src/` 跨模块仲裁/聚合层  
本文件只做对照报告。**未新建 Epic、未改标签、未改代码、未回填 PR 正文。**

对照基线（地面真相，`gh issue list --state all`）：

| 类型 | 数量 | 编号 |
|---|---|---|
| `type:epic` | 24 | #627–#647、#742、#792（音景）、#793（栖居壳层）（原草案 1–22 里 #16 已并入 #8，后补 #23=#742、#24–#25 于 2026-09-16） |
| `type:slice` | 7 | #649 #650 #743–#745 #773 #774 |
| `type:audit` | 1 | #648 冷启动第一幕 |

线名权威：`docs/planning/task-lines-epic-draft.md`。

---

## 大白话总结

仓库里产品线的「篮子」已经有了：大约二十条长线，外加几条切片和一条冷启动审计。真正的缺口不是「完全没有篮子」，而是大量已经做过的事从来没被写进任何一个篮子的关联里——尤其是去年夏天到今年九月初的合并记录。文档和任务书大多能对上现有线；对不上的，集中在氛围乐、壳层菜单/叠层规矩、以及工作室自己的流程门禁。这一轮只把对账写出来，哪些该塞回旧线、哪些该新开篮子，请你逐条拍板。

---

## 方法与上限

- **来源 A**：`gh pr list --state merged --limit 1000` → **698** 条。用正文/标题里的 `Closes` / `Fixes` / `Resolves` / `Relates to`（及 `Related to` / `Epic:` / `所属线`）是否指向上表 Issue。**未**对 600+ 条无主 PR 逐条 `gh pr view --json files`（条目上限：机械全量分类 698；文件级抽查 0）。
- **来源 B**：`docs/task-briefs/` **129** 份；仓库根 `WORKFLOW.md`；`docs/` 下 SSOT / `*_AUDIT.md` / `*_INVENTORY.md` / `*_CENSUS.md`。任务书按文件名+文首标题归类；权威文档读用途句，不整本精读。
- **来源 C**：`src/` 下文件名含 Arbitration / Aggregate / Registry / Orchestrat 的跨模块文件，加若干「谁都会调」的门闩（花瓣迎客、练习账本、叠层逃逸栈）。
- 关键词自动归桶**有假阳性**（例如标题里出现 companion / sit / newsletter 会误撞线）。A 节「建议归属」凡标 ⚠️ 都需要你过目，不要当已入账。

三态：

| 标记 | 含义 |
|---|---|
| ✅ 已覆盖 | 有规范关键字挂到 Epic/切片/审计，或文档主题与某线概述明确同一件事 |
| ⚠️ 疑似孤儿 | 主题能装进已有线，但从未 `Closes`/`Relates to`，或只有标题里写了 `#号` |
| ❌ 真孤儿 | 现有线装不下（装进去会撑破线的职责） |

---

## 来源 A — 已合并 PR

**汇总**

| 判定桶 | 条数 | 说明 |
|---|---|---|
| ✅ 正文有规范关键字指向 Epic/切片/审计 | **31** | 几乎全是 2026-09-07 任务线门禁上线之后 |
| ⚠️ 标题/正文出现了线号，但没有 Closes/Relates 句式 | **7** | 例如 #774 实验室探针、#742 节日规划、#651 建库文档 |
| ⚠️/❌ 完全没有线号 | **660** | 门禁之前的存量 + 门禁后仍漏写的 |

### A.1 各线被规范引用的次数（✅ 地面）

| 线 | 被 `Closes`/`Relates` 类关键字挂上的已合并 PR 数 | 判定 |
|---|---|---|
| #637 金句三池 | 9 | ✅ 近期接线较密 |
| #644 市场官网 | 7 | ✅ |
| #645 美术优化 | 6 | ✅ 多为 backdrop dim 切片 |
| #627 基础练习 | 3 | ⚠️ 作为活基线，历史 PR 几乎全无主 |
| #630 支付 | 3 | ⚠️ 大量 Support/Stripe PR 无引用 |
| #646 防剽窃 | 3 | ⚠️ |
| #636 Reset | 2 | ⚠️ |
| #639 Confide | 2 | ⚠️ 工作量最大的线，显式挂接极少 |
| #640 Yin Evolution | 2 | ⚠️ 莲花/芥子大量历史未挂 |
| #648 冷启动审计 | 2 | ⚠️ |
| #631 DMG | 1 | ⚠️ Electron 壳大量未挂 |
| #632 寅币/珍藏 | 1 | ⚠️ |
| #633 Five Moments | 1 | ⚠️ |
| #642 导入导出 | 1 | ⚠️ |
| #643 Journey Log | 1 | ⚠️ |
| #744 / #745 节日切片 | 各 1 | ✅ Phase 4 万圣/元旦 |
| #773 菜单关叠层 | 1 | ✅（2026-09-16 改挂 `line:habitat-shell` / Epic #793） |
| #628 #629 #634 #635 #638 #641 #647 #649 #650 #742 #743 #774 | **0** | ⚠️ 线在，合并记录没按格式入账 |

31 条显式挂接清单（便于抽查）：#775 #772 #755 #754 #699 #696 #690 #673–#665 #664 #663 #661–#652 #626 #602 #601 #600。

### A.2 无主 PR 的产品主题（不要用自动词表当归属）

660 条无主不能逐条列表。按**产品主题**归堆（人工可读；与自动关键词桶不同，下面已去掉明显误撞）：

| 条目（主题堆） | 判定 | 建议归属 | 依据 |
|---|---|---|---|
| 任务线门禁出现前的 feat/fix 主体（Sit/Honesty/Arrival/HUD 等） | ⚠️ | 回填 **#627**（及当时真正改的那条，如 Honesty 仍 #627） | 线 1 就是活基线；不是新功能族 |
| Ritual / MicroRitual / RitualFlow | ⚠️ | **#628** | 与 Epic 概述同职责 |
| Focus Circle / Witness / Quiet Together / presence | ⚠️ | **#629** | 草案写明刀 2 挂本线 |
| Stripe / Support / membership / checkout | ⚠️ | **#630** | |
| Electron 壳 / 托盘 / updater / DMG 文档 | ⚠️ | **#631** | |
| Focus Coins / Collections 抽屉与卡片 | ⚠️ | **#632** | |
| Five Moments 表面 / Compass / whisper 计划 | ⚠️ | **#633** | 不要把金句 runtime 塞进来 |
| YPE L0/L1/L2 / secret transform | ⚠️ | **#634**（云闭包部分耦合 **#646**） | |
| Local AI Operating 方向锁文档 PR | ⚠️ | **#635** | 条数少 |
| Ground / Reset UI | ⚠️ | **#636** | |
| Daily Wisdom / Quiet Line / Calm Action 接线 | ⚠️ | **#637** | 近期已有规范挂接可作样板 |
| 冷启动目标问 / 第一幕 | ⚠️ | **#638** 或前置 **#648** | 草案：审计收口才解禁 #12 |
| Confide / companion / Phase1 | ⚠️ | **#639**；验收轨 **#647** | |
| 莲花池 / 芥子印 / 纪念印 / 花园文案 | ⚠️ | **#640** | 草案 #14：莲花 Slice A=Visible Growth；芥子/静思典藏是同一意义层，**不建议新开「纪念印 Epic」** |
| i18n / locale packs | ⚠️ | **#641** | |
| 练习备份 / 导出导入 | ⚠️ | **#642** | |
| Journey Log 写入 | ⚠️ | **#643** | |
| twinsology.com 市场页 | ⚠️ | **#644** | |
| Sanctuary 美术 / 壁纸赠送 / dim | ⚠️ | **#645** | |
| 品味层 overlay / 防剽窃文档 | ⚠️ | **#646** | |
| 节日 Phase 1–3 圣诞等 | ⚠️ | **#742** | 引擎已合，只是没回填 |
| **氛围乐 / 用户上传音轨 / 15s 试听 / Ambient 音符** | ❌ | **建议新开线：音景（Soundscape）** | 现有 22 条 Epic 都未认领「听什么」；#627 是练习机不是播放器 |
| **菜单逃生舱 / Quiet Drawer / HIG 模态 / 叠层仲裁 / z-index 层叠作为产品壳** | ❌ 或 ⚠️ | 见下方拍板；**我认为最合理：新开「栖居壳层」**，不要继续塞进 #645「美术」 | 美术线管味道；壳层管谁能点、谁盖住谁、Esc 栈。已有 `MENU_CHROME_CENSUS` / `MODAL_USAGE_AUDIT` / overlay 仲裁，却无 Epic |
| **CI / Cursor hooks / worktree / TEST_TRACKER 拼装 / 回归锁** | ❌ | **建议新开线：工作室工作流（或明确宣布流程 PR 不必挂产品 Epic）** | 不是用户产品功能；硬塞 #627 会污染看板 |
| **远程参数 / Worker KV 目录**（`REMOTE_PARAM_CANDIDATES`） | ⚠️ | 优先回填 **#646**（品味/权重云）+ 基础设施说明；不必单开产品 Epic | 尺子在防剽窃层，不是新玩法 |
| 间隔磬 / 觉察卡 | ⚠️ | **#627**（Focus 中段）或 #633 若算 Moment 扩充 | 更像基础练习中的一次会话能力 |

A.2 那 7 条「有 #号无关键字」建议只补一句 `Relates to`，不必新开线（#780 的 eod-sync 误写 #773 除外，那是流程 PR）。

---

## 来源 B — 文档

### B.1 任务书 129 份

约 **97** 份文件名即可对上现有线（Confide/金句/Circle/YPE/记忆切片/备份/官网/dim 等）→ ✅ 主题已覆盖，⚠️ 多数从未在对应 Epic 的「已知子任务」里点名。

**对不上或职责会撑破现有线的任务书（需拍板）**

| 条目 | 判定 | 建议归属 | 依据 |
|---|---|---|---|
| `task-user-ambient-upload-v1` · `task-ambient-deep-audition-15s` · `audit-narrow-wide-ambient-parity` | ❌ | 新开线：音景 | 用户可感知「听」；无 Epic |
| `task-mustard-seed-seal*` · `task-memorial-seal-directory` · `task-brand-seal-export-surfaces` | ⚠️ | **#640**（静思典藏/纪念） | 与 `CONTEMPLATIVE_ARCHIVE` / Yin Evolution 意义层一致；导出 footer 耦合 #642 |
| `task-mindfulness-scroll-export` | ⚠️ | **#640** 或 #642 | 纪念导出，不是新玩法 |
| `task-overlay-ui-surface-o04` · `task-overlay-backdrop-dim-rollout` · `task-menu-open-dismiss-idle-overlays` | ⚠️/❌ | dim 已有 PR 挂 #645；**O-04 整张叠层合同、菜单治理** 更像壳层新线 | O-04 是跨模块合同，不是一张图 |
| `task-light-progression-parallax-rim` | ⚠️ | **#645** 或 #648 第一幕氛围 | 视觉增强，非新玩法 |
| `task-flower-blow-welcome-phased` · `task-cold-start-first-scene-audit` | ⚠️ | **#648** | 审计线本职 |
| `task-scene-animation-wiring-v1-slice-a` · `…-slice-b` · `task-parrot-ear-visit-2026-08-03` | ⚠️ | **#645** + 情绪圣经执行，不要新开「动画 Epic」 | 接线表已有 SSOT |
| `task-responsive-*` · `task-wide-home-three-ball` | ⚠️ | 壳层新线 或 #645 | 断点/chrome，不是 Moment 玩法 |
| `task-session-interval-bell-and-awareness-card` | ⚠️ | **#627** | 会话内能力 |
| `task-in-app-privacy-and-purpose-copy` · `task-brand-yin-way-tagline` | ⚠️ | 定位/文案；可挂 **#638** 表面 或不必单独 Epic | 不是功能线 |
| `task-growth-content-pack-decision` · `task-milestone-glow-product-wire` · `task-sanctuary-enso-mark` | ⚠️ | **#640** / **#645** | 增长可见物，草案已给莲花归 #14 |
| `task-tracker-fragment-assemble-trigger` · `task-logged-debt-batch-134` · `task-pr2-develop-into-main` · `fix-375-e2e-reds` | ❌ | 工作室工作流线（或声明不入产品 Epic） | |
| `task-tech-direction-v1-shell-monetization` | ⚠️ | 纪要；拆进 **#630/#631**，不要当第三条商业化线 | |
| `task-yin-intent-tier2-ingest` | ⚠️ | **#634** 或 #639 语料 | 入库不是新用户功能 |
| `task00` / `task01` / `task0b` 脚手架 | ⚠️ | 历史开工；可归档到 **#627** 史前 | 不必新开 |

未在上表点名的任务书：按文件名归入对应 Epic，判定 **⚠️ 回填关联即可**。

### B.2 权威 / 审计 / 规范类文档

仓库根 **没有** `STANDARDS.md`（提示词举例名）；实际是 `LABEL_HINT_TIP_STANDARDS.md` 等分散 SSOT。

| 条目 | 判定 | 建议归属 | 依据 |
|---|---|---|---|
| `WORKFLOW.md` · `PROCESS.md` · `RULES_INDEX.md` · `DEV_WORKFLOW_QUALITY.md` · `COLLAB.md` · `DOC_CODE_CONTRACT.md` | ❌ | 工作室工作流线 **或** 明确「规范文档不入产品 Epic」 | 管开发者，不管用户坐垫 |
| `PRINCIPLES.md` · `PRODUCT_POSITIONING.md` · `DESIGN.md` · `MVP_PRODUCT_DEFINITION.md` · `CORE_LOOP.md` · `PRODUCT_MOMENTS.md` | ✅ | 跨线宪法；**不要**单开「原则 Epic」 | 所有产品线的约束，不是一条交付线 |
| `ARCHITECTURE.md` · `EMOTION_BIBLE.md` · `SCENE_ANIMATION_WIRING.md` · `HINTS_WIRING.md` · `CHARACTER_BIBLE.md` | ⚠️ | 执行面归 **#627/#645**；文档本身是 SSOT 不是 Epic | |
| `ANTI_PLAGIARISM_LAYER.md` | ✅ | **#646** | |
| `YIN_EVOLUTION.md` · `CONTEMPLATIVE_ARCHIVE.md` | ✅ | **#640** | |
| `YIN_PERSONALIZATION_ENGINE.md` · `YIN_PERSONAL_MEMORY.md` | ✅ | **#634** / **#640+#639** 记忆切片 | |
| `LOCAL_AI_OPERATING_LAYER.md` · `LOCAL_AI_PHASE1_TASK_PLAN.md` · `LOCAL_AI_SCENARIOS_V1.md` | ✅ | **#635** / **#647** / **#639** | |
| `FOCUS_COINS.md` · `GROWTH_METRICS_CHARTER.md` | ✅ | **#632** / **#640**（分生长可视化） | |
| `MENU_CHROME_CENSUS.md` · `MODAL_USAGE_AUDIT.md` · `MACOS_HIG_AUDIT_ROUND1.md` · `Z_INDEX.md` · `INTERACTION_FEEDBACK_PRINCIPLES.md` | ❌/⚠️ | **栖居壳层**（推荐）或硬塞 #645 | 无用户路径的规范，但管全产品可点面 |
| `LABEL_HINT_TIP_AUDIT.md` · `LABEL_HINT_TIP_STANDARDS.md` · `ONBOARDING_HINTS.md` | ⚠️ | **#638** + 提示系统；不要新开「文案 Epic」 | |
| `TODAY_PRACTICE_SEMANTICS_AUDIT.md` · `practice-aggregate-registry.md` | ⚠️ | **#627** 账本口径（草案线 1 优先事项） | |
| `REMOTE_PARAM_CANDIDATES.md` · `INFRA_SNAPSHOT.md` · `ENV_CONFIG.md` | ⚠️ | 基建快照；产品归属 **#646/#630** 消费者 | |
| `COVERAGE_GAP_AUDIT.md` · `DEVELOP_DEBT_INVENTORY.md` · `ASSET_INVENTORY.md` · `WEEKLY_PRODUCT_BACKLOG_AUDIT.md` · `LOGGED_NOT_FIXED_AUDIT.md` | ❌ | 工作室工作流 / 债清单，非产品线 | |
| `SANCTUARY_UI_ART_DIRECTION.md` · `RESPONSIVE_LAYOUT.md` · `LIGHT_PROGRESSION_DESIGN.md` · `FLOWER_BLOW_WELCOME_DESIGN.md` | ⚠️ | #645 / 壳层 / #648 | |
| `FROM_APP_TO_CULTURE.md` · `CALM_ACTION_WISDOM.md` | ✅ | 文化方向锁可挂 #640 备注；CAW 归 **#637** | |
| `TASKS.md` · `TEST_TRACKER.md` · `SCENARIO_TESTS.md` · `SHARED_RESOURCES.md` | ✅ 作为索引 | 不单开 Epic；`SHARED_RESOURCES` 的仲裁段指向壳层 | |
| `planning/task-lines-epic-draft.md` · `planning/task-lines-issue-map.md` | ✅ | 本审计的对照母本 | |

---

## 来源 C — 代码里的架构层

| 条目 | 判定 | 建议归属 | 依据 |
|---|---|---|---|
| `spriteChannelArbitration.js` | ❌/⚠️ | **栖居壳层**（精灵通道占用） | 跨冷启动/结束/鹦鹉/支付感谢；不是 #645 画一张图 |
| `overlaySlotArbitration.js` + `overlaySlotContractRegistry.js` + `overlayUiSurfaceContract.js` | ❌/⚠️ | **栖居壳层** | 谁占屏；文档在 SHARED_RESOURCES |
| `overlayEscapeStack.js` | ⚠️ | 壳层；原则「菜单逃生舱」 | |
| `idleChromeOrchestration.js` · `IdleChromeFacade.js` | ⚠️ | 壳层 或 #627 Idle chrome | |
| `IdleOrchestrator.js` | ⚠️ | **#627** + 情绪圣经 | 呼吸×眨眼编排，不是新线 |
| `practiceAggregate.js` + `practiceAggregateConsumerRegistry.js` | ⚠️ | **#627**（账本 SSOT） | 读侧聚合；写仍在完成钩；耦合 #632/#640/#643 |
| `sessionUiGateContractRegistry.js` · `visibilityContractRegistry.js` · `growthMetricsRegistry.js` | ⚠️ | 门闩合同 → #627；生长登记 → #640 | 聚合层，不单开 |
| `localeRegistry.js` | ✅ | **#641** | |
| `entitlementRegistry.js` | ✅ | **#630** | |
| `onboardingHintRegistry.js` | ⚠️ | **#638** | |
| `localBackupStorageRegistry.js` | ✅ | **#642** | |
| `sceneAnimationDispatcher.js` | ⚠️ | **#645** 接线，调用仲裁层 | |
| `flowerWelcomeGate.js` | ⚠️ | **#648** | |
| `EmotionController.js` | ⚠️ | 架构桥；归属 #627 情绪主线 | 不是孤儿模块，但是跨线枢纽 |

---

## 需要你拍板的「新线」候选（合并去重）

现有 22 条产品 Epic **已经能装下**绝大多数已做功能。真正缺篮子的只有下面几类。

| 候选 | 装什么 | 若不新开会怎样 |
|---|---|---|
| **音景** | 曲库、用户上传、试听、音符按钮、与练习并行的听 | 继续散落，无人认领「听」 |
| **栖居壳层** | 菜单/抽屉、Esc 栈、叠层槽仲裁、精灵通道占用、HIG 模态原则、响应式 chrome、z-index 登记 | 继续误挂「美术」，看板上看不出壳层债务 |
| **工作室工作流** | CI、Agent 门禁、worktree、tracker 拼装、本审计这类文档 | 流程 PR 要么假挂产品线，要么永远无主 |

**我认为最合理的是：**

1. **新开「音景」** — 用户可感知、职责边界清楚、现有线装不下。  
2. **新开「栖居壳层」** — 比把仲裁/菜单塞进 #645 更干净；#645 继续只管序列、姿态、Sanctuary 美术方向。  
3. **工作室工作流：不要做成第 25 条产品 Epic。** 在 `WORKFLOW.md` 写明：纯流程/CI/规则 PR 使用固定声明（例如 `Relates to: process` 或不要求产品 Epic）。硬建一条「流程 Epic」会让看板永远不完结，且和产品线抢注意力。  
4. **不要**为莲花/芥子/纪念印、远程 KV、练习账本聚合、动画接线表各开新 Epic — 草案已分别给了 #640、#646、#627、#645。

其余 660 条无主 PR：**回填关联，不建新线**（按 A.2 主题堆）。回填可用脚本批量改 GitHub 描述，但归属仍须你确认堆 → 线的映射，本轮不做。

---

## 以后防漏（提示词附录，仍待拍板）

现有 `task-line-ref-check.yml` 只拦新 PR 的 Closes。文档侧人工纪律（新 brief/SSOT 文末写「所属线: Epic #xxx」或「新开线:待建」）**值得采纳**，成本低。不要对文档做 CI 自动猜线。

---

## 本轮未做

- ~~未创建任何 GitHub Issue/Epic~~ → **2026-09-16 口令一已建** #792 音景 · #793 栖居壳层 · `type:process` label · guard 豁免 · #773 改挂壳层线  
- 未修改已合并 PR 正文（口令二：按主题堆 curated 回填，另口令）  
- 未对 660 条无主 PR 做 files 抽查（若要加深 A，下一批可按主题堆各抽 3 个 PR 看路径）  
- 未把 129 份 brief 全文精读（文件名+文首标题）
