# ASSET_INVENTORY.md — 美术 / 动画素材盘点

**最后盘点**：2026-07-20（UTC+8）  
**对照上次**：2026-07-19 12:56 盘点  
**互动页**：同名 Canvas（聊天旁可打开）；本文档为可入库的镜像记录。

扫描范围：`public/sprites/tiger-cub/monk-robe-default/`、`spriteManifest.js`、`EmotionController.js`、`public/models/`、仓库根目录 `*-transparent.zip`、`docs/NEW_ASSETS_2026-07-18*.md`。

---

## 总览

| 指标 | 数值 |
|---|---|
| 已安装动画目录 | **26** |
| 磁盘 PNG 帧合计 | **566**（约；含 tea 24 + ear 54 + halo-hq 16，减 expand 17） |
| 相对 07-19 新增目录 | **3**（tea-drinking / ear-wiggle-head-touch / breath-halo-hq） |
| 已归档移出 public | **1**（breath-halo-expand → `art-reference/sprites-archived/`） |
| 仅 manifest、无业务触发 | **3**（breath-halo-hq / lotus-front-rising / lotus-chest-halo） |
| 3D GLB（奖励柜/垫底） | 7+ |

**主结论**：正式 Idle = 呼吸×5→眨眼（**无**自动张望/哈欠）。候选变体池仅调试强制试播。EyeTracking 已废弃。`sleeping` 键 = cloak-sleep **030–034** 双拍 pingpong @ **2 fps**（旧 `sleeping/` 目录保留）。  
**2026-07-20**：关闭 Idle 自动变体（对齐 PRINCIPLES）；调试面板「入库素材」覆盖全部 manifest 序列。

---

## 相对上次盘点的增量

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

| 目录 | 帧数 | 尺寸 | 约 MB | Manifest key | 状态 |
|---|---:|---|---:|---|---|
| idle-breathing | 51 | 1056×864 | ~38 | idleBreathing / idleBreathClosed / idleBlinkArc | 已接线 · Idle 切分：闭 19 帧 ×2 + 弧 33 帧 ×1 pingpong |
| idle-eye-glance | 8 | 1056×864 | 4.8 | idleEyeGlance | 入库 · **仅调试**（正式 Idle 已并入 idle-breathing） |
| gaze-p1-center-blink-left | 15 | — | — | gazeP1CenterBlinkLeft | 入库 · **仅调试**（正式 Idle 不自动播） |
| gaze-p2-left-to-up | 13 | — | — | gazeP2LeftToUp | 入库 · 调试张望 A |
| gaze-p3-toward-right | 13 | — | — | gazeP3TowardRight | 入库 · 调试张望 B |
| gaze-p4-right-to-down | 25 | — | — | gazeP4RightToDown | 入库 · 调试张望 B |
| yawn-stretch | 16 | — | — | yawnStretch | 入库 · **仅调试** |
| tea-drinking | 24 | 1056×864 | — | teaDrinking | 入库 · **仅调试** |
| ear-wiggle-head-touch | 54 | 1056×864 | — | earWiggleHeadTouch | 入库 · **仅调试** |
| blink-smile | 12 | 1056×864 | 7.3 | blinkSmile | 已接线 · smiling / blink / **curiousTilt** |
| wave-hello | 19 | 1056×864 | 11.3 | waveHello | 已接线 · welcomeBack |
| celebrate-dance | 57 | 1056×864 | 47.2 | celebrateDance | 已接线 · celebrating 50% |
| celebrate-dance-v2 | 60 | 1056×864 | 35.8 | celebrateDanceV2 | 已接线 · celebrating 50% |
| session-complete | 28 | 1056×864 | 19.3 | sessionComplete | 已接线 · 同日非首次完成 |
| nod-bow | 13 | 1056×864 | 7.6 | nodBow | 已接线 · mindfulAcknowledge |
| stretch-reminder | 17 | 1056×864 | 10.9 | stretchReminder · wakeUp | 舒展提醒 + 调试「唤醒(伸懒腰)」同源不同键 |
| sleeping（键） | 用 cloak-sleep 030–034×2 拍 | 同 cloak-sleep | — | sleeping | 已接线 · DORMANT；**2 fps** pingpong；旧 `sleeping/` 8 帧保留未删 |
| dormant-wake | 16 | 960×960 | 7.8 | dormantWake | 已接线 · **仅 Honesty**；**3 fps**；定格末帧；暂不接 idle 淡入 / halo |
| halo-breathing | 30 | 1056×864 | 25.0 | haloBreathing* | 已接线 · 唤醒后奖励 |
| nod-greeting | 23 | 1056×864 | 14.0 | nodGreeting | 素材+调试保留；**靠近自动触发已拆除**（2026-07-19）；**6 fps** + 末帧多停 2 拍 |
| tilt-think | 20 | 1056×864 | 11.3 | tiltThink | 存量；curiousTilt 默认已改 blink-smile（2026-07-19） |
| palms-together | 14 | 960×960 | 8.6 | palmsTogether | 已接线 · intentionSet · **正放→倒放回闭目**（4fps≈6.8s）· 2026-07-19 新抠图 |
| milestone-glow | 27 | 1056×864 | 24.0 | milestoneGlow | 仅调试；**4 fps**（2026-07-19 放慢 2×） |
| breath-halo-hq | 16 | 1056×864 | — | breathHaloHq | 仅清单 · MilestoneGlow 备选（替 expand） |
| lotus-front-rising | 7 | 1056×864 | 4.2 | lotusFrontRising | 仅清单 · 莲花池 Backlog |
| lotus-chest-halo | 10 | 1056×864 | 7.3 | lotusChestHalo | 仅清单 · Grow Together 候选 |

\* `halo-breathing` 在清单中拆为 intro / loop / pingpong 子序列。

---

## EmotionController 键对照（摘要）

| 键 | 素材 | 接线 |
|---|---|---|
| idle / sleeping / smiling | 上表对应序列 | 已接线 |
| celebrating | dance + dance-v2 | 已接线 · 50/50 |
| intentionSet | palms-together | 已接线 · Choose 确认 |
| sessionComplete / mindfulAcknowledge / stretchReminder | 上表 | 已接线 |
| dormantWake → idle | cloak-sleep **倒放**（原 dormant-wake 保留素材未删） | 已接线 · **6 fps** · 定格末帧；**暂不**自动接 halo（2026-07-21 试替倒放） |
| haloBreathing | halo-breathing | 调试可单独播；Honesty 暂不自动接 |
| welcomeBack / nodGreeting / curiousTilt | wave-hello / nod-greeting / **blink-smile** | 已接线（curiousTilt 不再默认 tilt-think） |
| milestoneGlow | milestone-glow（备选 breath-halo-hq 未用） | 仅调试 |
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
> **入库**：2026-07-26 · 窄屏 Idle 主画布三主钮。

| 文件 | 约尺寸 | 用途 | 接线 |
|---|---|---|---|
| `icon-sit-with-yin.png` | ~396×396 RGBA（收紧内边距后） | Sit with Yin（窄屏球） | `#ft-narrow-home-sit` ← `BTN_FOCUS_START` 代理 |
| `icon-quick-start.png` | ~383×383 RGBA | Quick Start（窄屏球） | `#ft-narrow-home-quickstart` ← `#quick-start-focus` 代理 |
| `icon-honesty-checkin.png` | ~386×386 RGBA | Honesty Check-in（窄屏球） | `#ft-narrow-home-honesty` ← handler / `#honesty-idle-entry` 代理 |

圆形图腾已收紧 PNG 内边距；窄屏显示约 **72×72 CSS px**。画布顺序：**Quick Start · Sit with Yin · Honesty**。逻辑/门闩不变，仅视觉与显隐同步。

---

## 相关文档

- 进度叙事：`PROCESS.md`「当前进度速览」  
- 情绪语义：`EMOTION_BIBLE.md`  
- 本次入库 Prompt：`NEW_ASSETS_2026-07-18.md`  
- 路径规范：`ARCHITECTURE.md` · `PRINCIPLES.md`（ASCII kebab-case）
