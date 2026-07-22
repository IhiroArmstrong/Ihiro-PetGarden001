# 坐禅小老虎 · 架构设计
# Focus Tiger · ARCHITECTURE.md

本文档记录模块职责划分、目录结构与模块间边界。任务序列见 TASKS.md。

---

## 技术路线变更（v5.0）

```
旧：纯SVG + CSS，单HTML文件，双击直接运行，零构建
新：Vite + Three.js + GLB模型 + 自定义Shader，需要构建流程

这意味着：
  - 需要建模流程(小老虎/莲花/光环需要建模、绑定动画、导出GLB)，
    不再是"在浏览器里手写SVG path"就能完成的工作
  - 需要处理3D场景在移动端的加载性能(健康类App的用户对首屏速度容忍度低，
    GLB+贴图体积必须控制，建议单场景所有资产压缩后 < 3MB)
  - Shader(金色环境光/光晕、柔焦)需要专人写或找现成后处理库，
    调试成本比CSS filter高一个量级
    （注：早期方案曾表述为"灰→金材质渐变"，已按 2026-07-15 视觉原则修正：
      本体固有色恒定，金色来自环境光反射与光环，见 DESIGN.md「视觉状态」章节）
  - 不再是"双击HTML直接打开"，需要走 npm run build 产出静态资源再部署

这个决策已经确认要走，本文档后续按3D技术栈设计，但请注意：
  Phase 0 的验收标准会包含"首次加载时间"这一项，防止3D效果做上去了、
  但用户等8秒白屏导致直接流失。
```

---

## Ambience 与 FocusVisualizer 职责边界

```
水墨背景的基础雾气效果、柔光基调 —— 这部分保持相对静态，
不需要跟随focusLevel实时变化，只在CELEBRATE时短暂配合一次联动即可，
职责边界：Ambience负责"这个世界本来是什么氛围"，
FocusVisualizer负责"专注度如何叠加在这个氛围之上"。
```

### MoodController / FocusVisualizer / TransitionFX 单向数据流边界

```
StateManager(唯一状态源) → MoodController(只管播哪个动画)
→ FocusVisualizer(只管focusLevel数值映射光效参数)
→ Ambience(只管与focusLevel无关的静态环境)
TransitionFX单独处理"切换瞬间"的一次性过场，不长期持有状态
```

<!-- state-machine-contract:begin -->

> **机器块 · 勿手改**。真源：`src/core/StateManager.js`（`STATES` + `LEGAL_STATE_TRANSITIONS`）。刷新：`npm run state:doc-sync`。

合法转移（产品路径）：`IDLE ↔ DORMANT`、`IDLE → FOCUSING → CELEBRATE|IDLE`、`CELEBRATE → IDLE`。

`setState` **不阻断**非法转移，但 `console.warn`（`LEGAL_STATE_TRANSITIONS`）。`BREAK` 已从枚举删除（无生产路径）。边角观察：`docs/EDGE_CASES.md`。

### `STATES`

| enum key | value |
|---|---|
| `IDLE` | `IDLE` |
| `FOCUSING` | `FOCUSING` |
| `CELEBRATE` | `CELEBRATE` |
| `DORMANT` | `DORMANT` |

### `LEGAL_STATE_TRANSITIONS`

| from | allowed next |
|---|---|
| `IDLE` | `FOCUSING`, `DORMANT` |
| `FOCUSING` | `IDLE`, `CELEBRATE` |
| `CELEBRATE` | `IDLE` |
| `DORMANT` | `IDLE` |

<!-- state-machine-contract:end -->

---

## 项目目录结构 v5.0

```
focus-tiger/
├─ docs/                          # 流程/设计文档，不参与构建
│  ├─ PRODUCT_POSITIONING.md      # 品牌定位、核心使命与长期方向（产品语义顶层）
│  ├─ TASKS.md
│  ├─ PRINCIPLES.md
│  ├─ ARCHITECTURE.md
│  ├─ DESIGN.md
│  ├─ PROCESS.md
│  ├─ COLLAB.md
│  └─ task-briefs/                # 各Task Brief统一存放于此
│     ├─ task00-brief-project-scaffold.md
│     └─ task01-brief-gray-to-gold-visual.md
│
├─ cloud/                         # Cloudflare Workers API（独立包；与 Vite 前端解耦）
│  ├─ README.md                   # wrangler dev + curl 验收
│  ├─ wrangler.jsonc
│  ├─ package.json                # name: focus-tiger-cloud
│  └─ src/                        # stub：POST /api/daily-message、/api/emotion-weight
│     # 2026-07-22：仅 mock + 校验 + 内存限流；未接前端 / 未部署正式逻辑
│
├─ art-reference/                 # 三视图等美术参考图，仅供开发参考，不参与构建
│  └─ tiger-turnaround/
│
├─ public/                        # 大体积静态资源(GLB/贴图)，Vite直接原样提供，
│  │                               # 不走src/assets的import处理流程(避免打包器
│  │                               # 对大文件做不必要的hash/内联处理)
│  ├─ models/
│  │  └─ tiger.glb
│  └─ textures/
│     └─ particle-glow.png
│
├─ index.html
├─ vite.config.js
├─ package.json
├─ src/
│  ├─ main.js                    # 入口：只做拼装+主循环调度，不直接碰Three.js底层对象
│  │
│  ├─ core/
│  │  ├─ Renderer.js            # renderer/camera/lights 初始化
│  │  ├─ Scene.js               # 场景图组装(老虎、莲花、光环挂载点)
│  │  ├─ PostProcessing.js      # shader pass 管理(金色光晕、柔焦)
│  │  ├─ FocusSession.js        # 专注会话：计时、focusLevel计算
│  │  ├─ StateManager.js        # 全局状态机：IDLE/FOCUSING/CELEBRATE/DORMANT
│  │  ├─ Milestone.js           # 里程碑：连续天数、累计时长
│  │  └─ MoodController.js      # 只负责把StateManager的状态翻译成"该播哪个动画"，
│  │                            # 自己不存状态(职责边界见上方说明)
│  │
│  ├─ character/
│  │  ├─ TigerCharacter.js      # 小老虎：渲染与动画播放控制（金色反光待按新原则重构，见文末 TODO）
│  │  ├─ PoseManager.js         # 多姿态 GLB 预加载与 cross-fade 切换
│  │  └─ Actions.js             # 行为定义：坐禅/欢呼/打瞌睡/眨眼/唤醒起身
│  │
│  ├─ effects/
│  │  ├─ DynamicMotion.js       # 动态效果层：旋转/呼吸/悬浮等连续叠加变换
│  │  └─ IncenseGreeting.js     # "今日一炷香"完成反馈：莲花渐显 + 金色粒子
│  │
│  ├─ environment/
│  │  └─ MeditationCushion.js   # 打坐蒲团 3D 模型
│  │
│  ├─ feedback/
│  │  ├─ FocusVisualizer.js     # 只负责focusLevel数值→光效/粒子/背景暖度的映射
│  │  ├─ TransitionFX.js        # 只负责状态切换瞬间的一次性过场特效，不长期持有状态
│  │  └─ Ambience.js            # 只负责与focusLevel无关的静态环境(雾气基调、柔光)
│  │
│  ├─ input/
│  │  ├─ FocusInput.js          # 专注信号来源：MVP阶段只做手动计时器，
│  │  │                         # 预留番茄钟/传感器接入点但不实现
│  │  └─ UIControls.js          # 按钮、手势、快捷键
│  │
│  ├─ ui/
│  │  ├─ FocusHUD.js            # 专注度条(辅助)、时长、状态标签
│  │  ├─ RewardToast.js         # 里程碑达成提示
│  │  └─ Screenshot.js          # 金光时刻截图分享
│  │
│  ├─ assets/
│  │  └─ shaders/                # 后处理shader源码(GLSL文本，体积小，
│  │                              # 适合作为src模块import，与public/下的
│  │                              # 大体积二进制资源(GLB/贴图)区分开)
│  │
│  └─ utils/
│     ├─ Loaders.js             # GLTFLoader / TextureLoader 封装
│     ├─ configurePBRTextures.js # PBR 贴图配置
│     ├─ Easing.js              # 缓动函数(视觉动画插值)
│     ├─ Constants.js           # 颜色、时间参数、阈值配置(跨模块共享)
│     └─ Storage.js             # localStorage 封装
```

---

## 角色文件范围映射（Role File Scope）

与 `PROCESS.md` 角色协作机制配套，以下为 `src/` 下各文件的归属声明（完整协作流程见 `PROCESS.md`）。

| 角色 | 文件范围 |
|------|----------|
| **Architect** | `docs/`、`src/main.js`（跨角色装配层，改动权限专属）、`src/render-compare.js`、`render-compare.html`、`utils/Constants.js`（跨模块共享常量接口） |
| **Three.js Engineer** | `character/`（`TigerCharacter.js`、`PoseManager.js`、`Actions.js`）、`effects/`、`feedback/`（`FocusVisualizer.js`、`TransitionFX.js`、`Ambience.js`）、`core/Renderer.js`、`core/Scene.js`、`core/PostProcessing.js`、`environment/`、`utils/Loaders.js`、`utils/configurePBRTextures.js`、`utils/Easing.js`、`assets/shaders/`、`scripts/generate-particle-glow.mjs`、`scripts/capture-poster.mjs` |
| **Gameplay Engineer** | `core/FocusSession.js`、`core/StateManager.js`、`core/Milestone.js`、`core/MoodController.js`、`input/FocusInput.js`、`utils/Storage.js` |
| **UI Engineer** | `input/UIControls.js`、`ui/`（`FocusHUD.js`、`RewardToast.js`、`Screenshot.js`）、`index.html`、`vite.config.js` |
| **QA Engineer** | 无专属代码文件；每个 Task 完成后独立执行检查（清单见 `PROCESS.md`） |

**装配层约定**：其它角色如需将模块接入主循环/初始化流程，应提交该模块对外暴露的初始化接口/调用方式说明，由 Architect 角色决定如何接入 `main.js`，不应由其它角色直接修改 `main.js`。

### 与Cursor最初提案的差异说明

```
1. 删除了 network/ 目录(含SyncClient.js)
   理由：这是二期以后才需要的社交同步功能，现在建空壳容易让人误以为
   已有基础实现，违反"不提前实现超范围功能"的开发纪律

2. core/ 下新增 Renderer.js / Scene.js / PostProcessing.js
   理由：main.js若直接承载渲染器初始化+shader管线，会快速膨胀成
   不好维护的"上帝文件"，尤其本项目的后处理效果(金色光晕、柔焦)
   逻辑量不小，需要单独文件承载

3. MoodController / FocusVisualizer / TransitionFX 明确了单向数据流边界
   StateManager(唯一状态源) → MoodController(只管播哪个动画)
   → FocusVisualizer(只管focusLevel数值映射光效参数)
   → Ambience(只管与focusLevel无关的静态环境)
   TransitionFX单独处理"切换瞬间"的一次性过场，不长期持有状态
```

---

## 姿态系统架构（主线已调整为 2D PNG 序列；下文保留既有 3D 实现说明供奖励场景复用）

**技术路线调整说明（重要）**：经过实际开发验证，3D 多姿态 GLB 方案在跨姿态一致性、渲染表现方面遇到持续工程难题，且团队无骨骼动画 / Rive 矢量动画专业人力。技术路线调整为：**2D PNG 序列帧动画**。

已完成的 3D 美术资产与已实现的 3D 效果代码（`PoseManager.js`、`DynamicMotion.js` 等）**不废弃**，保留用于后续「奖励系统」场景（塑胶公仔展示，见 `PROCESS.md` Backlog），**不再作为当前主线情绪表现载体**。主线情绪状态定义仍以 `EMOTION_BIBLE.md` 为准，由 `EmotionController.playEmotion()` 统一触发；底层实现将逐步切到 2D 序列播放器。

#### 已有 3D 资产的保留与新定位

项目此前已完成的 3D 老虎多姿态模型（坐禅闭眼、睡着了、坐禅睁眼微笑、跳跃欢呼、T-pose）与相关渲染代码（`character/PoseManager.js`、`effects/DynamicMotion.js` 等），因主线情绪表现技术路线已调整为 2D PNG 序列方案（见前述说明），**不再作为当前主界面的情绪表现载体**。

这些 3D 资产予以**完整保留，不废弃、不删除**，原因：该批模型视觉上呈现「塑胶公仔」质感，适合用作后续「奖励系统」中的可 360 度展示虚拟公仔奖品。此场景恰好是 3D 技术的优势场景（静态展示、任意角度观赏），不涉及此前主线开发中遇到的动画穿插、姿态切换等工程难题。已实现的「绕 Y 轴缓慢旋转」效果，在「奖品展示柜」场景下是合适的展示方式，予以保留复用。

**正式衣着（2026-07-18）**：Idle 闭目坐禅运行时 `public/models/tiger-meditate-closed.glb` 须为单色暖浅灰棉麻禅修服 / 茶服风、**无红边**；权威描述见 `CHARACTER_BIBLE.md` Costume。旧深红镶边版本仅历史备份。后续奖励柜换装或新姿态 GLB 不得回退到红边/双色袍。

### 历史说明：3D 多姿态 GLB 方案（保留，非主线）

角色的视觉表现分为两个正交的层（下列描述对应已实现的 3D 代码，供奖励场景复用）：

**姿态层(离散状态,由多个独立 GLB 文件实现)**:
负责表达角色当前所处的"模式",通过预加载多个统一风格的 GLB 文件、切换显隐来实现,不依赖骨骼动画。当前包含以下姿态:
- IDLE_CLOSED_EYES(坐禅闭眼)→ 对应日常/专注一般
- SLEEPING(睡着了)→ 对应瞌睡/休息态(DORMANT)
- IDLE_SMILING(坐禅睁眼微笑)→ 对应达标后的持续情绪态
- CELEBRATING(跳跃欢呼)→ 对应达标瞬间的一次性庆祝动画
- T_POSE(T-pose 站立)→ 仅用于调试,不面向用户展示

**动态效果层(连续叠加效果,由 Object3D 程序化变换 + Shader 实现)**:
不管当前处于哪个姿态,均可叠加在其上,包括:绕 Y 轴缓慢旋转、呼吸起伏(scale/position 正弦波)、悬浮(庆祝态 position.y 上浮)、粒子系统(金色阳光粒子/雪花/花瓣,独立于姿态之外叠加显示)。

**姿态切换实现规范**:
- 切换方式:两个模型实例做透明度交叉淡入淡出(cross-fade),时长 0.3-0.5 秒,禁止瞬时切换(闪切)。
- 性能要求:页面初始化时预加载全部姿态 GLB(可用 loading 遮罩掩盖加载过程),运行时只做显隐切换,不重新从网络加载。预加载多个模型的显存占用需纳入性能验收标准。
- 锚点对齐:每个 GLB 独立生成,pivot 点/bounding box 可能不一致,实现时须先测量每个 GLB 的 bounding box 并做归一化对齐(统一缩放到同一高度、底部对齐同一地面 Y 坐标),再进行切换,避免切换时出现位置跳动或大小突变。

**粒子系统叠加原则**:
粒子系统必须支持多套独立发射器同时叠加显示,不能用"共用一个粒子系统靠切换贴图"的方式实现。例如"专注氛围金粒子"与"每日总结雪花/花瓣粒子"是两套独立的发射器,分别由各自独立信号控制显隐,可同时显示(如"当日专注数据尚未显著+现在正在瞌睡"应能同时呈现雪花粒子与瞌睡姿态)。

**TODO（并入未来「奖励柜」任务，本阶段不改）**：现有 3D 代码（`TigerCharacter.js` 的 focus shader 按 `uFocusLevel` 向金色混色、`Constants.js` 的 `idleGray*` / `focusGold*` 命名）与 2026-07-15 确立的「本体固有色恒定」原则不符。待 3D 资产在奖励柜场景启用时一并重构：本体色固定，改用 Fresnel Rim Light 边缘高光 + 提升 `envMapIntensity` / 降低 roughness + 金色光环 mesh 承接环境反射。

---

## 2D PNG 序列技术方案（素材获取：视频生成抽帧法）

当前**主线**情绪表现载体。素材获取流程**已确定采用视频生成抽帧法**，非图像插值法。

### 素材获取流程

1. **图生视频**：使用图生视频工具（如 Grok Imagine 等），以已有的老虎静态图作为首帧参考，配合明确的风格描述词（干净线稿、低饱和度柔和配色等，与静态设计保持一致），生成对应情绪动作的短视频片段（如眨眼、欢呼等，时长通常 2–3 秒）。
2. **抽帧**：将生成的视频抽帧为图片序列（工具可选：在线视频转图片工具，或本地用 ffmpeg 等命令行工具处理；抽帧间隔按目标动画帧率决定，不需要保留视频原始的全部帧数，通常按需间隔抽取）。
3. **去背景**：对抽出的每一帧进行背景移除处理（视频生成结果通常不带透明背景，需要额外抠图步骤，如使用 remove.bg 等工具批量处理）。
4. **循环衔接**：对于需要无缝循环播放的动作（如呼吸、待机类持续动画）：可采用「正放 + 倒放」拼接的方式解决首尾衔接问题，不需要额外生成或手动寻找衔接点。
5. **人工检查**：确认风格与已有静态设计一致、动作流畅无跳变、首尾帧衔接自然；不满意则重新生成或补充人工微调。

### 2D 序列素材路径规范（角色/装扮可替换预留）

所有 2D 序列帧素材按以下分层目录入库（**权威规范**，后续素材一律遵守）：

```
public/sprites/{characterId}/{outfitId}/{animationName}/frame_{NNN}.png
```

| 段 | 规则 | 当前默认值 |
|---|---|---|
| `characterId` | kebab-case 角色标识 | `tiger-cub` |
| `outfitId` | kebab-case 装扮标识 | `monk-robe-default` |
| `animationName` | kebab-case 动作名，只描述动作语义，**不含角色/装扮信息** | 如 `wave-hello` |
| 帧文件名 | 统一 `frame_001.png` 起、3 位零填充、连续编号；动作名不重复出现在文件名里 | — |

**解耦分层**（为未来「角色/装扮可替换」预留，本阶段不实现换装 UI）：

- `EmotionController` 映射表只存「情绪 key → 序列名」，与外观无关；
- `spriteManifest.js` 只存「序列名 → 动作名 + 帧数 + 播放参数」，不存具体路径；
- 角色/装扮标识与路径拼接**唯一出口**为 `character/CharacterConfig.js`
  （`getActiveAppearance` / `setActiveAppearance` / `buildFramePath(s)`），
  播放器在预加载/播放时实时解析，任何模块不得自行手写 sprites 路径。
- 未来换装 = 新素材目录 + `setActiveAppearance()` + 选择 UI；不改情绪触发链路与播放器。

### 播放机制

当前采用 `SpriteSequencePlayer`：主 `<img>` + `requestAnimationFrame` 逐帧换图，
支持 `none` / `forward` / `pingpong`、逐帧额外停留、完成回调与立即打断。

**跨序列衔接（CapCut 式叠代，2026-07-20）**

| 情况 | 做法 |
|---|---|
| 两序列无法自然衔接（画幅/姿态跳变） | 双 `<img>` **叠代溶解**：定格末帧↔首帧，默认 **`CAPCUT_DISSOLVE_MS`（1000ms）** `ease-in-out`；`freezeUntilCrossFadeEnds: true` 时溶解期间不推进新序列帧 |
| 同源可衔接（同画幅微表情、子序列） | 可用短 cross-fade（`MICRO_CROSS_FADE_MS` ≈180ms）或不冻帧 |
| 调试验收 | `holdPose` 定格末帧，可不回落 idle |

一次性情绪经 `EmotionController._finishOneShot` 回落 idle 时**默认**走 CapCut 溶解；禁止业务路径闪切。详见 `PRINCIPLES.md`「序列衔接：CapCut 式叠代」。

清单可用 `startFrame + frameCount` 从同一素材目录注册子序列；例如
`halo-breathing` 可拆成 001–006 一次性过渡与 007–030 呼吸循环，而无需复制素材。
尚未绑定的候选序列须设 `preload: false`，避免增加首屏下载与解码成本；首次技术试播时
由播放器按需预加载。预加载路径会去重，同目录子序列不会重复请求同一帧。

上层仍只调用 `EmotionController.playEmotion(emotionKey)`；2D 播放器作为映射表内的底层实现接入，不改业务层。
尚未确认业务语义的素材可以只注册播放器序列，不得提前绑定 emotion key。

### 动态效果调整（相对原 3D 方案）

- **绕 Y 轴旋转 / 程序化呼吸起伏 / 庆祝悬浮**（`DynamicMotion`）：属 **3D 奖励柜** 展示效果；**不**在 2D 主界面暴露开关或叠加到精灵层。2D 呼吸观感由 `idle-breathing` 等帧序列本身承载。
- 代码与 `playEmotion('rotation'|'breathing'|'hover')` 映射**保留**，供未来奖励场景复用；调试面板已从 2D UI 移除对应勾选。

### 2D 主线的金色进度表达（视觉原则落地方案）

依据「本体固有色恒定」原则（2026-07-15 确立，见 DESIGN.md「视觉状态」章节）：

- 2D PNG 序列每帧颜色在素材产出时已烘焙固定，角色本体**天然不变色**——这与新原则天然一致，无需对既有素材做任何处理。
- 专注进度的金色反馈由**精灵图层之外**的效果承载：
  1. **金色光晕 overlay**：独立于帧序列的发光图层（CSS `box-shadow` / `filter: drop-shadow` / 径向渐变 div 均可，实现阶段定），强度随 focusLevel 插值；
  2. **金色粒子**：独立粒子层叠加在精灵周围。
- **光晕呼吸律动（2026-07-15 拍板，通用行为）**：光晕 overlay 强度在 focusLevel 基础值之上叠加 4 秒周期的呼吸律动（吸气收敛聚焦 / 呼气柔和晕染），与角色呼吸动画同步；实现上是 overlay 层的强度调制，不触碰精灵本体。
- **光影物理渐进（2026-07-18，2D 翻译）**：Arrival Practice（冷→暖背景、**三层视差 Dolly**、4s 呼吸光环、Choose 坐垫光晕）与 Recover/Re-focus（60s 阈值下的扰动 + 约 20% 亮度下降、5s 平复）由 `LightProgression`（DOM/CSS）承载；日常 `focusLevel` 另有 **DOM Rim**（`updateFocusGlow`）作 2D 主线主观感。详规见 `LIGHT_PROGRESSION_DESIGN.md`。**禁止**为此引入主界面 3D 相机推拉、Shader 或 GSAP。
- **里程碑增强序列**：`MilestoneGlow`（10s 仪式性反馈，含金光蝴蝶）是上述光晕呼吸律动的增强版；27 帧 `milestone-glow` 透明 PNG 已按角色/装扮分层规范入库并接入仅供预览的调试情绪键。该专属叙事动画（与 `Celebrating` / `SessionComplete` 同类）允许自身烧录金光与蝴蝶，不受日常 focusLevel 光效必须与角色层分离的约束；播放期临时归零 `FocusVisualizer` / Rim Light，末帧固定停留 2.5s 后回落，不另建也不等待外部叠加层。真实里程碑判定与业务触发仍归属 Backlog「纪念奖励系统」。
- **禁止**通过逐帧重着色、CSS 色相滤镜（`hue-rotate` / `sepia` 等作用于精灵本体）等方式改变角色本体颜色来表达进度。

---

## 未来扩展：角色/装扮可替换性

当前阶段只使用单一固定形象：小老虎僧袍造型，`characterId = 'tiger-cub'`、`outfitId = 'monk-robe-default'`。角色/装扮可替换性是架构风险预留，不代表当前阶段提供换装功能。

工程侧已完成以下解耦：

1. **素材路径参数化**：统一遵循
   `public/sprites/{characterId}/{outfitId}/{animationName}/frame_001.png`
   （完整规则见上文「2D 序列素材路径规范」）。`characterId` / `outfitId`
   由配置传入，业务代码不得硬编码 sprites 路径字符串。
2. **情绪触发与外观解耦**：`EmotionController` 映射表只表达
   「情绪 key → 触发什么动作」（例如 `welcomeBack` → `waveHello`；
   `incenseComplete` 仍为独立反馈效果），不感知角色、装扮或素材路径。
   更换角色/装扮不修改情绪触发逻辑。
3. **路径解析唯一出口**：`character/CharacterConfig.js` 统一维护当前生效的
   `characterId` / `outfitId`，并提供 `buildFramePath()` /
   `buildFramePaths()`。`SpriteSequencePlayer` 在预加载和播放时通过该模块解析路径；
   `EmotionController` 不解析路径、也不直接读取素材，从而保持更彻底的分层。
   任何其它模块均禁止自行拼接 sprites 路径。
4. **当前范围边界**：本阶段只完成路径与触发逻辑解耦；不实现用户选择角色/装扮的
   UI 或交互，不制作多套角色/装扮素材，也不增加相关持久化。
5. **与纪念奖励系统的潜在联动**：Backlog「纪念奖励系统」中的 3D 塑胶公仔展示，
   未来可复用同一套 `characterId` / `outfitId` 身份抽象来关联 2D 主线形象与
   3D 奖励资产；具体资产注册表与数据模型须另开任务设计。

---

## 工程加固四步（2026-07-21 拍板）

> **背景**：记录在案的缺陷里，门闩/时序与 DOM 手动渲染约各占三成，序列观感另占约四成。  
> **不采纳**：全仓 Lit 化、为 Lit 引入重构建链、用 Lit 重写 Emotion / Idle / 序列播放。

| 步 | 内容 | 状态 |
|---|---|---|
| **1** | **JSDoc + 门闩/共享资源契约 + 文档-代码对齐**：公共 API 须有类型注释；改门闩先查 `SHARED_RESOURCES.md` §4；结构契约见 **`DOC_CODE_CONTRACT.md`**（`npm run docs:check`） | **已落地（门闩 + hints）**：`sessionUiGateContractRegistry.js` + `onboardingHintRegistry.js`；其余 UI JSDoc 增量 |
| **2** | **门闩显式化**：`SessionUiGate`（`src/core/SessionUiGate.js`）集中持有 `arrivalGateReady` / `completionPending` / `postSessionOverlayActive`；失败用例锁「未就绪不得 begin」 | **已落地** |
| **3** | **继续回归锁**：主路径 + 回流 + `test:smoke` / `test:e2e` + TEST_TRACKER 观感分列（见 `DEV_WORKFLOW_QUALITY.md`） | 常驻，不替代 |
| **4** | **Lit 仅试点一个 DOM 灾区 UI**：**`OnboardingHintsUI`**（分散提示 + `?` 补救；DOM/手动渲染类 bug 最多） | **代码已落地**：`lit` + `ft-onboarding-hint-bubble`；**人工复测通过后先停在试点，不扩其它模块**（2026-07-21 拍板）；待人工复测 |

**边界**：

- **可用 Lit**：复杂叠层 UI（频繁状态 ↔ DOM）；新模块若确为复杂 UI 亦可从第一天用 Lit。
- **试点选定依据（2026-07-21）**：按「DOM 没同步 / 手动渲染」类缺陷密度选模块，**不**按门闩类整体吵闹度。故试点为 **OnboardingHintsUI**，**不是** Companion / Arrival（后二者主痛点是门闩，已由 `SessionUiGate` 收束）。
- **扩面闸门（2026-07-21）**：人工复测通过后 **先停在本试点**；不得自行扩到 Honesty / Companion / Arrival 等。再扩须新的书面拍板。
- **禁止 Lit**：`EmotionController` / `IdleOrchestrator` / `SpriteSequencePlayer` / 计时与跨工具专注逻辑 —— 继续纯 JS + 现有 core 边界。
- **渐进**：禁止 Big Bang 全盘重写；试点失败可回退，不得牵连情绪主线。

纯裁决函数仍在 `FocusSession.js`（`canBeginFocusOnCompanionModeSelect` 等）；`SessionUiGate` 只收束可变态并组合调用，供 `main.js` 装配。DEV：`window.__sessionUiGate`。

---

## Focus Confidence 数据层与视觉层的接口约定

- 数据层(负责监听Page Visibility、window焦点、idle检测,计算Focus Confidence分值与Flow Continuity百分比)应作为独立的数据适配模块存在,不与MoodController或PoseManager直接耦合
- 视觉层(粒子系统、光环/环境光强度插值等动态效果层)只接收数据层输出的**连续性参数**(0-1或0-100的数值),不关心该数值背后的具体计算逻辑或信号来源,保持关注点分离
- 未来若接入新的信号源(见下方 Backlog 与 `PROCESS.md` Backlog),只需在数据层扩展计算逻辑,视觉层接口不需要变动

---

## Backlog（架构向远期项）

下列事项**不安排当前开发任务**；排期以 `TASKS.md` / `PROCESS.md` 阶段划分为准。产品语义与诚实机制边界见 `PRINCIPLES.md` / `DESIGN.md`。

### Backlog:未来数据源扩展 — 系统级健康中枢读取（Phase 1 规划）

> **阶段标注**：Phase 1（留存优化期）评估项；**Phase 0 / 当前 MVP 不实现**。  
> **2026-07-16 记录**。协作排期索引亦见 `PROCESS.md` Backlog 列表。

#### 方案说明

现有「诚实机制（Honesty Check-in）」依赖用户**手动**打卡补登。未来可扩展为自动读取系统级健康数据，减少手动操作负担：

| 平台 | API / 数据类型 | 说明 |
|---|---|---|
| **iOS** | Apple HealthKit · `HKCategoryTypeIdentifierMindfulSession`（Mindful Minutes） | Calm、Headspace 等第三方冥想 App 完成练习后通常会写入；Focus Tiger 在用户授权读取后可获取 |
| **Android** | Google Health Connect · `MindfulnessSessionRecord` | 记录冥想、瑜伽、引导呼吸等会话的起止时间与类型 |

**Android 覆盖注意**：Health Connect 正念会话相关能力目前随 **Android 16 DP1** 预装路径推进，并计划经 Google Play 系统更新逐步推送到 **Android 14 及以上**设备。规划上线时间须计入设备 **discovery / 覆盖滞后期**，**不能假设**全体安卓用户设备立即支持该数据类型。

#### 与现有诚实机制的关系

本能力**不替代**、而是**补充**手动 Honesty Check-in：

- 用户可自主选择授权自动读取（体验更无感），或继续仅用手动打卡（无需交出健康数据隐私）；
- 两种方式**并存**；**禁止**强制开启健康数据授权；
- 符合「陪伴而非监督」与诚实机制：授权是礼物式可选，不是监督门槛。

#### 分期规划

- **Phase 0（当前 MVP）**：**不实现**。坚持通过诚实机制手动打卡，以及 Companion Mode（用户自选会话语境的陪伴声明）跑通核心体验；避免 HealthKit / Health Connect SDK 集成带来的包体积与开发测试成本。
- **Phase 1（留存优化期，时间点待定）**：评估引入 HealthKit（iOS）与 Health Connect（Android）的读取权限申请与数据拉取，作为面向海外用户的差异化加分项。自动读取的正念分钟数可转化为角色金光 / Rim Light 强度的**增强输入**——复用 Ambient Soundscape 已确立的「外部 / 附加信号 → 光效强度」数据流模式（`presenceBoost` 类叠加、不改写 `focusLevel` 达标真值），**不新建**独立光效计算逻辑。

#### 架构约束（若 Phase 1 立项）

- 健康数据适配层须落在 Focus Confidence / 会话完成数据层一侧，视觉层只消费数值参数（见上文接口约定）；
- 须遵守 `MVP_PRODUCT_DEFINITION.md` 隐私承诺与本地优先边界；权限文案不得验证语气、不得暗示「不开授权就不算练习」；
- 与手动 Honesty Check-in、Companion Mode **入口与记账语义**须在立项 Task Brief 中写清，禁止 silently 覆盖用户已有手动记录而不告知。
