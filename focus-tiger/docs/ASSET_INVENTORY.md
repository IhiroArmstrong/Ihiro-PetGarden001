# ASSET_INVENTORY.md — 美术 / 动画素材盘点

**最后盘点**：2026-07-18 21:20（UTC+8）  
**对照上次**：2026-07-17 Canvas 盘点（`focus-tiger-emotion-asset-inventory.canvas.tsx`）  
**互动页**：同名 Canvas（聊天旁可打开）；本文档为可入库的镜像记录。

扫描范围：`public/sprites/tiger-cub/monk-robe-default/`、`spriteManifest.js`、`EmotionController.js`、`public/models/`、仓库根目录 `*-transparent.zip`、`docs/NEW_ASSETS_2026-07-18.md`。

---

## 总览

| 指标 | 数值 |
|---|---|
| 已安装动画目录 | **19** |
| 磁盘 PNG 帧合计 | **407** |
| 相对上次新增目录 | **5**（celebrate-dance-v2 / palms-together / breath-halo-expand / lotus-front-rising / lotus-chest-halo） |
| 仅 manifest、无业务触发 | **3**（breath-halo-expand / lotus-front-rising / lotus-chest-halo） |
| 3D GLB（奖励柜/垫底） | 7 |

**主结论**：2026-07-17 盘点时仍为根目录 ZIP 候选的 session-complete / nod-bow / stretch / milestone-glow 均已入库并接线。本次增量来自 `NEW_ASSETS_2026-07-18`：两套已接线（Celebrating 第二变体、`intentionSet`），三套按 Backlog 边界仅入库。

---

## 相对上次盘点的增量（2026-07-17 → 2026-07-18）

| 动画目录 | 来源 | 帧 | 素材变化 | 接线变化 |
|---|---|---|---|---|
| `celebrate-dance-v2` | `dance-v2-transparent.zip` | 60 · 1056×864 | Celebrating 第二变体入库 | 不新建 key；`celebrating` 50/50 选用 |
| `palms-together` | `palms-together-transparent.zip` | 14 · 960×960 | Choose 确认合十入库 | 新 key `intentionSet`；与坐垫 CSS 光晕叠加 |
| `breath-halo-expand` | `breath-halo-expand-transparent.zip` | 17 · 1056×864 | MilestoneGlow 简化备选 | 仅 manifest（`preload: false`） |
| `lotus-front-rising` | `lotus-front-rising-transparent.zip` | 7 · 1056×864 | 莲花池首朵 | 仅 manifest；天数追踪未做 |
| `lotus-chest-halo` | `lotus-chest-halo-transparent.zip` | 10 · 1056×864 | Grow Together 纪念解锁候选 | 仅 manifest；里程碑规则未定 |

---

## 已安装 2D 序列（全表）

路径规范：`public/sprites/{characterId}/{outfitId}/{animation}/frame_NNN.png`  
当前默认：`tiger-cub` / `monk-robe-default`。

| 目录 | 帧数 | 尺寸 | 约 MB | Manifest key | 状态 |
|---|---:|---|---:|---|---|
| idle-breathing | 21 | 1056×864 | 13.4 | idleBreathing | 已接线 · Idle 基底 |
| idle-eye-glance | 8 | 1056×864 | 4.8 | idleEyeGlance | 已接线 · Idle 变体 |
| blink-smile | 12 | 1056×864 | 7.3 | blinkSmile | 已接线 · smiling / blink |
| wave-hello | 19 | 1056×864 | 11.3 | waveHello | 已接线 · welcomeBack |
| celebrate-dance | 57 | 1056×864 | 47.2 | celebrateDance | 已接线 · celebrating 50% |
| celebrate-dance-v2 | 60 | 1056×864 | 35.8 | celebrateDanceV2 | 已接线 · celebrating 50% |
| session-complete | 28 | 1056×864 | 19.3 | sessionComplete | 已接线 · 同日非首次完成 |
| nod-bow | 13 | 1056×864 | 7.6 | nodBow | 已接线 · mindfulAcknowledge |
| stretch-reminder | 17 | 1056×864 | 10.9 | stretchReminder | 已接线 · 2h 舒展 |
| sleeping | 8 | 960×960 | 3.9 | sleeping | 已接线 · DORMANT |
| dormant-wake | 16 | 960×960 | 7.8 | dormantWake | 已接线 · Honesty |
| halo-breathing | 30 | 1056×864 | 25.0 | haloBreathing* | 已接线 · 唤醒后奖励 |
| nod-greeting | 23 | 1056×864 | 14.0 | nodGreeting | 已接线 · 靠近 |
| tilt-think | 20 | 1056×864 | 11.3 | tiltThink | 已接线 · 静止歪头 |
| palms-together | 14 | 960×960 | 9.1 | palmsTogether | 已接线 · intentionSet |
| milestone-glow | 27 | 1056×864 | 24.0 | milestoneGlow | 仅调试 · 无里程碑判定 |
| breath-halo-expand | 17 | 1056×864 | 13.4 | breathHaloExpand | 仅清单 · MilestoneGlow 备选 |
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
| dormantWake → haloBreathing | dormant-wake + halo-breathing | 已接线 |
| welcomeBack / nodGreeting / curiousTilt | wave-hello / nod-greeting / tilt-think | 已接线 |
| milestoneGlow | milestone-glow（备选 breath-halo-expand 未用） | 仅调试 |
| incenseComplete | DOM 叠层 | 调试有；业务触发未全接 |
| wakeUp / snoringZZZ | 无 | unimplemented |
| smileSquint / petHead / dizzyBlink | 无序列 | 检测有、视觉占位 |
| eyeTracking | 无正式瞳孔 PNG | 逻辑有、占位瞳孔 |

---

## 3D GLB（`public/models/`）

| 文件 | 大小 | 角色 |
|---|---|---|
| tiger-meditate-closed.glb | 307K | Idle 闭眼运行时（2D 主线默认隐藏 canvas） |
| tiger-meditate-smile.glb | 2.1M | Smiling 垫底 |
| tiger-happy-jump.glb | 2.1M | Celebrating 垫底 |
| tiger-sleeping.glb | 2.1M | Sleeping 垫底 |
| tiger-stand-eyes-closed.glb | 2.1M | tPose 调试 |
| tiger.glb | 2.0M | 历史基底 |
| tiger-meditate-closed.legacy.glb | 2.1M | 历史备份 |

源文件见 `art-reference/models/sources/`（gitignore，不入远程）。

---

## 仓库根目录 ZIP 残留

帧已进 `public/sprites` 后，下列 zip **不是**运行时路径；推送前可考虑移出仓库或删除，避免重复体积。

| 归档 | 约大小 | 状态 |
|---|---|---|
| dance-v2 / palms-together / breath-halo-expand / lotus-* | 见上 | 已解包入库 |
| deep-breath-glow / well-done-tailwag / nod-bow / stretch / tilt-think | — | 早已入库；zip 残留 |

---

## 仍缺正式素材

- EyeTracking 正式瞳孔 PNG  
- smileSquint / petHead / dizzyBlink 动作序列  
- wakeUp / snoringZZZ  

---

## 相关文档

- 进度叙事：`PROCESS.md`「当前进度速览」  
- 情绪语义：`EMOTION_BIBLE.md`  
- 本次入库 Prompt：`NEW_ASSETS_2026-07-18.md`  
- 路径规范：`ARCHITECTURE.md` · `PRINCIPLES.md`（ASCII kebab-case）
