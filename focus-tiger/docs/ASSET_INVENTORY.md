# ASSET_INVENTORY.md — 美术 / 动画素材盘点

**最后盘点**：2026-08-02（UTC+8）· 三套已烘焙 pingpong 入库试验  
**对照上次**：2026-08-01 文档盘点（当时 29 目录 / ~682 帧）  
**互动页**：同名 Canvas（聊天旁可打开）；本文档为可入库的镜像记录。

扫描范围：`public/sprites/tiger-cub/monk-robe-default/`、`spriteManifest.js`、`EmotionController.js`、`public/models/`、仓库根目录 `*-transparent.zip`、`docs/NEW_ASSETS_2026-07-18*.md`。

**场景接线权威**：`SCENE_ANIMATION_WIRING.md`（含 2026-08-01 库存→业务政策与设计师建议采纳对照）。

---

## 总览

| 指标 | 数值 |
|---|---|
| 已安装动画目录 | **32** |
| 磁盘 PNG 帧合计 | **860**（+178：38+46+94） |
| 相对 08-01 文档新增目录 | **3**（`wave-hello-pingpong` / `magic-book-reading` / `golden-halo-palms`） |
| 已归档移出 public | **1**（breath-halo-expand → `art-reference/sprites-archived/`） |
| 待业务触发（非「已取代」） | 见 §「库存→业务」；政策：**须全部接入场景**（分 Slice B/C），禁止长期仅调试 |
| 3D GLB（奖励柜/垫底） | 7+ |

**主结论**：正式 Idle = 呼吸×5→眨眼（**无**自动张望/哈欠）。候选变体池仅调试强制试播。EyeTracking 已废弃。`sleeping` 键 = cloak-sleep **030–034** 双拍 pingpong @ **2 fps**（旧 `sleeping/` 目录保留）。  
**2026-07-20**：关闭 Idle 自动变体（对齐 PRINCIPLES）；调试面板「入库素材」覆盖全部 manifest 序列。  
**2026-07-31**：场景→产品触发对照见 **`SCENE_ANIMATION_WIRING.md`**（v1 Slice A 语言/Honesty Idle）。  
**2026-08-01**：用户 + 设计师——库存须进业务场景；接线表升格 Slice B（活跃陪伴）/ C（荷花）；**勿接**已取代目录。  
**2026-08-02**：三套已烘焙 pingpong 试验入库；开场欢迎池加权；Honesty≥30 → `goldenHaloPalms`。

---

## 相对上次盘点的增量

### 2026-08-02 · 已烘焙 pingpong 三套（试验接线）

| 源文件夹（根目录，入库前重命名） | 入库目录 | 帧 | 试验接线 |
|---|---|---:|---|
| Yin坐禅-挥手-pingpong_frames | `wave-hello-pingpong` | 38 | **停接线**（2026-08-02）；素材保留；960×960 + displayFit |
| Yin坐禅-魔法金光五角星-…-pingpong_frames 3 | `magic-book-reading` | 46 | 开场欢迎池 → `magicBookReading` |
| YIn坐禅-衣服金光-…_94 | `golden-halo-palms` | 94 | Honesty≥30 → `goldenHaloPalms`（替 breathHaloHq 产品路径） |

素材均已含倒放段：产品路径 **正放一次** + CapCut，**禁**再开 player `loopMode: pingpong`。

### 2026-08-02 · 单程看书（无需倒放）

| 源文件夹（根目录，入库前重命名） | 入库目录 | 帧 | 试验接线 |
|---|---|---:|---|
| Yin看书的单程动画-无需倒放的-cutout_frames | `book-reading` | 24 | 日语切语 → `bookReading`（单程 + CapCut）；≠ `magic-book-reading` |

1056×864 RGBA；manifest `bookReading` @ 8 fps；产品路径正放一次（无倒放）。

### 2026-07-19 12:56 · 抠图算法系统性升级（整批替换）

下列 **14** 套 `public/sprites/.../` 帧已由仓库根目录对应 `*-transparent.zip` 全量覆盖（帧数与目录映射不变；旧抠图版本作废）：

| zip 内文件夹 | 入库目录 | 帧 |
|---|---|---:|
| `dance-v2` | `celebrate-dance-v2` | 60 |
| `palms-together` | `palms-together` | 14 |
| `breath-halo-hq` | `breath-halo-hq` | 16 |
| `tea-drinking` | `tea-drinking` | 24 |
| `ear-wiggle-head-touch` | `ear-wiggle-head-touch` | 54 |
| `lotus-front-rising` | `lotus-front-rising` | 7 |
| `lotus-chest-halo` | `lotus-chest-halo` | 10 |
| `deep-breath-glow` | `milestone-glow` | 27 |
| `well-done-tailwag` | `session-complete` | 28 |
| `nod-bow` | `nod-bow` | 13 |
| `stretch` | `stretch-reminder` | 17 |
| `gaze-p1-center-blink-left` | 同名 | 15 |
| `gaze-p2-left-to-up` | 同名 | 13 |
| `gaze-p3-toward-right` | 同名 | 13 |
| `gaze-p4-right-to-down` | 同名 | 25 |
| `yawn-stretch` | 同名 | 16 |

### 2026-07-18 → 2026-07-19 早（目录增量，仍有效）

| 动画目录 | 来源 | 帧 | 素材变化 | 接线变化 |
|---|---|---|---|---|
| `gaze-p1-center-blink-left` | 同名 | 15 | 中→眨→左 | Idle 张望 A |
| `gaze-p2-left-to-up` | 同名 | 13 | 左→上 | Idle 张望 A |
| `gaze-p3-toward-right` | 同名 | 13 | 转向右 | Idle 张望 B |
| `gaze-p4-right-to-down` | 同名 | 25 | 右→下 | Idle 张望 B |
| `yawn-stretch` | `yawn-stretch-transparent.zip` | 16 | 犯困哈欠 | Idle 变体；≠ stretchReminder / dormantWake |
| `tea-drinking` | `tea-drinking-transparent.zip` | 24 | 喝茶 | Idle 变体 |
| `ear-wiggle-head-touch` | `ear-wiggle-…-transparent.zip` | 54 | 摇耳摸头 | Idle 变体（大幅度） |
| `breath-halo-hq` | `breath-halo-hq-transparent.zip` | 16 | 金环呼吸 | MilestoneGlow 备选（替 expand） |

---

## 已安装 2D 序列（全表）

路径规范：`public/sprites/{characterId}/{outfitId}/{animation}/frame_NNN.png`  
当前默认：`tiger-cub` / `monk-robe-default`。

| 目录 | 帧数 | Manifest key | 产品状态（2026-08-01） | 目标业务（若未接线） |
|---|---:|---|---|---|
| idle-breathing | 51 | idleBreathing / … | **已接线** Idle | — |
| idle-eye-glance | 8 | idleEyeGlance | Idle 编排一瞥 | — |
| blink-breathe | 13 | blinkBreathe | **勿接主路径**（Rise 已改） | 仅调试保留 |
| blink-smile | 12 | blinkSmile | **已接线** smiling / curiousTilt | Slice B：微仪式/完成变体池 |
| wave-hello | 19 | waveHello / waveHelloWelcome | **停接线**；入库仅素材对照 | 以后另议 |
| wave-hello-pingpong | 38 | waveHelloPingpong（原 welcomeBack） | **停接线**（2026-08-02） | 素材保留；场景以后另议 |
| magic-book-reading | 46 | magicBookReading | **试验**：开场欢迎池 | 已烘焙 pingpong |
| book-reading | 24 | bookReading | **已接线**：日语切语 + Rise 池 ~15% | 单程无倒放；≠ magic-book |
| golden-halo-palms | 94 | goldenHaloPalms | **试验**：Honesty≥30 | 已烘焙 pingpong；替 breathHaloHq 产品路径 |
| celebrate-dance | 57 | celebrateDance | **已接线** celebrating 50% | — |
| celebrate-dance-v2 | 60 | celebrateDanceV2 | **已接线** celebrating 50% | — |
| session-complete | 28 | sessionComplete | **已接线** 非首次完成 / 微仪式 | Slice B：完成池主权重 |
| nod-bow | 13 | nodBow / intentionNod | **已接线** mindfulAcknowledge · Choose | en 切语；Honesty 短补登 |
| stretch-reminder | 17 | stretchReminder · wakeUp | **已接线** 舒展提醒 | Slice B：与 yawn 同档池 |
| cloak-sleep | 34 | cloakSleep / sleeping / dormantWake | **已接线** 披毯·睡循环·倒放唤醒 | — |
| sleeping（旧目录） | 8 | — | **勿接**（保留） | 已取代 |
| dormant-wake | 16 | （旧正放） | **勿接**（保留） | 已由 cloak 倒放取代 |
| rise-stretch-casual | 39 | riseStretchCasual | **已接线** Rise 池 ~60% | — |
| halo-breathing | 30 | haloBreathing* | 调试可播；业务自动未全接 | **Slice B**：Honesty 长补登 / 微仪式变体 |
| nod-greeting | 23 | nodGreeting | 靠近自动**已拆**；**冷启动欢迎池唯一** | Slice B 开场；2026-08-02 |
| tilt-think | 20 | tiltThink | **勿接主路径** | 仅调试 |
| palms-together | 14 | palmsTogether | 仅调试（Choose 已改 nod；日语切语已改 bookReading） | 调试保留 |
| milestone-glow | 27 | milestoneGlow | **已接线** streak-7 | — |
| meditation-star-reward | 63 | milestoneGlowStar | **已接线** streak-21 / streak-100（同 `milestoneGlow` emotion） | 2026-08-03 入库；**同日改用不抠图源**（星空/白底烧录整幅，替透明抠图） |
| breath-halo-hq | 16 | breathHaloHq | 仅清单 | **Slice B**：Glow 备选 / 长补登光环 |
| tea-drinking | 24 | teaDrinking | **已接线**：English 切语 + 深夜池 + Rise 池 ~25% | Slice B；Rise holdPose |
| yawn-stretch | 16 | yawnStretch | 仅调试 | **Slice B**：清晨/深夜（冷却）；**勿**进 Rise |
| ear-wiggle-head-touch | 54 | earWiggleHeadTouch | **已接线** 好奇池等（正+倒一次→~1s CapCut Idle） | Slice B；与 welcome 同契约；2026-08-02c |
| gaze-p1…p4 | 15/13/13/25 | gazeP* | 仅调试 | **Slice B**：稀有好奇张望 |
| lotus-front-rising | 7 | lotusFrontRising | 仅清单 | **Slice C**：Grow / 纪念 |
| lotus-chest-halo | 10 | lotusChestHalo | 仅清单 | **Slice C**：Grow Together |

\* `halo-breathing` 在清单中拆为 intro / loop / pingpong 子序列。

### 库存→业务（政策摘要）

详见 `SCENE_ANIMATION_WIRING.md` §九–§十。**用户 2026-08-01**：仅清单 / 仅调试且未标「勿接」者接入业务；Honesty **≤20 / ≥30**；其余设计师项与 Dispatcher **一批**实现（荷花除外走 Slice C）。

---

## EmotionController 键对照（摘要）

| 键 | 素材 | 接线 |
|---|---|---|
| idle / sleeping / smiling | 上表对应序列 | 已接线 |
| celebrating | dance + dance-v2 | 已接线 · 50/50 |
| intentionSet | **intentionNod（nod-bow）**；palms-together 不再作 Choose | 已接线 · Choose；**≠** 日语切语目标视觉 |
| sessionComplete / mindfulAcknowledge / stretchReminder | 上表 | 已接线 |
| dormantWake → idle | cloak-sleep **倒放**（原 dormant-wake 保留素材未删） | 已接线 · **6 fps** · 定格末帧；**暂不**自动接 halo（2026-07-21 试替倒放） |
| haloBreathing | halo-breathing | 调试可单独播；**Slice B** 接 Honesty 长补登等 |
| welcomeBack / nodGreeting / curiousTilt / earWiggle | waveHelloWelcome / nod-greeting / **blink-smile** / earWiggle 烘焙正+倒 | welcomeBack/earWiggle：烘焙正+倒一次 + CapCut（禁 player pingpong）；nodGreeting：正放一次；curiousTilt：blink-smile |
| milestoneGlow | milestone-glow（streak-7）· meditation-star-reward（21/100）；breath-halo-hq 仅调试 | **产品路径已接线**（节点轮换） |
| riseStretchCasual / cloakSleep | rise-stretch-casual / cloak-sleep | 已接线 |
| incenseComplete | DOM 叠层 | 调试有；业务触发未全接 |
| wakeUp | stretch-reminder（同源） | 已接线；与 Honesty 视觉分离（2026-07-19） |
| snoringZZZ | 无 | unimplemented |
| smileSquint / petHead / dizzyBlink | 无序列 | 检测有、视觉占位 |
| eyeTracking | `public/textures/eye-pupils/pupil-{left,right}.png` | **已废弃（2026-07-19）**：不再接线；原因见 `CORE_LOOP.md`。PNG 可留作历史素材 |

---

## 3D GLB（`public/models/`）

| 文件 | 大小 | 角色 |
|---|---|---|
| tiger-meditate-closed.glb | ~1.6M | Idle 闭眼运行时（2026-07-19：1024/512 + lossless WebP + Draco，无减面；无红边单色灰棉麻） |
| tiger-meditate-closed.webp-292k.glb | 292K | 警示备份：默认 WebP 过度压缩，贴图细节受损，勿作正式运行时 |
| tiger-meditate-closed.crimson-trim-307k.glb | 307K | 历史备份（灰棉麻+深红镶边）；非正式服装 |
| tiger-meditate-smile.glb | 2.1M | Smiling 垫底（衣着是否与圣经一致待后续对齐） |
| tiger-happy-jump.glb | 2.1M | Celebrating 垫底 |
| tiger-sleeping.glb | 2.1M | Sleeping 垫底 |
| tiger-stand-eyes-closed.glb | 2.1M | tPose 调试 |
| tiger.glb | 2.0M | 历史基底 |
| tiger-meditate-closed.legacy.glb | 2.1M | 更早历史备份（KTX2/UASTC + Draco） |

源文件见 `art-reference/models/sources/`（gitignore，不入远程）。当前正式源：`yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb`。压缩配方见该目录 `README.md`。

---

## 仓库根目录 ZIP 残留

帧已进 `public/sprites` 后，下列 zip **不是**运行时路径；推送前可考虑移出仓库或删除，避免重复体积。

| 归档 | 约大小 | 状态 |
|---|---|---|
| 上表 14 套 `*-transparent.zip`（2026-07-19 新算法重打包） | 见根目录 | **已解包覆盖入库**；zip 仍 gitignore，仅本地备份 |
| tilt-think 等更早 zip | — | 未在本轮 14 套内；旧 zip 可移出仓库 |

---

## 仍缺正式素材

- smileSquint / petHead / dizzyBlink 动作序列  
- wakeUp → 伸懒腰（stretch-reminder 同源）；snoringZZZ 仍缺；第二套侧卧睡醒素材仍缺
- ~~EyeTracking 正式瞳孔 PNG~~ → 曾入库但功能已废弃（见 `CORE_LOOP.md`），勿再接线

---

## UI 图标（非序列帧）

> **路径**：`public/icons/`（**不是** `public/sprites/{characterId}/...`）。  
> **入库**：2026-07-26 · 窄屏 Idle 主画布三主钮；**2026-07-27** 换 **v3** cream 底图腾。

| 文件 | 约尺寸 | 用途 | 接线 |
|---|---|---|---|
| `icon-sit-with-yin.png` | ~398×398 RGBA（**v3** cream 底 + 金 ensō） | Sit with Yin（窄屏球） | `#ft-narrow-home-sit` ← `BTN_FOCUS_START` 代理 |
| `icon-quick-start.png` | ~397×397 RGBA（**v3**） | Quick Start（窄屏球） | `#ft-narrow-home-quickstart` ← `#quick-start-focus` 代理 |
| `icon-honesty-checkin.png` | ~396×396 RGBA（**v3**） | Honesty Check-in（窄屏球） | `#ft-narrow-home-honesty` ← handler / `#honesty-idle-entry` 代理 |

**v3（2026-07-27）**：替换 v2（橙褐底扁平）；不两版并存。圆形 cream 底 + 金图腾，素材内边距约 **17–21%** 直径（@72 CSS px 约 12–15px）；窄屏显示仍约 **72×72**。画布顺序：**Quick Start · Sit with Yin · Honesty**。逻辑/门闩不变，仅视觉。缓存戳 `?v=4`。已去掉 v2 试看用的 CSS `contrast/saturate` filter（按素材原色显示）。

**边距观感**：相对 v2「收紧」版，v3 图腾在 72px 下略偏疏（Quick Start 火焰左右留白更多）。若嫌小，可再出一版压到约 **10–12%** 边距，或把 `HOME_CTA_PX` 提到 80——**待用户拍板**，本次未改显示尺寸。

---

## 相关文档

- 进度叙事：`PROCESS.md`「当前进度速览」  
- 情绪语义：`EMOTION_BIBLE.md`  
- 本次入库 Prompt：`NEW_ASSETS_2026-07-18.md`  
- 路径规范：`ARCHITECTURE.md` · `PRINCIPLES.md`（ASCII kebab-case）
