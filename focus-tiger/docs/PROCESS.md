# 坐禅小老虎 · 项目组织与协作流程
# Focus Tiger · PROCESS.md

本文档记录开发组织纪律。完整协作约定（角色分工、Task Brief 书写规范、文档更新规则、日常协作流程）见 **COLLAB.md**。

权威文档索引另见：`PRINCIPLES.md` / `ARCHITECTURE.md` / `DESIGN.md` / `EMOTION_BIBLE.md` / `CHARACTER_BIBLE.md` / `TASKS.md`。

---

## 当前进度速览

> **维护规则**：每次完成具有实质性进展的 Task（不含纯粹的 debug / 微调）后，主动更新本速览对应部分，尤其是「已完成功能」「下一步计划」；若产生新的「待确认事项」，同步补入列表。本章节置于靠前位置，便于新对话快速对齐，无需每次加载全部文档。

**最后更新时间**：2026-07-15

**当前技术路线**：主线为 **2D PNG 序列帧动画**（素材来源：图生视频 + 抽帧，见 `ARCHITECTURE.md`）；既有 **3D 多姿态 GLB** 资产与 `PoseManager` / `DynamicMotion` 等代码**完整保留**，改用于未来「奖励系统」塑胶公仔展示，不再作为主界面情绪表现载体。

**已完成并验收通过的功能**（按仓库/对话实际交付填写，不含未落地的设计）：

- 3D 场景骨架与专注基础环：Renderer / Scene、`FocusSession` 计时、随 focusLevel 变化的金色视觉反馈（历史实现为材质插值，按 2026-07-15 视觉原则该做法已废弃，重构并入「奖励柜」任务）、`StateManager` + HUD、「开始专注」交互
- 多姿态 GLB：`PoseManager` 预加载、包围盒归一化对齐、姿态切换过渡；调试与正式入口已收敛到 `EmotionController`
- 动态效果层：`DynamicMotion`（呼吸起伏、绕 Y 轴旋转、庆祝悬浮）— 奖励柜可复用；2D 主线不要求同等旋转
- 「今日一炷香」完成反馈：`IncenseGreeting`（莲花渐显 + 金色粒子），经 `playEmotion('incenseComplete')` 触发
- `EmotionController.playEmotion()` 统一情绪桥：业务侧不直连 PoseManager / DynamicMotion；映射表含已实现态 + 大量占位态
- 鼠标/指针刺激检测：`PointerInteraction`（靠近 / 点头 / 抚摸分阈值 / 绕圈 / 静止歪头 → `playEmotion`；Celebrating 期间摸头忽略）
- 眼睛跟随：`EyeTracking`（独立占位瞳孔图层、椭圆夹紧 + 阻尼跟随、闭眼/Celebrating 自动让位；debug 开关已接）
- 文档体系：`PRINCIPLES` / `ARCHITECTURE` / `DESIGN` / `EMOTION_BIBLE` / `PROCESS` / `CHARACTER_BIBLE` / `TASKS` / `COLLAB`
- `.cursor/rules/focus-tiger-docs.mdc`：项目级规则 `alwaysApply`，权威文档摘要兜底
- 多语言骨架：`src/locales/i18n.js`（`t` / `tPool`）；`zh.json` / `en.json` 均已填充完整；产品默认语言已改为英文（面向海外市场），中文作为可切换语言保留
- 角色分工写入 `PROCESS.md`（Architect / Three.js / Gameplay / UI / QA）
- Git 半自动同步护栏：`PROCESS.md`「Git 同步节奏」、`./scripts/git-sync-safe.sh`、Agent `stop` 提醒钩子（**不**自动 push）
- 首个 2D PNG 序列真实素材（`wave-hello`，14 帧，透明背景）已抠图入库至 `public/sprites/tiger-cub/monk-robe-default/wave-hello/frame_001.png` ～ `frame_014.png`，并已完成 `SpriteSequencePlayer` 对接与浏览器验收（分层路径规范见 `ARCHITECTURE.md`）
- `SpriteSequencePlayer` 首版：单 `<img>` 预加载换帧、rAF 帧率控制、循环/末帧停留、立即打断、播放完成回调、逐帧额外停留配置；`waveHello` 已经 `playEmotion('welcomeBack')` 接线，第 8 帧抬手顶点额外停留 400ms，并完成 Vite 浏览器运行验收（播放、循环、停止、播完淡出回落 `Idle`）
- 角色/装扮可替换架构预留：`CharacterConfig.js` 为外观标识与素材路径拼接唯一出口（默认 `tiger-cub` / `monk-robe-default`）；素材按 `sprites/{characterId}/{outfitId}/{animationName}/frame_NNN.png` 分层入库；清单只存动作名 + 帧数，播放器按当前外观实时解析路径（本阶段不做换装 UI）

**明确未完成（勿当作已验收）**：

- Focus Confidence V1 运行时信号链路（visibility / blur / idle）— **仅有 DESIGN 设计，无独立实现模块**
- 正式瞳孔素材、大部分互动情绪的真实动画
- `MindfulAcknowledge` / `stretchReminder` 的完整触发 + 非模态文案 UI（情绪键仅占位；**判定/限频规则已定稿**）
- 角色/装扮可替换**完整功能**（用户可选换装 UI、多套角色/装扮素材）尚未实现；`CharacterConfig` 架构扩展点与素材路径/情绪触发解耦已落地
- Phase 0 清单中的持久化 / DORMANT 唤醒仪式 / PWA 等（见 `TASKS.md`）

**正在进行 / 最近决定的事项**：

- 技术路线已从「3D 多姿态 GLB 主线」切换为「2D PNG 序列主线」；3D 定位为奖励柜
- `EMOTION_BIBLE` 持续扩充：互动清单、MindfulAcknowledge、自主/响应分层、多语言规范
- `CHARACTER_BIBLE` 已归档 Master Character Prompt，并澄清 Rive / 双莲花 / 蒲团 / Suffix Prompt
- 指针检测与眼睛跟随的**检测/跟随逻辑已接线**，视觉表现多为占位，待后续真实素材
- **产品市场定位已明确**：优先面向海外市场，产品名统一为 `Focus Tiger`，UI 默认语言由中文改为英文，中文作为可切换语言保留；dev-only 调试面板不纳入字典并保持原样
- **无互动约 10 分钟已拍板**：保留加权随机（70% 继续冥想 / 30% 挥手），挥手分支使用已入库的 `wave-hello`；具体触发计时源仍待与 Focus Confidence 决策口径统一
- **架构决策已落地**：为应对角色/装扮市场接受度不确定性，提前预留「角色/装扮可替换」扩展点（`CharacterConfig`）；当前仍固定单一角色（小老虎僧袍造型），不做用户可选换装 UI，仅解耦素材路径与情绪触发逻辑
- **已确认**：正念阶段性认可 / 伸懒腰：会话墙钟 20 分钟、活跃累计 2 小时（中断暂停、≥30 分钟无活动才清零）、每类每日 ≤3 次
- **已确认**：Git 采用「Task 后 commit + 人工确认再 push」，禁止 post-commit 自动 push
- **已确认并实现**：新增 `welcomeBack` 情绪键；`SpriteSequencePlayer` 首版使用单 `<img>` 预加载换帧；2D overlay 覆盖于现有 3D canvas 之上
- **视觉原则修正已拍板（2026-07-15）**：角色本体固有色恒定不变，金色进度改由外围光环/环境光反射（Rim Light）表达，禁止本体重着色。改动范围：只改文档确立新原则（`DESIGN` / `PRINCIPLES` / `ARCHITECTURE` / `EMOTION_BIBLE` / `TASKS` 已同步），2D 主线金色表达定义为「金色光晕 overlay + 粒子」写入 `ARCHITECTURE`；3D shader（`TigerCharacter` 灰→金插值、`Constants` 命名）仅留 TODO 标注不重构，重构并入未来「奖励柜」任务；历史任务书保留原文 + 顶部注记
- `waveHello` 真实序列已通过 `EmotionController.playEmotion('welcomeBack')` 接线，支持 rAF 帧率控制、循环/末帧停留、立即打断、预加载及播放完成回落 `Idle`

**下一步计划**：

- 按同一 manifest / player 接口逐步接入后续 2D 情绪序列
- 补正式瞳孔 PNG，调 `EyeTracking` 锚点与偏移
- 实现阶段性正念认可 / 伸懒腰提醒的非模态文案条 + 计时与限频逻辑（规则已定稿）
- 扩展 PointerInteraction：鼻子 Boop、拉尾巴、抚摸分阶段递进（文档已有，代码未全覆盖）
- 按需推进 `TASKS.md` Phase 0 未完项（勿与 2D 主线混做）

**已知的开放决策 / 待确认事项**：

> **当前无待拍板事项。**  
> `welcomeBack` 情绪键、单 `<img>` 换帧、2D overlay 共存方案及“英文默认、中文可切换”均已确认并实现。

**Backlog（仅列名，详情见下文 Backlog 章节）**：

- 奖励系统（金牌 + 3D 塑胶公仔展示）
- Focus Confidence 未来数据源扩展
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
2. `git add` 相关文件 → `git commit`（message 带 Task 关键词，便于对照速览）  
3. 运行仓库根目录脚本做推送前体检：`./scripts/git-sync-safe.sh`  
4. **在你明确同意后**再 `./scripts/git-sync-safe.sh --push`（或手动 `git push`）

Agent / Cursor 侧约定：实质性 Task 收尾时应**提醒**上述步骤，并可代劳 `commit`；**未经用户口头/书面确认不得 `git push`**。

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

### Backlog:奖励系统（金牌 + 3D 塑胶公仔展示）

整合此前讨论的两个想法，合并为一个后续奖励系统功能：

- 用户达成特定成就/里程碑（如连续签到天数、累计专注时长等，具体规则待设计）后，获得对应的奖励
- 奖励呈现形式包括：
  - **金牌/徽章**：需要独立的持久化存储架构记录历史成就，以及一个「成就墙」展示页面
  - **3D 塑胶公仔展示**：复用已保留的 3D 多姿态模型资产与绕 Y 轴旋转展示效果（见 `ARCHITECTURE.md`「已有 3D 资产的保留与新定位」），用户可在奖品展示场景中 360 度观赏获得的虚拟公仔

此功能涉及独立的成就数据持久化架构、新增 UI 页面（成就墙/展示柜），复杂度较高，**不纳入当前 2D 情绪系统主线开发范围**。待 2D 主线（情绪清单实现、交互检测）稳定完成后，另行评估排期与具体设计方案。勿在当前阶段情绪/交互任务中顺带实现。

### Backlog:Focus Confidence 未来数据源扩展路线图

以下信号源已在设计讨论中识别,但因涉及独立产品级工程(插件开发、移动端系统权限、第三方硬件SDK集成等),暂不纳入当前开发范围,留待后续单独立项评估资源投入:

- IDE插件类:VSCode插件、Cursor插件(检测编码专注状态)
- 文档协作类:Notion插件、Google Docs编辑检测
- 移动端系统级:手机前台APP检测、手机静止检测、Apple Focus Mode / Android Focus Mode 集成(需要系统级权限申请)
- 穿戴设备类:心率数据(需要硬件SDK集成)
- 长期探索类:EEG脑机接口(明确为远期方向,非当前技术可行范围)

每一项启动前需先评估:所需权限/API的用户隐私合规性、开发与维护成本、是否需要用户额外安装第三方软件。不应假设"技术上可行"等同于"应当实现",需结合当前团队人力(参见PROCESS.md团队现状说明)综合判断。

### Backlog:Browser First 长期产品方向

**背景**：用户在使用 Cursor、VSCode、Notion、Google Docs、Figma、GitHub 等生产力工具时，理论上系统已经「知道」用户在工作，这比要求用户主动打开产品页面、手动开始计时更符合「陪伴感」而非「打开 APP」的产品定位。

**可行性分层评估（按「价值>复杂度」原则拆分）**：

1. **短期可扩展（复杂度低，已在现有技术路线内）**：检测当前浏览器活跃标签页的域名，判断是否为预设的「生产力网站」白名单（如 Notion 网页版、Google Docs、GitHub 网页版等），纯网页 JS 可实现，可作为 Focus Confidence 信号来源的自然扩展，可在后续迭代中评估纳入。

2. **中长期方向（复杂度高，需独立立项）**：开发 Chrome Extension，实现「浏览器角落常驻老虎」的陪伴体验，减少用户需要主动打开产品页面的摩擦。涉及独立的插件开发、发布审核流程，复杂度显著高于当前网页产品。

3. **暂不可行/需谨慎评估（复杂度很高，涉及隐私敏感权限）**：检测用户是否在使用 Cursor、VSCode 等桌面应用程序（而非网页），这已超出浏览器沙盒能力范围，需要操作系统级别的应用活跃状态监控权限。此类权限申请对用户信任度要求极高，且用户对「专注工具监控其电脑上所有应用活动」的隐私顾虑值得高度重视（参考：项目开发过程中，团队自身也对开发工具请求系统级权限保持了必要的警惕）。此方向需要独立于当前项目的产品/工程投入，不建议在当前阶段纳入路线图讨论范围之外的实质开发。

**处理方式**：第 1 项可在后续 Focus Confidence 相关迭代中按「价值>复杂度」原则评估纳入；第 2、3 项记录为长期方向，不纳入当前开发排期。

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

- **职责**：HUD、按钮、debug 面板、PWA 配置、响应式布局
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
