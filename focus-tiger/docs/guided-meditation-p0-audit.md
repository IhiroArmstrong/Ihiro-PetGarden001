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
| B 体积 | 精灵+音频走 `extraResources`；SW 不缓存音频 | 本机 `public/audio` 被忽略，今日精确 GiB **未核实** | P0.5 定 TTS 码率后再估课包；Web 按课懒加载 |
| C 计入 | 写入集中在 `onPracticeDay` + `completeMicroRitual` | 新 `sourceId` 未登记 | P1 计入基线源，并改读取注册表 |
| D 仲裁 | Ground / Breath / Sit / T79 已有合同 | 引导冥想无 source | P1 登记 VISUAL_PRIMARY + Focusing 同级忙会话 |
| E 入口 | Practice 组已有 Ground，宽窄同一张名单 | 无 Guided Meditation 行 | P1 一项菜单 + 列表页；冷启动第五项 **P2** |
| F 内容 | 配乐有 YouTube Audio Library 归因索引 | 无原创引导词、无 TTS 商用授权记录 | P0.5 写稿 + 授权；禁止搬成品课 |
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

### B1. 桌面包

- `focus-tiger/desktop/package.json`：`sprites` + `audio` 在 `extraResources`，不进 asar。
- `ARCHITECTURE.md` / 脚手架 Brief：约 **1.1 GiB**（精灵+音频合计口径）。
- `PROCESS.md`（2026-08-05）：ambient 目录当时约 **188MB**、12 内置曲。
- 本机 `du public/audio`：**未核实**（工作区忽略媒体目录）。

新增 3 课 × 2 语（en/ja），按口语 MP3 约 64 kbps 粗算：18 分钟 × 2 ≈ **17–30 MB** 量级。相对 1.1 GiB 小，但桌面更新器 Brief（`task-electron-desktop-updater.md`）写明：**素材变了仍可能整包 extraResources 更新**。MVP 把课包打进 `public/audio/guided-meditation/` 会碰到这个问题。

**建议：** Web 按课懒加载。桌面 MVP 可同目录入库，TRACKER 记一次真实下载体积；不要把课包打进 asar。

### B2. Web 懒加载

- 现网 ambient 是点播 URL，浏览器 HTTP 缓存，**应用内无**按课 Cache Storage。
- 首次点课 = 等该课 mp3。大 ambient 已有「首播可能略慢」的 TRACKER 经验。

**建议：** P1 点列表才 fetch 该课；失败可见；可选 `Cache.add` 仅课包（用户点击后），不要开机预拉。

### B3. 后台网络三问（草案，实现 PR 再答实测）

| 问 | 草案答案 |
|---|---|
| 时机 | **用户点了某课才拉**。禁止冷启动 / Idle 呼吸 / 精灵预载窗口预拉。不涉及自动同步。 |
| 写盘 | 若做 Cache Storage：同一 URL 命中则跳过写入。 |
| 慢网 | 列表可先出文案大纲；音频未到显示加载，**禁止**卡住 Idle 序列。失败不得静默。 |

点击触发 → 实现 PR 写「不涉及后台网络」若坚持只点课才请求。

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

### C3. 完成判定（选项）

| 方案 | 规则 | 评价 |
|---|---|---|
| A | 播到 ≥90% 或点「结束练习」且已过收尾段 | **最合理**：防刷、仍允许提前以仪式结束 |
| B | 墙钟满课时长即计入 | 可暂停挂机刷时长 |
| C | 中途退出按实际分钟计入 | 诚实，但 20 秒退出也会亮格 |
| D | 中途退出完全不计 | 最干净；流失大 |

**建议 A**：未达 90% 的「随时停止」**不计练习日**（可记本地 aborted 供以后 P3，不进聚合）。满课或用户在收尾段确认结束 → 计入标称分钟（3/5/10），不按缓冲暂停累计。

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

### E4. 冷启动（本轮只写依赖）

**硬前置：** 冷启动第一幕审计仍 backlog（`task-cold-start-first-scene-audit.md`）。T76 已把四选卡第 1 项 `mindfulness` 映射为 **10 分钟直坐、无语音**（`resolveColdStartGoalAction` → `direct-sit` 10 分；hint「Sit quietly with Yin, no guidance」）。`COLD_START_GOAL_OPTIONS_VERSION` **现为 2**。

帮助中心 EDU-0003：**Sit = quiet sit / no voice guidance**，禁止写成「通用冥想课」。

「第五项」会 bump 版本到 3，老用户见「有新选项」横幅。Preferences「重新选择今日方向」走同一张卡；问号简介卡 **不再**重复该链（#1131）。

**本轮不动**四选卡代码。P2 必须先解决与 T76 第 1 项的职责重叠（见冲突扫描），不能再加一个也叫 mindfulness 的选项。

---

## F. 内容与授权

见 [`guided-meditation-p0-content-spec.md`](./guided-meditation-p0-content-spec.md)。摘要：

- 引导词 **原创**；结构 落座→锚定→走神→拉回→收尾。
- 语音：**预渲染高质量 TTS** 为 MVP 最合理项；运行时 TTS 否；真人后置。
- 配乐：可复用现有 YouTube Audio Library 曲（归因 `docs/THIRD_PARTY_AUDIO_LICENSES.md`）；冥想语音 **另需** TTS 商用授权，**未核实具体供应商条款**。
- 边界：随时可停、可睁眼、不宣称疗效；对外 en+ja。

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
4. TTS 供应商商用、再分发、en/ja 音色条款。
5. 配乐在「语音引导」场景是否过满（听感，非授权）。

---

## 冲突扫描（实现前 · FEATURE_CONFLICT_REVIEW）

对照相邻路径：T76 冷启动直坐、Sit with Yin、Breath、Ground、EDU-0003、T79。

| 轴 | 判断 |
|---|---|
| a 强度 | 3 分钟入门课短于 10 分钟直坐，不强于危机/Honesty。无错位。 |
| b 语气 | **疑点**：现网帮助与 T76 副标强调「无语音指导」。引导课是教练口吻。须用观察式短句 + 安全说明，禁止疗效句；阿寅仍是同伴不是老师。 |
| c 职责 | **疑点**：第 1 项已占用「Mindfulness & meditation」→ 无引导静坐。再做引导课 + 第五项，用户会以为第 1 项就是这门课。 |

**P1 菜单入口**可以和 Sit/Breath/Ground 并列（体验不同）。**P2 冷启动第五项**必须等你拍板命名，且 **不得**在第一幕审计收口前改四选卡。

我认为最合理的冷启动策略：P1 **不**改四选卡；P2 若做，第五项用独立文案（例如 Guided sitting with voice），**保留**第 1 项「无引导同坐」。不要把第 1 项改成入门课。
