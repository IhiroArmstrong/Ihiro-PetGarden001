# Guided Meditation P0 只读审计

> 日期：2026-11-04 · 基线：`origin/develop` `9a19b7cc`（#1556）  
> Brief：[`task-briefs/task-guided-meditation-p0-audit.md`](./task-briefs/task-guided-meditation-p0-audit.md)  
> 范围：只读。无运行时代码。未核实项与需实测项单独列出。  
> 冲突扫描：见文末「冲突扫描」——**有职责重叠疑点**，P1 不得在 PO 拍板前写 `src/`。

---

## 计划 → 现状 → 还差 → 下一步

| 计划 | 现状 | 还差 | 下一步 |
|---|---|---|---|
| A 播放器 | 配乐与磬是两路 `<audio>`；系统朗读是第三路、无时间轴 | 没有「语音轨 + 文案 cue」播放器 | P1 新建课程播放器，复用配乐 duck/fade，不复用系统朗读 |
| B 体积 | **姊妹篇**：课不进包；R2 点课拉取；Web 流式 | 旧稿「本地 TTS mp3 进 public」**作废** | 只读 [`guided-meditation-media-delivery-audit.md`](./guided-meditation-media-delivery-audit.md) H3–H8 |
| C 计入 | 写入集中在 `onPracticeDay` + `completeMicroRitual` | 新 `sourceId` 未登记 | P1 计入基线源，并改读取注册表 |
| D 仲裁 | Ground / Breath / Sit / T79 已有合同 | 引导冥想无 source | P1 登记 VISUAL_PRIMARY + Focusing 同级忙会话 |
| E 入口 | Practice 组已有 Ground，宽窄同一张名单 | 无 Guided Meditation 行 | P1 一项菜单 + 列表页；**冷启动第五项 PO 不做** |
| F 内容 | 第一课 **22 分 MP4 原声**已入库（姊妹篇清单） | 无 cue；短课待母版剪辑 | P0.5 剪 3–5 分 + 授权；TTS 仅备选 |
| G i18n/测试 | 切片 JSON + 菜单 e2e 惯例已有 | 无本功能键、无播放 e2e | P1 切片 `guided-meditation.json`；场景清单见 G |

---

## A. 播放器能力

### A1. 通道：语音 vs 音乐

| 通道 | 位置 | 用途 |
|---|---|---|
| 配乐 | `src/audio/AmbientSoundscapeController.js` | 长循环 `<audio>`；`loop = true`；`setVolume`；`fadeOutAndStop`；磬响时 duck |
| 计时磬 | `src/audio/SessionCueController.js` | 开始 / 间隔 / 结束三颗短铃；与配乐分音量滑条 |
| 系统朗读 | `src/core/systemTtsAnnouncements.js` + `systemTtsBridge.js` | 结束句 / 倾诉复读；**Electron 壳**；「最新一句覆盖」；**无**逐句 cue |
| Idle 序列 | CapCut 溶解（`CAPCUT_DISSOLVE_MS`） | 画面转场，**不是**音频播放器 |

**满足？** 音乐 + 短提示音 **部分满足**双轨调音（配乐 vs 磬）。长引导语音 **不满足**。

**缺口：** 没有第三路「课程语音」HTMLAudio，也没有 JSON 时间轴。系统朗读不能暂停对齐字幕，也不能与配乐做稳定 duck。

**建议：** P1 新增 `GuidedMeditationPlayer`（或同等）：语音 `<audio>` + 复用现有 `AmbientSoundscapeController` 作配乐。禁止把冥想稿塞进 `speakSystemTts`。

### A2. 暂停 / 淡出 / cue / 循环

| 能力 | 配乐 | 磬 | 系统朗读 | 引导冥想需要 |
|---|---|---|---|---|
| 暂停/继续 | `_audio.pause()` 存在；产品语义是停播而非「课中暂停」 | 短音，无课中暂停 | `stop` 有；无 resume-at-cue | 要 |
| 结束淡出 | `fadeOutAndStop`（约 1500ms） | 播完即止 | 立刻停 | 要（配乐淡出；语音可在句末切） |
| 逐句 cue | 无 | 无 | 无 | 要 |
| 音乐循环 | `player.loop = true` | 否 | 否 | 要 |

**满足？** 配乐循环与淡出 **满足可复用**。逐句同步 **不满足**。

**需实测：** iOS Safari 同时播两路 `<audio>` 是否被系统打断；暂停后 `currentTime` 是否可恢复。

### A3. 失败与打断

- 配乐加载失败：控制器里有 `pause` / stop 路径；用户可见降级 **需对照 UI 实测**（未跟完每条 catch）。
- 切后台 / 电话：代码侧 **未**看到统一的 `visibilitychange` → 暂停课程契约。浏览器可能自己停 `<audio>`。
- **需实测：** 切 tab、锁屏、来电、系统「播放中」被其它 App 抢占。

**建议：** P1 把「离开页 = 暂停课 + 保留进度」写成可见行为；加载失败出非静默提示（对照 `SILENT_BEHAVIORS`，不进白名单的沉默当 bug）。

### A4. Electron vs Web

- 配乐/磬：两端都是渲染进程 / 浏览器里的 `<audio>`，路径 Web 为 `/audio/…`，桌面 `extraResources` → `audio/`。
- 系统朗读：**仅桌面桥**（`systemTtsBridge.js`：「Web builds have no bridge」）。
- PWA：`registerServiceWorker.js` 在 Electron **不注册**；`public/sw.js` **scheme A：不 Cache Storage，不预缓存音频**。

**满足？** 配乐通道两端同构 **基本满足**。若 MVP 误用系统朗读，Web 会静音。

---

## B. 音频体积与加载

**本项 SSOT 在姊妹篇。** 不再建议把课打进 `public/audio` 或 extraResources。

- Brief：[`task-briefs/task-guided-meditation-media-delivery.md`](./task-briefs/task-guided-meditation-media-delivery.md)  
- 审计：[`guided-meditation-media-delivery-audit.md`](./guided-meditation-media-delivery-audit.md) H1–H5、H8  
- 方案：[`guided-meditation-media-delivery-spec.md`](./guided-meditation-media-delivery-spec.md)

**满足？** 方案层 **满足** PO：129MB/22 分可接受；Web 边下边播；桌面点课下载；授权前不上传。

**缺口：** 运行时未实现；R2 桶与 manifest 未建。

---

## C. 计入练习

### C1. 写入钩子（必须接）

| 钩子 | 位置 | 作用 |
|---|---|---|
| `onPracticeDay({ durationMinutes, sourceId })` | `main.js` Honesty 依赖 | `PracticeDaysStore.markToday` + `lotusPondRuntime.notePracticeMinutes` + Journey 记忆同步 |
| `completeMicroRitual` | `main.js` | 呼吸路径：daily completion + 天/莲花 + coins/essence + retention 事件 + Reflection |
| `HonestyCheckInController` 计时达标 | `sourceId: 'sit-timed'` | 正式 Sit |
| `practiceExperienceRegistry.js` | A9 练习种类表 | 结束语音 + 是否基线源 |
| `PRACTICE_BASELINE_SOURCE_IDS` | `practiceAggregate.js` | 仅 `sit-timed` · `honesty-checkin` · `breath-micro-ritual` |

Ground exercise / Arrival / RitualFlow：**故意不写**基线账本（注册表 + `practiceKindId` 的 `baselineWriteSourceId: null`）。

读取侧消费者（Confide 时长、徽章 score、印、商店门槛）都假定这三条基线源。新来源若只写莲花、不进 `PRACTICE_BASELINE_SOURCE_IDS`，会重蹈「写入有、读取当没练」的累计时长漏洞。

### C2. 注册表建议

**计入**（新 `sourceId` 建议 `guided-meditation`），理由：用户完成的是一场有时长的正式练习，不是氛围或补登。

P1 必须同批：

1. 完成时走与 `onPracticeDay` 等价的写入（daily + days + lotus）。
2. `PRACTICE_BASELINE_SOURCE_IDS` 增加该 id。
3. `practice-aggregate-registry.md` 源目录 + `practiceExperienceRegistry` 一行。
4. `npm run audit:practice-coverage` 消费者行反映新源。
5. Journey：建议完成且用户过 Reflection（或轻确认）后再写行，对齐 Sit/Breath；Honesty 仍无 Journey 行的产品分裂不要复制到这里。

Confide `practice_facts`：接 `resolvePracticeAggregate()` 后会自动含新源，**前提是**写入莲花/练习日且基线 id 登记。禁止只写 Journey。

### C3. 完成判定（PO 2026-11-04 · 对照聚合注册表）

写入 API：`onPracticeDay({ durationMinutes, sourceId: 'guided-meditation' })` → 练习日 + 莲花终身分钟（[`practice-aggregate-registry.md`](./practice-aggregate-registry.md) §Baseline · `PRACTICE_BASELINE_SOURCE_IDS`）。

| 课型 | PO 规则 | `durationMinutes` | 练习日 |
|---|---|---|---|
| **短课**（标称 ≤10 分，含母版剪出的 3–5 分） | 播到 **≥90%** 或收尾段确认结束 | **标称分钟**（3 / 5 / 10） | 达标才计入 |
| **长课**（现 `what-is-zen…` 1303s） | **实际播放 ≥3 分钟** | **`floor(实际播放秒 ÷ 60)`**（可 cap 标称 22 分） | 仅 ≥3 分钟 |
| 未达阈值 | 失败 / 早退 | **不调用** `onPracticeDay` | 不亮格 |

登记 `guided-meditation` 为第四基线源后，Confide / 徽章 / 印经 `resolvePracticeAggregate()` 与 Sit/Honesty/Breath **同读路径**。

**需实测：** 暂停不计入播放秒（用媒体 `played` 时间，非墙钟）。

### C4. 各账本

| 账本 | 影响 |
|---|---|
| Journey | 完成且过确认后一行；文案是「引导冥想」不是 Sit |
| 莲花池 | `notePracticeMinutes` |
| 徽章 / score | 基线源登记后走 `resolvePracticeAggregate` |
| Confide 事实 | 同上；禁止再读 Journey-only |
| Ground / Recover | **不**走这条写入 |
| Celebrating 全日舞 | 仍可只给计时 Sit 首次达标（现网 `hasCelebratedToday` 故意排除）——引导冥想 **不要**抢舞会，除非 PO 另拍 |

---

## D. 仲裁与叠层

### D1. 层级建议

引导冥想是 **会话硬态**，不是 Ground 那种 GROWTH_CARD 选择题。

建议：

- `OVERLAY_SOURCES.GUIDED_MEDITATION`（新）
- `kind: VISUAL_PRIMARY`
- `tier`: 紧挨 `MICRO_RITUAL`（现 tier 4）之前或之后（实现时插号，避免与 Honesty 5 抢）
- `blocksIdleYinTap: true`
- `blocksEnterSleep: true`
- `outsideDismiss: NONE` 或仅「结束」钮（课中点空白不得误关）
- 进行中 `sessionState` 视为与 **FOCUSING** 同类忙会话（`spriteChannelArbitration.js` `isBusySession`）

### D2. 冲突矩阵（草案）

| 对方 | 关系 |
|---|---|
| Focusing（Sit） | **互斥**。开课前若在 Focusing → 先 Rise / 拒绝开课 |
| Honesty 面板 | **互斥** |
| Breath MicroRitual | **互斥** |
| 吹花 / Welcome | 课中 KEEP，不得插花；课未开时冷启动花仍优先 |
| Compass / wellness first | 课中不抢；Idle 时 Compass 可开，但开课须关 Compass |
| Ground 选择题 | 开课前关掉 |
| Confide | 课中不自动开倾诉；菜单逃生舱仍可点 |
| T79 觉察哲思 | **互斥**（都是有时长的独立叠层） |
| 付款 Support | 课中不盖付款大卡；用户主动开 Support 则暂停课 |

精灵：课中 **闭目坐禅 Idle**（与 Breath 进行中相同），不要眨眼微笑，不要隐藏 Yin。

### D3. `OVERLAY_UI_SURFACE` 七列草案

| 列 | 草案 |
|---|---|
| registry | `GuidedMeditationSessionUI.js`（文件名实现时 ASCII kebab 模块） |
| slotRequest | `request` 或 `derive`，须进 `OVERLAY_SOURCE_CONTRACTS` |
| zIndexFloor | `ui-overlay-stack`（玻璃卡族）；dim 对照 `Z_INDEX.md` Idle chrome，不得盖死 `⋯` |
| mountPointer | `ui-overlay` |
| mutationFeedback | 完成写入本地：`pending/success/fail` 三键；关课本身无云 mutation 可 `na` 但完成记账失败必须可见 |
| e2eOverlap | 课开着时 `⋯` 仍可见可点 |
| trackerCoverage | 新 TRACKER 行：入口 + 播放 + 计入 |

菜单渲染 **不得** 读本 source 来决定 `⋯` 显隐（原则：逃生舱）。

### D4. 菜单卡死

`MENU_CHROME_CENSUS.md` 第 1 条已完成：叠层 suppress 时 `⋯` / 抓手仍在。P1 回归：开着引导冥想时仍能开菜单、Esc 只关最上一层。

---

## E. 入口与导航

### E1. 菜单位置

`listSecondaryChromeEntries`（`idleChromeOrchestration.js`）Practice 组现序：

`sanctuary-nav` → `companion` → **`ground-exercise`** → `five-moments` → `honesty` → `confide`

宽屏 `⋯` 与窄屏抽屉 **同一函数**。

**草案：** 在 `ground-exercise` **之后**插入一项 `guided-meditation`（一项，不要三节课三行）。

### E2. 普查补行（实现时写入 `MENU_CHROME_CENSUS.md` §2.2）

| 组 | 增 |
|---|---|
| Practice | `guided-meditation`（Ground exercise 与 Five Moments 之间） |

不进角落快捷。故意不进菜单的表不用改。

### E3. 列表页形态

**建议：** 玻璃次级面板（类 Ground 选择题 / T79 卡），上半列表 3 课，点课进入同面板播放态。**不要**新阻断式模态。宽屏遵守 T42：次级面板不挡脸（可贴底/靠右）。

### E4. 冷启动（PO：第五项不做）

**硬前置：** 冷启动第一幕审计仍 backlog。T76 第 1 项 = **10 分钟无引导直坐**（`resolveColdStartGoalAction` · hint「Sit quietly with Yin, no guidance」）。`COLD_START_GOAL_OPTIONS_VERSION` **现为 2**。

**PO 2026-11-04：不再做冷启动第五项。** 原「想学冥想」第五项会与第 1 项抢同一句话。

**以后（P2+，第一幕审计收口后）更合理：** 用户选第 1 项「正念与冥想」后，**二级**选「无引导直坐 / 有声引导 3 分钟」——**本轮不评估、不写代码**。

Preferences「重新选择今日方向」仍走现四选卡；问号简介不重复该链（#1131）。

---

## F. 内容与授权

见 [`guided-meditation-p0-content-spec.md`](./guided-meditation-p0-content-spec.md)。**PO 2026-11-04 摘要：**

- 第一课：**22 分成片 MP4 原声**（[`guided-meditation-source-inventory.md`](./guided-meditation-source-inventory.md)）；**优先**从母版剪 **3–5 分入门**（须 PO 听感确认切点）。
- **TTS 仅**以后没有成片时的短课备选；**第一课不用 TTS**。
- 配乐已在音轨内；**App 内播放 + YouTube 宣传 ≠ 同一授权**——核实前 **不上传**（姊妹篇 H7）。
- MVP **只上英文**；课卡标语言；ja 以后补。
- 边界：随时可停、可睁眼、不宣称疗效。

---

## F2. 上线前必改：Help / KB 与「无语音指导」

现网 **EDU-0003** / Help 问卡 alias（`zazen` / `meditation` 等）正文写：**Sit with Yin = quiet sit, no voice guidance**（`help-center.json` · `productKnowledgeCatalog.json` · e2e `help-center-quiet-sit-aliases.spec.js` · `SCENARIO_TESTS`）。

引导课上线后若不改口 → **产品自相矛盾**（用户以为 App 没有有声引导）。

**P1 硬门禁（与播放同 PR 或紧前 PR）：**

1. 保留 Sit **仍是无语音同坐** 的表述。  
2. 增加一句：另有 **菜单内带声音的引导冥想课**（观察式，非疗效）。  
3. 更新 en（及对外 ja 若已有键）+ 单测/e2e 期望；**禁止**删掉 T76「无引导」语义。

zh 草稿可滞后；对外 claim 仍 en-first。

---

## G. i18n 与测试

### G1. 键位规划（切片，不改总字典）

新切片 `src/locales/slices/guided-meditation.json`（en / zh 草稿 / ja）：

- `GUIDED_MEDITATION_MENU_LABEL`
- `GUIDED_MEDITATION_LIST_TITLE` / `_INTRO`
- 每课 `GUIDED_MEDITATION_LESSON_*_TITLE` / `_DURATION` / `_SAFETY`
- 播放：`_PAUSE` `_RESUME` `_END` `_LOAD_FAIL` `_STOPPED`
- 完成确认（若有）

zh 不进产品宣称；claim 仍 en+ja。

### G2. 测试清单草案

**单测：** cue 时间轴；完成判定 90%；暂停不计入；sourceId 写入契约；与 FOCUSING 互斥门闩；加载失败非空 UI。

**e2e：** 菜单可达（宽+375）；开课 0–1s 见文案+暂停钮；暂停/继续；结束计入（DEV 读练习日）；Focusing 中菜单项禁用或开课被拒；Honesty 开着互斥；`⋯` 课中仍可见。

**人工：** 听感、淡出、配乐音量、Safari 双轨。P1「已通过」须你亲测。

---

## 需实测 / 未核实

1. 今日桌面 extraResources 精确体积（媒体目录本审计未读）。
2. 双路 `<audio>` 在 Safari / iOS。
3. 切后台、来电对播放的实际行为。
4. TTS 供应商商用条款（**仅**备选短课路径）。
5. 母版能否自然剪出 3–5 分（**需 PO 听感**，非 Cursor 猜切点）。
6. 配乐 **App 内** 分发授权（成片合轨）。

---

## 冲突扫描（实现前 · FEATURE_CONFLICT_REVIEW）

对照相邻路径：T76 冷启动直坐、Sit with Yin、Breath、Ground、EDU-0003、T79。

| 轴 | 判断 |
|---|---|
| a 强度 | 3 分钟入门课短于 10 分钟直坐，不强于危机/Honesty。无错位。 |
| b 语气 | **疑点**：现网帮助与 T76 副标强调「无语音指导」。引导课是教练口吻。须用观察式短句 + 安全说明，禁止疗效句；阿寅仍是同伴不是老师。 |
| c 职责 | **已拍板**：**不做**冷启动第五项。P1 仅菜单入口与 Sit/Breath/Ground 并列。以后二级选在第 1 项下，第一幕审计后再议。 |

**P1 菜单入口** 无阻塞疑点。**Help/KB 改口** 为上线硬门禁（§F2）。

~~P2 冷启动第五项~~ → **取消**（PO 2026-11-04）。
