# 坐禅小老虎 · 项目组织与协作流程
# Focus Tiger · PROCESS.md

本文档记录开发组织纪律。完整协作约定（角色分工、Task Brief 书写规范、文档更新规则、日常协作流程）见 **COLLAB.md**。

权威文档索引另见：`PRODUCT_POSITIONING.md` / `MVP_PRODUCT_DEFINITION.md` / `PRINCIPLES.md` / `ARCHITECTURE.md` / `DESIGN.md` / **`RESPONSIVE_LAYOUT.md`** / `EMOTION_BIBLE.md` / `CHARACTER_BIBLE.md` / `TASKS.md` / `TEST_TRACKER.md` / **`DEV_WORKFLOW_QUALITY.md`**（如何改善开发工作流来保证开发质量）/ **`EDGE_CASES.md`**（静默失败与边角观察册）。

---

## 回归锁工作法（2026-07-19 · 方法级强制；2026-07-20 增补「防改坏」）

> **叙事全文**：`DEV_WORKFLOW_QUALITY.md`（原则 / 规范 / 指引 / 注意事项；两次讨论整合，后续可逐步完善）。  
> **背景**：两类事故反复出现——（1）「上次已修 → 再测又无正确效果」（假修好）；（2）「重写编排/转场后，原先已好的观感坏了」（把好的改坏，例 Idle 眨眼闪一下）。  
> 常见根因不是神秘回滚，而是 Agent **只验 Happy Path、门闩静默失败、无保护面重写、修复长期未 commit**。  
> 完整门禁见 `.cursor/rules/focus-tiger-regression-lock.mdc`（alwaysApply）。

### A. 防假修好（交互修复收尾）

1. 主路径 + **至少一条回流路径**（Rise 后再进、叠层后再开、同日第二场等）  
2. 用户可点控件不得对应逻辑静默 `return`（未就绪则禁用）  
3. 门闩类失败用例 + **确认修复 bug 须留回归锚**（不限门闩；无法自动化 → TEST_TRACKER 人工锁）  
4. 同主题 TEST_TRACKER 行步骤不得互斥  
5. 声称修好前先跑 **`npm run test:smoke` 与 `npm run test:e2e`**（不过不得声称修好；全绿 ≠ 序列观感通过）  
6. **立刻本地 commit（不必再问）**：用户反馈修复 / 回归锁收尾后 Agent **自动** `git commit`；**仍禁止**未确认 `git push`  
7. **相关项目文档同批纳入（N15）**：至少更新 `TEST_TRACKER`；触及行为/情绪/架构/共享资源时同步对应权威 md。**禁止**只改代码、文档滞后；缺文档或未 commit → 视为未完成  
8. 每次任务汇报末尾独立 **「待你决定 / 待你知道」** 清单（N14；禁止只在正文带过）

### B. 防把好的改坏（重写 / 改转场开工必做）

1. **改前列「已好清单」**：用户或文档已认可什么（例：呼吸→眨眼不闪、Sit 不打开 Honesty）。改完逐条自检；写不进单测的进 TEST_TRACKER 必测回归。  
2. **重写 ≠ 从零设计**：换实现须**继承**旧观感契约（不闪、不硬切、溶解期定格、顶点停留等），除非任务书明确「允许牺牲某某」。  
3. **单测锁契约、不锁实现细节**（例：眨眼切入必须 `crossFade + freezeUntilCrossFadeEnds`）。  
4. **任务声明保护面**：开工回复 / Task Brief 写清本次保护面（不动 / 必须复测的邻接体验）。一次一任务管改动范围；保护面管别踩坏邻接。

### C. 高风险面（门闩 + 序列衔接）

触及门闩/叠层/Sit·Rise **或** Idle 呼吸↔眨眼、`play()` cross-fade、Choose/Rise 叠化、pingpong 顶点停留时，默认高回归风险，须显式复检。清单以规则文件为准。

**禁止**：用「单元测试绿了 / 我改过了」代替回流验收与已好清单；禁止在未过门禁时写「已修好」。

**一句话**：防假修好靠回流路径；防把好的改坏靠「改前不变量 + 重写继承契约 + 衔接进高风险表」。

---

## 当前进度速览

> **维护规则**：每次完成具有实质性进展的 Task（不含纯粹的 debug / 微调）后，主动更新本速览对应部分，尤其是「已完成功能」「下一步计划」；若产生新的「待确认事项」，同步补入列表。本章节置于靠前位置，便于新对话快速对齐，无需每次加载全部文档。

**最后更新时间**：2026-07-22（UTC+8）

**当前技术路线**：主线为 **2D PNG 序列帧动画**（素材来源：图生视频 + 抽帧，见 `ARCHITECTURE.md`）；既有 **3D 多姿态 GLB** 资产与 `PoseManager` / `DynamicMotion` 等代码**完整保留**，改用于未来「奖励系统」塑胶公仔展示，不再作为主界面情绪表现载体。

**近期落地（待人工测试）**：

- **A 类开放行书面验收批次（2026-07-22）**：用户书面——FocusHUD 金环/今日同坐/streak、米色 How shall we sit?、hint 侧面、Sound gated、Hints 薄荷绿+用途简介、Choose pingpong+叠化、Honesty Idle 补登、LightProgression、Ambient Rim（砍宣传）均 **测试 OK** → 已关 `TEST_TRACKER`。同日续：**Reflection 结束三问** + **Safari Companion 横排**用户书面基本顺利 → 已关；意图回显口径写明为「本场 Choose → Reflection 面板顶」。仍开：「?」朱砂红点（用户倾向改挂系统通知/alert，待拍板）
- **「一分钟呼吸」微仪式 · Idle 接入（2026-07-22）**：`#micro-ritual-idle-entry`（青绿立体 secondary，Sit 上方）→ 60s 吸/呼文案 + smiling@4fps + **光环/Yin 与文案同拍（5s 周期）** → `recordCompletion(1)` + `markToday(1)` + SessionComplete 摆尾 + **中置** toast；进行中 **FocusHUD 直播**墙钟/同坐条/金环（不启 FocusSession）；中途 Leave 安静退出；留存仅 `micro_ritual_complete`。e2e：`e2e/micro-ritual.spec.js`；**同日午**：修仪表不动 + toast 底栏夹缝不显眼
- **「?」朱砂未读点（2026-07-22）**：用户确认保留「?」角朱砂点表示未读；不改挂提醒/通知
- **「一分钟呼吸」微仪式 · 方案调研（2026-07-22）**：方案文档 `MICRO_RITUAL_PLAN.md`（已实现，见上行）
- **应用内提醒偏好 + 横幅 UI 方案 A 已定稿并实现（2026-07-22）**：用户拍板方案 A——设置入口为**右上角时钟图标**（`ReminderPreferenceUI`，挂 `document.body`，紧邻 Ambient 静音钮：静音 `right:14px`，本钮 `right:66px`），**不进热力图 cluster**、始终可见（非 Idle-only）；横幅 `InAppReminderBannerUI` 挂 `#ui-overlay` 顶部居中；`reminderPreference` 本地存 `{ hour, minute }` 或 `null`（**无 `enabled` 字段**，存在即开启）；`evaluateInAppReminderBanner` 在「已设置 + 已过提醒时分 + 今日未完成」时返回 `{ shouldShow, messageKey: 'reminder.gentle_waiting' }`；`InAppReminderBannerController` 忙碌时默认 `busyPolicy:'suppress'`（隐藏不排队；`defer` 方案 B 备选未启用）；已接 `resyncSessionChrome` / `visibilitychange` 回前台 / 冷启动 / `stateManager.onChange`；完成判定用 `DailyCompletionStore.hasCompletedToday()`（含 Honesty / 微仪式）；DEV：`window.__inAppReminder`
- **留存漏斗骨架（2026-07-22）**：`docs/RETENTION_FUNNEL.md` + 本地 `RetentionTelemetry`（`console.log` 占位，无 UI、无第三方；正式工具暂不选型）；事件：`app_first_open` / `first_session_complete` / `day1|3|7|30_return`（窗口内首次返回）/ `dormant_bridge_shown|accepted|declined` / **`micro_ritual_complete`**
- **Cloudflare Workers 骨架（2026-07-22）**：`focus-tiger/cloud/` 独立包（`wrangler` + TS）；stub `POST /api/daily-message` / `POST /api/emotion-weight` + 字段校验 + 内存限流；**未接前端**。本地 `cd cloud && npm run dev`；接口字段待人工 review（见 `cloud/README.md`）
- **「本周陪伴」7 格热力图 UI（2026-07-22）**：Idle 常驻左下（`?` 上方）；`getLastNDays(7)`；亮格=`null|/>0`；无文案/无点击；e2e `weekly-practice-heatmap.spec.js`
- **PracticeDaysStore 多日时长（2026-07-22）**：`days: { date, totalMinutes }[]`（旧 `string[]` → `totalMinutes: null`）；`getLastNDays(n)` 补缺口 0；写入仍走既有 `onPracticeDay`；见 `SHARED_RESOURCES` §1.2
- **「本周陪伴」热力图 · 第 1 步调研（2026-07-22）**：`DailyCompletionStore` 仅当日不够；数据源改 `PracticeDaysStore`
- **静默失败排查 · 批 1–3（2026-07-22）**：StateManager warn-only；Honesty 禁 `?? 30`；门闩一体包（`resyncSessionChrome` 可扩展源 + Picker Gate 通过后才写 storage；删 BREAK）。批 2–3 待人工验收。
- **开场 Idle + 默认 Mer-Ka-Ba（2026-07-21）**：登录后第一幕改为闭目坐禅（不上 Sleeping）；默认开播背景音乐，右下角显眼「打开/关闭音乐」随时可关
- **Honesty 首屏措辞（2026-07-21）**：邀请式补登提示仍挂零完成；开场视觉已改 Idle
- **UI Kit / 主 CTA（2026-07-21）**：产品壳 **Sit / Sound** 由朱红改为**蒲团橙**（与 Yin 坐垫同系）；v6 产品舞台 + Companion 暖米文案面；成就/图鉴仍仅探索（Backlog）
- **Hints 薄荷绿恢复 + 「?」用途简介（2026-07-21）**：提示气泡从奶油米黄改回浅绿灰（与控件米黄区分）；点「?」另出非遮罩 App 用途简介卡
- **FocusHUD 金环+呼吸光（2026-07-21）**：左上角弱化数字感——金环进度 + 中心呼吸光点跟 focusLevel（已弃香炉碗/烟）；琥珀金加对比、光点明显一张一缩、整块约 2×；% 悬停才露；时长默认淡；见 `DESIGN.md` UI Kit 节
- **FocusHUD 今日同坐 progress-bar（2026-07-21）**：UI Kit 软条挂入 HUD 下方；「今日同坐」= 已完成+当前会话 / 25 分钟软顶；专注中轻脉冲；**不**接线 daily-quest-card
- **Companion 预选回流开表（2026-07-21）**：先点 Here & Now / Flow → Arrival → Skip begin 或 Choose 后**自动 Focusing**（`pendingAutoStartMode`）；不再逼点 Sit。e2e A2/A3

- **Idle 两段 pingpong（2026-07-20 验收通过）**：`idleBreathClosed` ×2 → `idleBlinkArc` ×1；同源 51 帧素材；段间硬切；用户书面测试 OK
- **N15（2026-07-21）**：Bug 修复 = 代码/措施 + **相关文档同批** + **立刻本地 commit**（强制；见 `DEV_WORKFLOW_QUALITY.md`）
- **Celebrating / 同日 SessionComplete（2026-07-21）**：**已复测通过**（首次舞 + 同日二次只摆尾）
- **DEV 一键重置**：改为 **L-logic**（`localStateKeys.test.js` 并入 `test:smoke`）；另有「重置并 idle 坐禅」快捷入口
- **cloak-sleep 进 DORMANT（2c）**：已接线；当日首次/转换播披毯→sleeping；**2026-07-22** 人工 OK（含 sleep→wake）
- **Rise → `rise-stretch-casual` one-shot**（Reflection 期间 holdPose）；`blink-breathe` 仅调试
- **Skip — begin → 直接开计时 / Rise**（修半卡 Sit）；Choose 后 Companion **底部横排矮条**（点头后再展开，不挡鞠躬）
- **Idle 编排**：闭目 pingpong ×2 → 睁眼弧 ×1（取代旧 breath×5→idle-eye-glance 切序列）
- **「?」补救**：加大立体化 + 首次 `help-affordance` 气泡
- **Sit 误开 Honesty**：抬 Sit dock z-index + 抬高 Honesty 面板（点击层叠抢点，**不是**没 commit）
- **Choose**：去合十，改 16:9 `intentionNod`；确认瞬间立刻开门闩（修 Reading 后偶发无 Rise）
- **pingpong 顶点停留**：`rise-stretch-casual` / `blink-breathe` / `breath-halo-hq` 末帧补约 2 拍
- **文档根指针收敛**：`SCENARIO_TESTS` / `HONESTY_BRIDGE_CTA` / `ONBOARDING_HINTS` 权威均在 `focus-tiger/docs/`；仓库根同名文件仅为指针；720 底稿归档
- **3D Idle 警示/历史备份入库**：`tiger-meditate-closed.webp-292k.glb`、`tiger-meditate-closed.crimson-trim-307k.glb`（非正式运行时；见 `ASSET_INVENTORY.md`）
- **NEW_ASSETS_2026-07-18-B**：眼动/哈欠入库 Prompt 归档（正式 Idle 不调度）
- **CapCut 式叠代**：两段无法衔接的序列默认 1s 定格交叉淡化（`CAPCUT_DISSOLVE_MS`）；同源微切仍可用 `MICRO_CROSS_FADE_MS`
- Honesty 拍板 B；Companion 短句提示
- **开发质量工作流文档**：`DEV_WORKFLOW_QUALITY.md`（含 N6/N15 立刻 commit + 文档同步；§6.1 场景冒烟已落地）
- **场景 A–D 控制器冒烟**：`src/core/scenario-smoke.test.js` · `npm run test:smoke`（逻辑层；观感仍人工分列）
- **Playwright 场景 A/I/K DOM（Task 1）**：hint→Arrival；Here & Now / Offline / Flow **点选即开表**（含 Arrival 后预选）— `e2e/scenario-a.companion.spec.js`
- **Offline Space 统一开表（2026-07-21/22）**：三 Companion 模式点选/鞠躬后均自动 Focusing，**无需**二次 Sit；差异仅在离开提醒等会话内行为
- **dormantWake 试替（2026-07-21；人工 OK 2026-07-22）**：Honesty 睡醒改 `cloak-sleep` **倒放** @6fps；披毯入睡 + sleep→wake 串联已书面通过
- **DEV 一键重置本地状态** + **`docs/SHARED_RESOURCES.md`**（原 §6.3 / 6.4，已落地）
- **下一步（渐进）**：Playwright 扩更多 DOM 场景步骤；序列观感仍靠契约单测 + TEST_TRACKER 分列人工行
- **RESPONSIVE_LAYOUT.md（2026-07-21）**：移动浏览器权威基线——功能对等（竖/横屏逐步可操作、禁按钮失灵）、竖屏 P1 + 可建议横屏；`TEST_TRACKER` / `DEV_WORKFLOW_QUALITY` 已挂窄屏验收
- **响应式 UI 两项已立项（2026-07-21 用户拍板）**：① **Task 1 代码已落地**（互斥 + Sit 防截断，待人工）→ `task-responsive-narrow-onboarding-sit.md`；② 横屏建议 UI → `task-responsive-landscape-suggest.md`（Task 1 人工后再做）。见 `TASKS.md` 响应式节
- **工程加固四步（2026-07-21 拍板）**：见 `ARCHITECTURE.md` — ① JSDoc ② SessionUiGate ③ 回归锁 ④ Lit 试点 **`OnboardingHintsUI` 已接线**；**复测通过后先停试点、不扩面**（须另拍板才扩）；待人工复测尖角/补救全铺；禁止全仓 Lit / 动 Emotion·Idle
- **SessionUiGate**：`arrivalGateReady` / `completionPending` / 叠层占用收束；失败用例并入 `npm run test:smoke`

**已完成并验收通过的功能**（按仓库/对话实际交付填写，不含未落地的设计）：

- Companion Mode：Here & Now / Offline Space / Flow State **均**选中即开计时（须 Arrival 门闩就绪）；**「How shall we sit?」随时展开三选一**（`resolveCompanionHintClick` → toggle；**Sit** 未就绪时仍走 Arrival）
- Honesty `dormantWake`：选时长即播 `cloak-sleep` **倒放**（**6 fps**）定格末帧；暂不接闭眼呼吸淡入 / 金光 / halo
- 3D 场景骨架与专注基础环：Renderer / Scene、`FocusSession` 计时、随 focusLevel 变化的金色视觉反馈（历史实现为材质插值，按 2026-07-15 视觉原则该做法已废弃，重构并入「奖励柜」任务）、`StateManager` + HUD、主按钮「Sit with Yin / Rise」（与阿寅同坐 / 起身）交互
- 多姿态 GLB：`PoseManager` 预加载、包围盒归一化对齐、姿态切换过渡；调试与正式入口已收敛到 `EmotionController`
- 闭目坐禅 3D Idle 运行时已换为「单色暖浅灰棉麻禅修服 / 茶服风、无红边」：源文件（gitignore）`art-reference/models/sources/yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb`；运行时稳定路径仍为 `public/models/tiger-meditate-closed.glb`（约 **1.6MB**：贴图 1024/512 + lossless WebP + Draco、不减面；避免默认 WebP 压到 ~300KB 损伤织物细节）。旧「灰棉麻 + 深红镶边」保留为历史备份；2D 主线与图生视频 / 奖励柜 3D 统一以 `CHARACTER_BIBLE.md` Costume 为准
- IdleOrchestrator：闭目坐禅 = `idle-breathing`（**2.5 fps**）×5 → 单次眨眼 → 往复；张望/喝茶等为候选手势（非 Idle 池）
- Ambient Sound FAB：进应用即可见（body、z-index 22）；未 FOCUSING 点击提示须先进入专注模式；FOCUSING 才可开面板
- 双唤醒视觉分离：Honesty `dormantWake` 走 `cloak-sleep` 倒放；调试 `wakeUp` 用伸懒腰（stretch-reminder 同源）；Honesty 暂不接金光/halo
- IdleOrchestrator 五变体池曾接入后又撤回：现为候选陪伴手势目录（`companionGestureCatalog`），正式 Idle 仍仅呼吸×眨眼
- 动态效果层：`DynamicMotion`（呼吸起伏、绕 Y 轴旋转、庆祝悬浮）— **仅 3D 奖励柜**；2D 主界面调试面板已移除对应开关
- 「今日一炷香」完成反馈：`IncenseGreeting`（莲花渐显 + 金色粒子），经 `playEmotion('incenseComplete')` 触发
- `EmotionController.playEmotion()` 统一情绪桥：业务侧不直连 PoseManager / DynamicMotion；映射表含已实现态 + 大量占位态
- 鼠标/指针刺激检测：`PointerInteraction`（靠近 / 点头 / 抚摸分阈值 / 绕圈 / 静止歪头 → `playEmotion`；Celebrating 期间摸头忽略）
- 眼睛跟随：`EyeTracking` 实时瞳孔跟随 **已废弃（2026-07-19）**，原因见 `CORE_LOOP.md`；看向某处改由 Idle 离散张望 gaze-p1～p4
- 文档体系：`PRODUCT_POSITIONING` / `MVP_PRODUCT_DEFINITION` / `PRINCIPLES` / `ARCHITECTURE` / `DESIGN` / `EMOTION_BIBLE` / `PROCESS` / `CHARACTER_BIBLE` / `TASKS` / `COLLAB`
- 工程路径命名已清理：`focus-tiger/` 内受 Git、代码、构建或工具链处理的文件名统一为 ASCII 英文；原中文/特殊省略号命名的参考图和历史任务稿已改为英文 kebab-case，中文内容仍保留在文档正文中
- `PRINCIPLES.md` 已新增「路径必须使用英文 ASCII」硬性规则：未来新增文件/目录统一采用小写 `kebab-case`，用户素材与压缩包须先按语义重命名再入库；always-applied 项目规则已同步。现存路径审计未发现中文、空格、括号或省略号，但严格 kebab-case 审计发现 281 个历史遗留路径，暂仅记录、不在本 Task 重命名
- 产品定位文档 `PRODUCT_POSITIONING.md` 已纳入项目：确立正念伙伴（非传统电子宠物）、regular practice at your own pace、宁静型游戏化、三级完成反馈与只增不减的共同经历/纪念奖励；产品语义层级高于 `DESIGN.md`
- `.cursor/rules/focus-tiger-docs.mdc`：项目级规则 `alwaysApply`，权威文档摘要兜底
- 多语言骨架：`src/locales/i18n.js`（`t` / `tPool`）；`zh.json` / `en.json` 均已填充完整；产品默认语言已改为英文（面向海外市场），中文作为可切换语言保留
- 角色分工写入 `PROCESS.md`（Architect / Three.js / Gameplay / UI / QA）
- Git 半自动同步护栏：`PROCESS.md`「Git 同步节奏」、`./scripts/git-sync-safe.sh`；Agent `stop` 的 macOS 系统通知钩子已于 **2026-07-21 关闭**（脚本仍保留于 `.cursor/hooks/remind-git-sync.sh`，hooks.json 的 `stop` 为空；**不**自动 push）
- `wave-hello` 挥手序列已替换为新服装正式版（19 帧，`frame_001.png` ～ `frame_019.png`）；旧深红袈裟 14 帧素材已下线移除；`SpriteSequencePlayer` 对接与 `playEmotion('welcomeBack')` 接线保持不变（分层路径规范见 `ARCHITECTURE.md`）
- `CHARACTER_BIBLE` Master Character Prompt 已按 `wave-hello`、`tilt-think` 等正式素材同步为暖浅灰棉麻单肩斜襟服装，补全颜色、织纹、光泽与剪裁约束，并明确排除旧版深红布料、红色镶边及未获批准的服装莲花刺绣；`DESIGN.md` 材质说明同步更新
- `SpriteSequencePlayer` 首版：单 `<img>` 预加载换帧、rAF 帧率控制、循环/末帧停留、立即打断、播放完成回调、逐帧额外停留配置；`waveHello` 已经 `playEmotion('welcomeBack')` 接线，第 8 帧抬手顶点额外停留 400ms，并完成 Vite 浏览器运行验收（播放、循环、停止、播完淡出回落 `Idle`）
- 角色/装扮可替换架构预留：`CharacterConfig.js` 为外观标识与素材路径拼接唯一出口（默认 `tiger-cub` / `monk-robe-default`）；素材按 `sprites/{characterId}/{outfitId}/{animationName}/frame_NNN.png` 分层入库；清单只存动作名 + 帧数，播放器按当前外观实时解析路径（本阶段不做换装 UI）
- 三类非模态提醒运行时链路：`ReminderQuotaManager` 按用户本地自然日持久化共享额度（`MindfulAcknowledge` / `stretchReminder` / `Re-focus Acknowledge` 合计每日最多 3 次）；`AttentionSignals` 合并并去重 visibility + blur/focus 离开事件（20s 候选记账、超过 60s 回归展示）；`MindfulReminderController` 实现 20 分钟阶段确认、活跃累计 2 小时舒展提醒、Re-focus 每会话最多 1 次及强反馈静默让位；三类提醒复用 `MindfulAcknowledgeToast` 非模态 UI 与观察式中英文文案池。新增 11 项单元测试并通过，生产构建通过
- Tiger Reflection Moment（结束反思）MVP：会话结束后（正常完成在庆祝完整播放并回归坐姿后留白淡入；主动结束不播完成反馈、短暂留白后淡入）逐题展示三问（今天注意到什么 / 有哪些情绪来访 / 下次想把注意力带回什么），每题独立可跳、Skip 与 Continue 同级、Esc 整体划过；无提交/必填/进度数字等表单元素；仅非空答案本地保存最近 5 条（`focus-tiger.reflections.v1`），全部跳过不落记录，不做标签化/统计。`TigerReflectionMoment` + `ReflectionFlowState` + `SessionEndFlow` + `Storage` JSON 封装，5 项单元测试与浏览器全路径验收通过
- Honesty Check-in / DORMANT：`DORMANT_IDLE_HOURS`（默认 **2**）滚动窗口——距最近一次专注结束（达标或 Rise）≥ 该时长 → 惰性进入 `STATES.DORMANT`；新用户无结束记录不触发；当日首次进 DORMANT 播 `cloakSleep` 正放再 `sleeping`。Honesty 从睡态补登仍走 `dormantWake`；`DailyCompletionStore` 与正常计时共用；不占共享提醒池。`getLocalDateKey` 抽至 `utils/localDate.js`
- `Celebrating` 2D 正式素材：`celebrate-dance`（57 帧，`loopMode: none`）一次性叙事弧线（起身→慢速舞+小金光→施礼）；播完 EmotionController 回归 idle-breathing；会话结束时序改由序列 `onComplete` 驱动（不再固定 4s）
- `Sleeping` / DORMANT 2D 正式素材：`sleeping`（8 帧，`loopMode: forward`）持续循环；首尾帧衔接抽样可接受，试播若跳帧再改 pingpong；替换原纯 GLB 占位表现
- 2D 主线默认隐藏 3D canvas（`PoseManager.setCanvasHidden`）；透明精灵后不再露出垫底模型；GLB 仍保留给奖励柜
- `idle-breathing` **约 2.5 fps**（放慢 2×）+ 每 5 循环眨眼一次；`sleeping` **约 1 fps**
- `Smiling` / `Blink` 接入 `blink-smile`；Idle 自发变体含 blink-smile；Honesty 唤醒后接 `haloBreathing` 奖励呼吸
- 一炷香莲花/金斑改 DOM 叠层（`#incense-fx-overlay` z-index 4），保证在 2D Yin 前方
- Honesty Check-in UI：Mindful Check-in 标题加粗加深、呼吸面板与 Sit with Yin 按钮立体化
- `dormantWake` 2D 正式素材：同源 `dormant-wake` 16 帧一次性正放（深睡→完全清醒坐姿）；呼吸引导期间保持 sleeping，sleeping→wake 与 wake→idle-breathing 均采用 180ms 双图层 cross-fade；末帧短暂停留，完整回落由序列 `onComplete` 驱动，既有 FocusVisualizer 金光继续作 Rim Light 重构前占位
- `nodGreeting` 2D 正式素材：`nod-greeting` 23 帧一次性点头致意；`PointerInteraction` 靠近检测（半径/滞后/节流）已就绪并改接本键，播完回归 idle-breathing；原 `lookAtCursor` 保留为兼容占位
- `curiousTilt` 静止好奇：默认视觉改为 `blink-smile`（替代托腮 `tilt-think`）；靠近区静止 4 秒触发，冷却 6 秒；180ms cross-fade
- `SessionComplete` 正式动作层：`session-complete` 28 帧完整叙事摆尾（约 2s、`loopMode: none`；光环/粒子已烧录）；完成前查询 `DailyCompletionStore`，每日首次只触发 `Celebrating`，同日后续只触发 `sessionComplete`；播放期归零 FocusVisualizer / Rim Light，播完回归 idle-breathing 后再进入 Reflection Moment
- `MilestoneGlow` 调试预览：`milestone-glow` 27 帧完整叙事（金光+蝴蝶已烧录，无独立 DOM 层）；末帧固定停留 2.5s 后回落；播放期同样归零实时金光；真实里程碑判定仍属 Backlog「纪念奖励系统」
- Session Intention / Arrival Practice v2 MVP：Sit → 欢迎（blink-smile）/ Notice 点选（不落库）/ ~5s 呼吸 / Choose（图标+打字，`intentions.v1`+source）→ Companion Mode → 再 Sit 计时；Skip / Skip — begin；Reflection 按来源回显；见 `CORE_LOOP.md` / `ARRIVE_MOMENT_DESIGN.md`
- 光影物理渐进（2D）：`LightProgression` — Arrival 冷→暖、三层视差 Dolly（背景 1.06 / Yin 1.12）、4s 呼吸光环、Choose 坐垫光晕；日常 `focusLevel`→DOM Rim；Recover/Re-focus 扰动+约20%亮度下降、5s平复；原则写入 `PRINCIPLES` / `ARCHITECTURE`；详规 `LIGHT_PROGRESSION_DESIGN.md` / `task-briefs/task-light-progression-parallax-rim.md`；初稿 Re-focus 安慰句未过观察式自检，继续用 `REFOCUS_ACKNOWLEDGE` 池
- `MindfulAcknowledge` 正式动作层：`nod-bow` 13 帧克制点头鞠躬（`loopMode: none`）；20 分钟阶段确认与 Re-focus 通过同一 `mindfulAcknowledge` key 播放，Re-focus 仅传 `subtype: 'refocus'`；强反馈检查仍在申请额度和播放动作之前，冲突时静默让位且不补发；播完回归 idle-breathing
- `stretchReminder` 正式动作层：17 帧 `stretch-reminder` 坐姿张臂舒展序列（`loopMode: none`），复用既有活跃累计 2 小时触发、共享额度、非模态文案与强反馈让位链路，播完回归 idle-breathing。归属判定依据：该序列从清醒坐姿起势并向外张臂，现有 16 帧 `dormant-wake` 从侧卧熟睡过渡为清醒打坐；起始姿态、动作弧线、构图和帧数均不同，故按情况 A 独立入库，不替换 Honesty Check-in 动作
- 播放器层候选素材（尚未绑定 emotion key / 业务触发）：`halo-breathing` 30 帧与 `blink-smile` 12 帧已按统一 `frame_NNN.png` 规范入库；播放器新增 `startFrame` 子序列支持，并注册 halo 方案 A（001–006 once → 007–030 pingpong）、方案 B（001–030 pingpong）及 blink-smile forward 技术试播定义。端点检查显示 halo 030→007 差异约为相邻帧中位数的 2.46 倍，blink-smile 012→001 约为 4.22 倍，二者均暂不接入正式调度
- 2026-07-18 五套新素材（见 `docs/NEW_ASSETS_2026-07-18.md`）：`celebrate-dance-v2` 作 Celebrating 50/50 变体；`palms-together` 接 `intentionSet`（Choose 确认，与坐垫 CSS 光晕叠加）；`breath-halo-expand` 作 MilestoneGlow 简化备选（仅登记）；`lotus-front-rising` / `lotus-chest-halo` 仅入库（纪念奖励 Backlog）
- 2026-07-19 12:56：上述及相关共 **14** 套序列用新抠图算法整批重出并覆盖入库（帧数/接线不变；旧版作废）；见 `ASSET_INVENTORY.md`
- 美术/动画全量盘点（2026-07-18）：`docs/ASSET_INVENTORY.md` + Canvas `focus-tiger-emotion-asset-inventory`；19 目录 / 407 帧；相对 07-17 新增 5 套

**明确未完成（勿当作已验收）**：

- 完整 Focus Confidence V1 运行时信号链路（可信度分值与 idle 检测）仍未实现；Re-focus 所需的最小 visibility + blur/focus 信号切片已由 `AttentionSignals` 落地
- 大部分互动情绪的真实动画（摸头/绕圈等）；正式瞳孔 PNG 已接入
- Session Intention / Arrival Practice v2（✅）：Sit → 欢迎/Notice/呼吸/Choose → Companion Mode → 再 Sit 计时；Notice 不落库；Choose `intentions.v1`+source；Reflection 按来源回显；见 `ARRIVE_MOMENT_DESIGN.md` / `CORE_LOOP.md`
- `SessionComplete` 的非模态观察式文案尚未实现；情绪键、2D 动作、完成事件分流与自动回落已完成
- `MilestoneGlow` 真实里程碑判定与业务触发尚未实现（27 帧素材与调试预览键已接入；FOCUSING 日常光环呼吸律动仍待正式 Rim Light 路径），归属 Backlog「纪念奖励系统」
- 角色/装扮可替换**完整功能**（用户可选换装 UI、多套角色/装扮素材）尚未实现；`CharacterConfig` 架构扩展点与素材路径/情绪触发解耦已落地
- DORMANT 唤醒仪式的 Rim Light 正式重构仍待替换既有 FocusVisualizer / setFocusLevel 占位光效；`dormantWake` 真实 2D 睡醒序列已接入
- Phase 0 清单中的持久化（除当日完成记录外）/ PWA 等（见 `TASKS.md`；DORMANT 唤醒仪式已摘出，见上条）

**正在进行 / 最近决定的事项**：

- **响应式 UI Task 1（代码已落地 · 待人工）**：窄屏 onboarding 互斥 + Sit 不截断 — Brief `task-responsive-narrow-onboarding-sit.md`；`TEST_TRACKER` 两行待复测
- **响应式 UI Task 2（待开发，排在 Task 1 人工验收后）**：竖屏横屏建议条 — Brief `task-responsive-landscape-suggest.md`

- 技术路线已从「3D 多姿态 GLB 主线」切换为「2D PNG 序列主线」；3D 定位为奖励柜
- `EMOTION_BIBLE` 持续扩充：互动清单、MindfulAcknowledge、自主/响应分层、多语言规范
- `CHARACTER_BIBLE` 已归档 Master Character Prompt，并澄清 Rive / 双莲花 / 蒲团 / Suffix Prompt
- 指针检测与眼睛跟随的**检测/跟随逻辑已接线**，视觉表现多为占位，待后续真实素材
- **产品市场定位已明确**：优先面向海外市场，产品名统一为 `Focus Tiger`，UI 默认语言由中文改为英文，中文作为可切换语言保留；dev-only 调试面板不纳入字典并保持原样
- **无互动约 10 分钟已拍板**：保留加权随机（70% 继续冥想 / 30% 挥手），挥手分支使用已入库的 `wave-hello`；具体触发计时源仍待与 Focus Confidence 决策口径统一
- **架构决策已落地**：为应对角色/装扮市场接受度不确定性，提前预留「角色/装扮可替换」扩展点（`CharacterConfig`）；当前仍固定单一角色（小老虎僧袍造型），不做用户可选换装 UI，仅解耦素材路径与情绪触发逻辑
- **非模态提醒额度与 Re-focus 阈值已拍板并实现（2026-07-16）**：正念阶段确认 / 伸懒腰判定维持会话墙钟 20 分钟、活跃累计 2 小时（离开时暂停、两场会话间隔 ≥30 分钟重置累计）；三类提醒共用本地自然日额度、合计每日最多 3 次；Re-focus 每场会话最多 1 次；离开满 20 秒只内部记账，超过 60 秒并返回才允许展示。具名常量与单元测试已落地
- **已确认**：Git 采用「Task 后 commit + 人工确认再 push」，禁止 post-commit 自动 push
- **Git 提醒已关闭（2026-07-21）**：此前 `stop` hook 曾用 `followup_message`（耗 credits），后改为 macOS `display notification` 且只返回 `{}`；现按用户要求从 `hooks.json` 卸下，不再发系统通知；脚本保留便于日后挂回
- **已确认并实现**：新增 `welcomeBack` 情绪键；`SpriteSequencePlayer` 首版使用单 `<img>` 预加载换帧；2D overlay 覆盖于现有 3D canvas 之上
- **视觉原则修正已拍板（2026-07-15）**：角色本体固有色恒定不变，金色进度改由外围光环/环境光反射（Rim Light）表达，禁止本体重着色。改动范围：只改文档确立新原则（`DESIGN` / `PRINCIPLES` / `ARCHITECTURE` / `EMOTION_BIBLE` / `TASKS` 已同步），2D 主线金色表达定义为「金色光晕 overlay + 粒子」写入 `ARCHITECTURE`；3D shader（`TigerCharacter` 灰→金插值、`Constants` 命名）仅留 TODO 标注不重构，重构并入未来「奖励柜」任务；历史任务书保留原文 + 顶部注记
- **产品定位 V1.0 已定稿（2026-07-15）**：角色对外统一为 Mindful Companion，不采用喂养、健康退化、照料责任或宠物收集叙事；`daily practice` 改为 `regular practice, at your own pace`；庆祝统一为「短暂、温暖、有情感」；每次完成轻量确认、每日首次达标完整庆祝、长期里程碑纪念奖励；「小老虎更健康」改为共同经历增加、环境细节解锁与永久纪念物
- **产品定位与核心成长模型已升级（2026-07-16）**：`PRINCIPLES` 新增中英一句话定位与差异化表达——Focus Tiger 不是又一个番茄钟 App，而是 AI 时代帮助人类重新训练注意力、觉察力与内在自由的正念陪伴伙伴；核心逻辑升级为「觉察 Awareness → 专注 Focus → 心流 Flow → 内在成长 Growth（小老虎陪伴）」，并明确专注不是最终目标，而是训练觉察能力的一种方式；该模型作为 `EmotionController`、`MindfulAcknowledge` 等后续功能的上位指导原则
- **Session Intention 已拍板（2026-07-15）**：开始专注前可选单行意图输入（可跳过、不减反馈、仅会话内显示 + 结束语回显、本地保存最近几条），不参与达标判定、不做待办管理器；已立项为 `TASKS.md` Phase 1 任务十，排队开发（建议排在 `SessionComplete` 之后衔接结束语）；定量公开目标维持现状（目标时长 + 一炷香），Focus Confidence 分值继续不直接展示
- **环境细节解锁方向已拍板（2026-07-15）**：莲花池（5 天首朵、10 天第二朵、逐步至满池）、小香炉（3 天，一炷香烟从香炉升起）、蒲团刺绣（30 天）、夜间小灯笼 + 白天小茶盏（60 天成对）；不采用背景远景类添加（保持极简空灵）；只增不减、永久保留；详见 Backlog「纪念奖励系统」，具体实现待该任务排期
- **核心正念原则与语言规范已确立（2026-07-15）**：`PRINCIPLES` 新增「观照者而非情绪本身」——一次性/响应性情绪必须自动回归坐姿呼吸基底；`EMOTION_BIBLE` 新增观察式措辞规范（描述现象、不贴标签、不追因、不建议）及六场景中英示例，未来所有非模态文案必须通过四项自检
- **Re-focus Acknowledge 最小运行时已落地（2026-07-16）**：作为 MindfulAcknowledge 特化子类型，用户从超过 60 秒的页面离开返回时复用统一非模态文案条，按观察式文案呈现；与强反馈冲突时静默让位、不补发。该最小链路不等同于完整 Focus Confidence V1，后者的 idle 检测与可信度分值仍未实现
- **MilestoneGlow 里程碑金辉时刻已定稿（2026-07-15，仅文档）**：长期里程碑节点（连续 7/21/100 天、累计时长等）的仪式性反馈，比 `Celebrating` 更隆重一档（优先级 110）；10s 分镜定稿：呼吸律动金光 → 全身金色 Rim Light 勾勒 → **一只金光蝴蝶**环绕（原「几只萤火虫」已修订）；老虎全程闭目坐禅不做动作，与每日 `Celebrating` 的社交性庆祝分工明确；蝴蝶为一次性过场、随金光淡去不留驻；视频源已产出，抽帧与实现归属 Backlog「纪念奖励系统」。同时拍板：分镜前段的「金光随呼吸律动」（吸气收敛/呼气晕染，同步 4s 呼吸循环）定义为 FOCUSING 光环**通用行为**，已写入 `DESIGN` / `ARCHITECTURE` / `EMOTION_BIBLE`
- `waveHello` 真实序列已通过 `EmotionController.playEmotion('welcomeBack')` 接线，支持 rAF 帧率控制、循环/末帧停留、立即打断、预加载及播放完成回落 `Idle`
- **结束反思两项措辞/时序已确认（2026-07-16）**：反思问题三采用「下次想把注意力带回什么」而非「明天」，避免暗示每日义务（与 regular practice, at your own pace 一致）；`IncenseGreeting` 产品语义为「今日一炷香完成」，**不**在用户主动提前结束时播放，主动结束路径直接回归坐姿后淡入反思面板
- **MVP 产品定义补充已校正并纳入（2026-07-16）**：新增 `MVP_PRODUCT_DEFINITION.md`，将首要用户、JTBD、竞争替代品、成功指标、付费与隐私从旧补充稿整理为产品策略基线；删除“每日回来”“小老虎随用户成长/退化”“AI Coach/情绪分析默认进入 Premium”等与当前原则冲突的表达，并把未经验证的人群、数字目标、价格和付费形态明确标为假设
- **Honesty Check-in / DORMANT 唤醒仪式已定稿（2026-07-16）**：DORMANT 改为「当日自然日尚无任何已完成会话」；可忽略提示 `Did you practice elsewhere?` → 选 10/20/30+ 分钟 → 10s 呼吸引导 → `WakeUp`（伸懒腰 + 既有 Rim Light）；补登与正常计时一视同仁、无验证语气、不占共享提醒池、不设每日次数上限。旧「连续 3 天 + 1 分钟唤醒且不计会话」口径废止；`PRINCIPLES` 新增「诚实机制」，`DESIGN` / `EMOTION_BIBLE` / `TASKS` 任务五已同步
- **新增设计并排期开发「打卡返还 & 唤醒仪式（Honesty Check-in）」功能**：允许用户手动补登在其他场景完成的专注/正念练习，体现产品「诚实机制」设计原则，与核心视觉原则（Rim Light 金光反射）对接；**MVP 运行时已落地**（情绪键 `dormantWake`、当日完成记录、可忽略提示与 10s 呼吸引导）；光效暂用 `FocusVisualizer` / `setFocusLevel` 占位，Rim Light 重构后替换
- **Honesty Check-in 拍板四项（2026-07-16）**：新建 `dormantWake` 不复用 `wakeUp`；`30+` 按 30 分钟记账；`getLocalDateKey` 抽至 `utils/localDate.js`；未达标 End Focus 保持 DORMANT、不写完成记录、无失败/未完成类文案
- **Companion Mode（专注会话陪伴模式）已定稿并实现 MVP（2026-07-16）**：Start 后先选 Stay here / I'll step away；`FocusSession` 墙钟计时；step-away 下 `suppressAwayReminders` 关闭 Re-focus（仍暂停活跃累计）；达标复用 `celebratePending → CELEBRATE → SessionEndFlow`；回页 `visibilitychange` 校正完成。与 Honesty Check-in 独立
- **Companion Mode 三选一扩展已定稿（2026-07-16，仅文档）**：识别 Focus Confidence「标签可见=专注」对知识工作多工具切换的系统性误判；新增第三子模式 **I'm working across tools**（关离开类提醒、宽松 idle 兜底建议 ≥30 分钟、墙钟计时）；对策为用户自主声明（诚实机制）而非技术探测。运行时 UI / 代码待交互拍板后另开任务
- **Companion Mode 三选一运行时已落地（2026-07-16）**：Sit 下提示「How will we do this?」向上展开；选模式只预选不开始；Sit 才计时；`localStorage` `focus-tiger.companion-mode.v1`；across-tools 用 `suppressAwayReminders` + `AcrossToolsIdleGuard`（30min）
- **核心交互按钮文案已更新（2026-07-16）**：`BTN_FOCUS_START` / `BTN_FOCUS_STOP` → Sit with Yin / Rise（与阿寅同坐 / 起身）；正常完成与中途结束共用「起身」，不做完成/放弃区分。原则见 `EMOTION_BIBLE`「核心交互动词」
- **产品命名 Backlog 已记录（2026-07-16）**：当前阶段保持「Focus Tiger」不更名；建议副标题承载更深定位；完整更名待用户反馈后评估（见 Backlog「产品命名」）
- **角色正式名落定（2026-07-16）**：中文「阿寅」、英文「Yin」（`CHARACTER_BIBLE` + i18n `CHARACTER_NAME`）；`characterId` 仍为 `tiger-cub`；用户自定义改名标为远期 Backlog（`DESIGN`「老虎的名字」）；文档通称「小老虎」不替换
- **禅意背景音（Ambient Soundscape）功能已确认排期开发（2026-07-16）**：追踪 Focus Tiger 自身播放音频的实际时长，并转化为金光 / Rim Light 强度增强信号；与 Companion Mode 独立、互不依赖；设计原则见 `DESIGN.md`「禅意背景音」
- **禅意背景音 MVP 已落地（2026-07-16）**：角落展开 UI；**Mer-Ka-Ba**（Jesse Gallagher）/ **Meditation Impromptu 02**（Kevin MacLeod）两档，YouTube Audio Library；`presenceBoost` 叠视觉；归因见 `public/audio/ambient/ATTRIBUTION.md`
- **无角色语音原则已落档（2026-07-16）**：沟通仅文字（非模态文案等）；禁止真人配音与 lip-sync；长期原则、非 Backlog（见 `PRINCIPLES.md`）

**下一步计划**：

- 为 Ambient Soundscape 替换正式 CC0/授权禅意音效；有合适素材后再补第三曲（磬等）
- 为 Honesty Check-in 的 `dormantWake` 接入真实伸懒腰 2D 序列，并将占位光效替换为 Rim Light 正式路径（待核心视觉重构）
- Companion Mode 与 Session Intention 已在同一预开始 dock 视觉合并（意图在上、三选一在下）；暂不另建独立 BeginPanel 类
- 为已完成动作层的 `SessionComplete` 补非模态观察式文案（每日首次仍由 `Celebrating` 替代）
- 按同一 manifest / player 接口逐步接入后续 2D 情绪序列
- 补正式瞳孔 PNG，调 `EyeTracking` 锚点与偏移 → **已放弃（2026-07-19）**，见 `CORE_LOOP.md`；勿再排期返工
- 后续独立实现完整 Focus Confidence V1（idle 检测与可信度分值），不得把页面切换直接解释为用户心理状态；须遵守 Companion Mode 三选一与 across-tools 边界
- 扩展 PointerInteraction：鼻子 Boop、拉尾巴、抚摸分阶段递进（文档已有，代码未全覆盖）
- 按需推进 `TASKS.md` Phase 0 未完项（勿与 2D 主线混做）

**已知的开放决策 / 待确认事项**：

- **「?」朱砂红点用途（2026-07-22）**：用户书面——红点应「用于系统里面的通知，或者 alert 之类的」。现实现仍挂 onboarding「?」未读提示。待拍板：改挂应用内提醒/通知，还是保留引导未读角标。
- **应用内提醒横幅 · 待确认**：方案 A（右上角入口 + `busyPolicy:'suppress'`）已实现并接线完毕，**待人工浏览器验收**（见 `TEST_TRACKER`）；**开放决策**：忙碌抑制策略 suppress（方案 A，隐藏不排队，当前默认）vs defer（方案 B，忙时记 pending、回非忙碌态后补展示一次）——目前采用 suppress，如需改为 defer 只需 `InAppReminderBannerController` 构造参数 `busyPolicy: 'defer'`（逻辑已实现并有单测覆盖，仅未启用）
- **「本周陪伴」7 格热力图（视觉验收）**：Idle 左下已挂；请人工看亮/暗对比是否「不羞辱」（暗格仅为浅色，非惩罚）
- across-tools 宽松 idle 兜底频率微调（当前常量 30 分钟，可再拍板）
- Idle 五变体相对权重已写入 EMOTION_BIBLE（gaze 1.0 / tea 0.5 / yawn 0.3 / ear 0.2）；试玩后可再调
- **回归姿态（2026-07-19 已拍板软化）**：一次性情绪播完回归「类似坐禅」即可，不强制像素对齐默认闭目 idle 第 1 帧（见 `PRINCIPLES.md`）
- **EyeTracking**：已正式放弃（2026-07-19），原因见 `CORE_LOOP.md`；勿再开返工任务
- **14 套新抠图（2026-07-19 12:56 已入库）**：含 `palms-together` 等，待人工复测透明边/灰斑是否干净
- 打坐呼吸 ↔ `tilt-think` 若仍跳跃：是否用眨眼类首尾相接循环替代托腮素材（`curiousTilt` 默认已改 `blink-smile`）

**最近拍板（2026-07-18）**：Recover 家族 = Re-focus + 未来主动 Recover；`welcomeBack` 为 Idle 偶遇、不进家族；代码/限频继续分开（见 `CORE_LOOP.md`）。

**Backlog（仅列名，详情见下文 Backlog 章节）**：

- 纪念奖励系统（金牌/环境细节 + 3D 塑胶公仔展示）
- **荷花成长场景**（复用 `IncenseComplete` 立体荷花 + 金斑浮动；荷花持续增加至布满画面）
- Focus Confidence 未来数据源扩展（含：多工具切换 vs visibility 冲突 → Companion Mode 三选一 / across-tools 决策点）
- **系统级健康中枢读取**（HealthKit Mindful Minutes / Health Connect MindfulnessSession；Phase 1 规划；补充诚实机制、非替代；详见 `ARCHITECTURE.md` Backlog）
- Browser First（插件 / 系统级监控等）
- 节奏敲击正念小游戏（「数字木鱼」）
- 角色/装扮可替换性完整功能（用户可选换装 UI、多套装扮/角色素材产出）— 架构扩展点已预留，功能本体待市场反馈后排期
- 角色边界待观察事项

---

## 分阶段开发纪律

原则不变：**一次只做一个任务**，做完充分测试再继续，禁止跨阶段并行开发。

（详见 PRINCIPLES.md 原则一。）

---

## Task Brief 存放约定

各 Task Brief 统一存放于 `docs/task-briefs/`（目录结构见 ARCHITECTURE.md）。

命名建议：`task{编号}-brief-{关键词}`

---

## Git 同步节奏（本地 ↔ GitHub）

Git **默认不会**自动把本地 commit 推到 GitHub；`commit` 只写本地，`push` 才会同步到远程。本项目**不启用**「commit 后自动 push」或「保存即 commit」——素材体积大、文案/产品决策迭代快，误推代价高。

### 推荐流程（半自动 + 人工拍板）

完成一个**有实质性进展**的 Task（非纯 debug / 微调）后：

1. 更新 `PROCESS.md`「当前进度速览」对应字段  
2. 更新 `TEST_TRACKER.md`（新增/修正验收行；UI 默认「待人工测试」）  
3. **同步相关权威文档**（N15：按触及面更新 `EMOTION_BIBLE` / `DESIGN` / `ARCHITECTURE` / `SHARED_RESOURCES` / `ASSET_INVENTORY` 等；禁止只改代码）  
4. `git add` 相关文件（**代码 + 文档**）→ **立刻自动本地** `git commit`（message 带 Task / Fix 关键词；**不必再问要不要 commit**）  
5. 运行仓库根目录脚本做推送前体检：`./scripts/git-sync-safe.sh`  
6. **在你明确同意后**再 `./scripts/git-sync-safe.sh --push`（或手动 `git push`）

Agent / Cursor 侧约定：

- **所有实质性 Task** 收尾：过完对应门禁后 **自动本地 `git commit`**，不必再问「要不要 commit」。  
- **Bug 修复**：代码或修正措施落地后，**同回合**文档 + **立刻** commit（N15）；缺一不可。  
- **未经用户口头/书面确认不得 `git push`**。  
- 完成消息须说明「本次有 N 项需要你测试」（见 `TEST_TRACKER.md`）。

闸门放在 **push**，不放在本地 commit：本地提交可回滚，未提交的「已修」才是假基线。

### 明确不做的自动化

| 方式 | 本项目态度 |
|---|---|
| `post-commit` 钩子自动 `push` | ❌ 禁止：易推送未审改动、大体量素材、密钥 |
| 保存文件自动 commit | ❌ 禁止：历史噪声大 |
| CI 自动 commit 业务代码 | ❌ 禁止 |
| IDE「定时同步远程」 | ❌ 不推荐 |

允许的辅助：推送前检查脚本、Agent 收尾提醒、Project Rules 兜底文案。

---

## 后续 Backlog（暂缓事项,已记录、未开工）

### Backlog:纪念奖励系统（金牌/环境细节 + 3D 塑胶公仔展示）

整合此前讨论的两个想法，合并为一个后续奖励系统功能：

- 用户达成明确的长期练习里程碑（如连续练习天数、累计专注时长等，具体规则待设计）后，获得**只增不减**的纪念奖励；中断不撤回奖励，不制造断签压力
- 奖励呈现形式包括：
  - **金牌/徽章**：需要独立的持久化存储架构记录历史成就，以及一个「成就墙」展示页面
  - **环境细节/温和动作**：解锁永久保留的纪念物、环境细节或新表达；默认状态始终完整、温暖，不以缺失或退化反衬奖励
  - **3D 塑胶公仔展示**：复用已保留的 3D 多姿态模型资产与绕 Y 轴旋转展示效果（见 `ARCHITECTURE.md`「已有 3D 资产的保留与新定位」），用户可在奖品展示场景中 360 度观赏获得的虚拟公仔

**环境细节解锁 · 已确认方向（2026-07-15 拍板，节点数字为初始建议，实现任务中可统一微调）**：

| 方向 | 初始建议节点 | 说明 |
|---|---|---|
| 莲花池 | 5 天首朵莲花；10 天旁边多开一朵小莲花/花苞 | 后续随成就逐步增加，直至莲花满池；`EMOTION_BIBLE` 原「7 天出现莲花」并入此口径统一。**素材进展（2026-07-18）**：莲花池首朵素材已到位（`lotus-front-rising`，7 帧，已登记 manifest）；触发逻辑（连续/累计天数追踪、断签是否重置）待排期，**勿因素材到位顺手实现**。 |
| 小香炉 | 3 天 | 老虎身前出现小香炉；此后「一炷香」反馈的烟从香炉里升起 |
| 蒲团刺绣 | 30 天 | 蒲团边缘出现一圈细小刺绣纹样；与 `outfitId` 架构天然兼容 |
| 夜间小灯笼 | 60 天 | 夜晚使用时老虎身边多一盏暖光小灯 |
| 白天小茶盏（推荐）/ 莲上蜻蜓（备选） | 60 天（与夜灯成对） | 白天使用时手边一盏冒着淡淡热气的茶（茶烟与香炉烟同一套写意粒子语言，「备了茶/点了灯」成对陪伴语义）；备选为偶尔停在莲花上的小蜻蜓 |

**明确不采用**：背景远景类添加（远山石、松枝等）——保持极简空灵的水墨背景。

**关键约束（区别于「养成」）**：只增不减、永久保留、默认态本来就是完整的；用户中断多久细节都不消失或褪色；它们是「纪念物」而非「维护对象」。

此功能涉及独立的成就数据持久化架构、新增 UI 页面（成就墙/展示柜），复杂度较高，**不纳入当前 2D 情绪系统主线开发范围**。待 2D 主线（情绪清单实现、交互检测）稳定完成后，另行评估排期与具体设计方案。勿在当前阶段情绪/交互任务中顺带实现。

### Backlog:Focus Confidence 未来数据源扩展路线图

以下信号源已在设计讨论中识别,但因涉及独立产品级工程(插件开发、移动端系统权限、第三方硬件SDK集成等),暂不纳入当前开发范围,留待后续单独立项评估资源投入:

- IDE插件类:VSCode插件、Cursor插件(检测编码专注状态)
- 文档协作类:Notion插件、Google Docs编辑检测
- 移动端系统级:手机前台APP检测、手机静止检测、Apple Focus Mode / Android Focus Mode 集成(需要系统级权限申请)
- 穿戴设备类:心率数据(需要硬件SDK集成)
- 长期探索类:EEG脑机接口(明确为远期方向,非当前技术可行范围)

每一项启动前需先评估:所需权限/API的用户隐私合规性、开发与维护成本、是否需要用户额外安装第三方软件。不应假设"技术上可行"等同于"应当实现",需结合当前团队人力(参见PROCESS.md团队现状说明)综合判断。

**已识别决策点（2026-07-16）——多工具切换 vs visibility 检测冲突**：

知识工作场景下，高质量心流也会产生大量标签页 / 工具切换，与真正分心在浏览器隐私沙盒内无法区分；原「标签可见 = 专注」假设会对这类用户系统性误判（缺陷全文见 `DESIGN.md`「Focus Confidence」与「专注会话陪伴模式」背景）。

**对策（已定稿，诚实机制延伸，非技术猜测）**：Companion Mode 升格为三选一，新增 **I'm working across tools**，由用户自主声明会话语境，关闭离开类分心判定；不依赖探测其他 App / 标签内容。运行时三选一 UI 待确认交互后另开任务实现。未来若评估「生产力网站白名单」等短信号源，**不得**绕过或削弱该用户声明边界。

### Backlog:系统级健康中枢读取（Phase 1 规划）

> 全文与架构约束见 **`ARCHITECTURE.md` → Backlog「未来数据源扩展 — 系统级健康中枢读取」**。此处仅作排期索引。

- **Phase 0**：**不实现**（手动 Honesty Check-in + Companion Mode 跑通核心体验）。
- **Phase 1**：评估 iOS HealthKit（Mindful Minutes）与 Android Health Connect（`MindfulnessSessionRecord`；注意 Android 14+ 覆盖滞后）；可选授权，与手动打卡并存；正念分钟可叠金光（复用 Ambient `presenceBoost` 模式）。
- **不强制**健康数据授权；不替代诚实机制。

### Backlog:Browser First 长期产品方向

**背景**：用户在使用 Cursor、VSCode、Notion、Google Docs、Figma、GitHub 等生产力工具时，理论上系统已经「知道」用户在工作，这比要求用户主动打开产品页面、手动开始计时更符合「陪伴感」而非「打开 APP」的产品定位。

**可行性分层评估（按「价值>复杂度」原则拆分）**：

1. **短期可扩展（复杂度低，已在现有技术路线内）**：检测当前浏览器活跃标签页的域名，判断是否为预设的「生产力网站」白名单（如 Notion 网页版、Google Docs、GitHub 网页版等），纯网页 JS 可实现，可作为 Focus Confidence 信号来源的自然扩展，可在后续迭代中评估纳入。

2. **中长期方向（复杂度高，需独立立项）**：开发 Chrome Extension，实现「浏览器角落常驻老虎」的陪伴体验，减少用户需要主动打开产品页面的摩擦。涉及独立的插件开发、发布审核流程，复杂度显著高于当前网页产品。

3. **暂不可行/需谨慎评估（复杂度很高，涉及隐私敏感权限）**：检测用户是否在使用 Cursor、VSCode 等桌面应用程序（而非网页），这已超出浏览器沙盒能力范围，需要操作系统级别的应用活跃状态监控权限。此类权限申请对用户信任度要求极高，且用户对「专注工具监控其电脑上所有应用活动」的隐私顾虑值得高度重视（参考：项目开发过程中，团队自身也对开发工具请求系统级权限保持了必要的警惕）。此方向需要独立于当前项目的产品/工程投入，不建议在当前阶段纳入路线图讨论范围之外的实质开发。

**处理方式**：第 1 项可在后续 Focus Confidence 相关迭代中按「价值>复杂度」原则评估纳入；第 2、3 项记录为长期方向，不纳入当前开发排期。

### Backlog:产品命名（Focus Tiger 是否更名）

**当前阶段决策（2026-07-16）**：产品名称 **Focus Tiger** 经讨论后**保持不变**。

**理由**：

1. 与已确立的核心成长模型「觉察 Awareness → 专注 Focus → 心流 Flow → 内在成长 Growth」一致——Focus 是旅程中真实的第一阶段，而非虚假包装；
2. 保留「Focus」关键词有助于产品早期通过自然搜索被发现；
3. 改动技术标识符（仓库名、类名、`focus-tiger` 路径与存储键等）成本需要进一步评估。

**建议的深化方式（非更名）**：通过副标题承载更深定位，例如：

> Focus Tiger — a mindful companion for presence, awareness, and flow

**后续**：是否进行完整产品更名，留待获得真实用户反馈后重新评估。与之区分：核心交互按钮已采用「Sit / Rise」仪式动词（见 `EMOTION_BIBLE`「核心交互动词」），**不影响**本条产品名决策。

### Backlog:用户自定义角色改名

`DESIGN.md`「老虎的名字」保留用户可自定义改名设想（沿用 v4.0 命名交互逻辑）。**当前阶段不开发**；默认显示固定为正式名「阿寅 / Yin」（i18n `CHARACTER_NAME`）。排期前须另开 Task，明确存储、校验与观察式文案边界。

### Backlog:节奏敲击正念小游戏（「数字木鱼」）

独立于专注检测体系之外的**可选玩法**：用户可主动进入一个「跟随节奏敲击」模式（如按空格键跟随音乐节奏），类似传统敲木鱼 / 数呼吸类正念练习的数字化版本。系统检测按键间隔的规律性，给予平静的视觉反馈（如老虎随节奏轻轻点头、金光随节奏起伏）。

**与 Focus Confidence 的明确区分**：此为用户主动选择的独立小游戏玩法，**不作为**判断「用户是否在专心工作」的信号来源。持续敲击本身与深度专注工作在行为上是互斥的，不适合作为工作专注度的检测依据。

- **复杂度评级**：低（浏览器键盘事件监听 + 节奏规律性分析，技术成熟）
- **价值定位**：锦上添花的可选玩法，非核心刚需
- **排期**：待 2D 情绪系统主线稳定后，再评估是否开发

### Backlog:角色边界待观察事项（暂不处理,后续观察）

1. **`input/` 目录混放**：`FocusInput.js`（Gameplay 角色）与 `UIControls.js`（UI 角色）同处 `input/` 目录。当前两文件职责边界清晰、无跨界耦合迹象，暂不拆分子目录。若后续发现有跨文件耦合修改的情况，再考虑拆分为 `input/gameplay/` 与 `input/ui/` 子目录。

2. **`character/Actions.js` 与 `TigerCharacter.js` 职责轻微交叠**：`Actions.js` 负责行为枚举与播放控制，`TigerCharacter.js` 负责材质/光效参数与动画播放；与 `MoodController` 之间的信号消费边界，需要在每次涉及这两个文件的具体 Task Brief 中明确写出边界，不作为一次性目录重构处理。

---

## 角色协作机制（Role-Based Development）

为提升代码质量与模块边界清晰度，后续所有开发任务将明确声明执行角色。各角色职责边界如下：

### Architect（架构师）

- **职责**：设计模块边界、文件目录结构、模块间接口约定；`main.js` 作为跨角色装配层，其改动权限归本角色专属
- **禁止**：不编写具体实现代码，只产出设计文档更新（`ARCHITECTURE.md`）或伪代码/接口签名
- **对应文件范围**：`docs/`（含 `ARCHITECTURE.md` 及各模块间接口定义）、`src/main.js`、`src/render-compare.js`、`render-compare.html`、`utils/Constants.js`（跨模块共享常量，由本角色维护接口约定）
- **装配层约定**：其它角色如需将自己负责的模块接入主循环/初始化流程，应提交该模块对外暴露的初始化接口/调用方式说明，由 Architect 角色决定具体如何接入 `main.js`，不应由其它角色直接修改 `main.js`

### Three.js Engineer（渲染工程师）

- **职责**：模型加载、姿态管理（`PoseManager.js`）、动态效果层（旋转/呼吸/悬浮等）、Shader、粒子系统、材质
- **禁止**：不改动业务逻辑（专注计时、达标判断、每日状态重置等 `FocusSession` / `StateManager` 相关代码）
- **对应文件范围**：`character/`（不含 `MoodController.js`，已迁至 `core/`）、`effects/`、`feedback/`（`FocusVisualizer.js`、`TransitionFX.js`、`Ambience.js` 均为视觉渲染层）、`core/Renderer.js`、`core/Scene.js`、`core/PostProcessing.js`、`environment/`、`utils/Loaders.js`、`utils/configurePBRTextures.js`、`utils/Easing.js`、`assets/shaders/`、`scripts/generate-particle-glow.mjs`、`scripts/capture-poster.mjs`

### Gameplay Engineer（玩法工程师）

- **职责**：`FocusSession`（专注会话计时）、`StateManager` / `MoodController`（状态机、姿态触发信号）、`Milestone`（每日目标、一炷香判定逻辑）、Focus Confidence 计算逻辑
- **禁止**：不直接操作 Three.js 渲染细节（如具体的 shader 参数、粒子视觉效果实现），只负责产出"该显示什么状态"的信号，交由 Three.js Engineer 角色的代码消费
- **对应文件范围**：`core/FocusSession.js`、`core/StateManager.js`、`core/Milestone.js`、`core/MoodController.js`、`input/FocusInput.js`、`utils/Storage.js`

### UI Engineer（界面工程师）

- **职责**：HUD、按钮、debug 面板、PWA 配置、响应式布局（窄屏基线见 **`RESPONSIVE_LAYOUT.md`**）
- **禁止**：不改动 3D 场景内部逻辑
- **对应文件范围**：`input/UIControls.js`、`ui/`（`FocusHUD.js`、`RewardToast.js`、`Screenshot.js`）、`index.html`、`vite.config.js`

### QA Engineer（质量检查）

- **职责**：每个 Task 完成后，独立执行一轮检查，不参与该 Task 的编码过程
- **检查清单**：
  1. 控制台是否有报错/警告
  2. 是否有内存泄漏迹象（如粒子/精灵等临时对象未被正确清理）
  3. 是否符合 `PRINCIPLES.md` 中已定义的硬性原则（如"不制造焦虑原则""性能红线优先"）
  4. 边界情况测试（如状态快速切换、多个信号同时触发、姿态切换过程中触发其它事件等）
  5. 是否有跨角色越界修改（比如渲染相关任务是否意外改动了业务逻辑代码）
- QA 角色不需要等所有角色都完成后才执行，而应在**每个独立 Task 完成后立即执行一次**，再进入下一个 Task

### 使用方式

后续每次发起开发任务时，任务描述开头需注明：**"本任务以 [角色名] 身份执行"**。

任务执行前，Cursor 须先确认该任务内容是否落在声明角色的职责边界内。若任务内容涉及跨角色的改动，须在开始写代码前明确指出：**"这部分内容超出 [XX 角色] 职责范围，涉及到 [YY 角色] 负责的文件/逻辑"**，并等待确认后再继续，而不是默认自行处理。

任务完成后，如涉及功能性改动（非纯文档/纯 UI 调整），需要额外发起一次 QA 角色的独立检查请求；QA 检查通过后再进入下一个 Task。
