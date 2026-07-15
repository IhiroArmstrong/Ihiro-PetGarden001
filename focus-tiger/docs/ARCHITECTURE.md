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
  - Shader(灰→金渐变、光晕、柔焦)需要专人写或找现成后处理库，
    调试成本比CSS filter高一个量级
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

---

## 项目目录结构 v5.0

```
focus-tiger/
├─ docs/                          # 流程/设计文档，不参与构建
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
│  │  ├─ PostProcessing.js      # shader pass 管理(灰→金、光晕、柔焦)
│  │  ├─ FocusSession.js        # 专注会话：计时、focusLevel计算
│  │  ├─ StateManager.js        # 全局状态机：IDLE/FOCUSING/BREAK/CELEBRATE/DORMANT
│  │  ├─ Milestone.js           # 里程碑：连续天数、累计时长
│  │  └─ MoodController.js      # 只负责把StateManager的状态翻译成"该播哪个动画"，
│  │                            # 自己不存状态(职责边界见上方说明)
│  │
│  ├─ character/
│  │  ├─ TigerCharacter.js      # 小老虎：灰→金渲染、动画播放控制
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
   不好维护的"上帝文件"，尤其本项目的后处理效果(灰→金、光晕、柔焦)
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

通过 `requestAnimationFrame` 逐帧切换，或 Sprite Sheet（帧图拼合为单张大图，用 `background-position` 切换）方式实现帧序列播放。具体选择在实现阶段根据性能表现决定。

上层仍只调用 `EmotionController.playEmotion(emotionKey)`；2D 播放器作为映射表内的底层实现接入，不改业务层。

### 动态效果调整（相对原 3D 方案）

- **绕 Y 轴旋转**：在 2D 方案下**取消**，不做同等替代（2D 媒介不支持真实三维旋转观感）。
- **呼吸起伏等基于 transform 的动态效果**：**予以保留**，可继续叠加在帧序列播放之上。
- **悬浮等庆祝附属效果**：视 2D 画面表现另行评估；不强制复刻 3D 位移参数。

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
5. **与奖励系统的潜在联动**：Backlog「奖励系统」中的 3D 塑胶公仔展示，
   未来可复用同一套 `characterId` / `outfitId` 身份抽象来关联 2D 主线形象与
   3D 奖励资产；具体资产注册表与数据模型须另开任务设计。

---

## Focus Confidence 数据层与视觉层的接口约定

- 数据层(负责监听Page Visibility、window焦点、idle检测,计算Focus Confidence分值与Flow Continuity百分比)应作为独立的数据适配模块存在,不与MoodController或PoseManager直接耦合
- 视觉层(粒子系统、材质插值等动态效果层)只接收数据层输出的**连续性参数**(0-1或0-100的数值),不关心该数值背后的具体计算逻辑或信号来源,保持关注点分离
- 未来若接入新的信号源(见下方PROCESS.md的Backlog),只需在数据层扩展计算逻辑,视觉层接口不需要变动
