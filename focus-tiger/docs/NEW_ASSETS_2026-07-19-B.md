# NEW_ASSETS_2026-07-19-B.md — Rise 场景与斗篷入睡过渡

> **源 zip（仓库根）**
> - `rise-stretch-casual-transparent.zip`（39 帧）→ **Prompt 1 已执行（2026-07-20）**
> - `cloak-sleep-transparent.zip`（34 帧）→ Prompt 2 待分阶段执行
>
> **归档位置**：本文件亦可复制到 `focus-tiger/docs/`。素材帧：
> `public/sprites/tiger-cub/monk-robe-default/{animation}/frame_NNN.png`。

---

## 产品拍板（2026-07-20）

| 素材 | 场景 | 与现有关系 |
|---|---|---|
| `rise-stretch-casual` | **Rise（中途主动结束）** 过渡动画 | **替换** `blinkBreathe` 的 Rise 接线；`blink-breathe` 素材与调试入口保留 |
| `cloak-sleep` | **进入 Sleeping / DORMANT** 的过渡 | 贴合 EMOTION_BIBLE「夜晚披小毯子」+ 现有 `sleeping` 循环；播完应落入 `sleeping` |

**回 Idle**：`rise-stretch-casual` 用 `loopMode: 'pingpong'`（播放器倒放，不另导倒序 PNG）。

---

## Prompt 1：rise-stretch-casual → 替换 Rise 的 blinkBreathe

**状态：已执行（2026-07-20）**

- 入库 `public/sprites/.../rise-stretch-casual/`（39 帧）
- `spriteManifest.riseStretchCasual`：8 fps、pingpong、末帧 hold 2 拍
- Rise：`playEmotion('riseStretchCasual')`；MoodController 护键；Reflection 结束后回 Idle/Sleeping
- 时长：单程 ≈4.9s；完整 pingpong ≈9.6s；`MANUAL_END_PAUSE_MS` 仍 300（动画与 Reflection 并行）
- 单测 + TEST_TRACKER / SCENARIO C / EMOTION_BIBLE 已更新

---

## Prompt 2：cloak-sleep → 进入 DORMANT / sleeping 过渡

**状态：计划中（见下方分阶段）**

素材：`cloak-sleep-transparent.zip`（34帧，拿到斗篷→披上→睡着）

```
将 cloak-sleep（34帧）入库：
sprites/{characterId}/{outfitId}/cloak-sleep/frame_NNN.png

背景：作为从「有活动状态」进入 sleeping/DORMANT 的正式过渡，贴合 EMOTION_BIBLE
「夜晚披小毯子」与现有 sleeping 持续循环；取代硬切或仅靠短 cross-fade。

要求：
1. 入库并登记 manifest（建议 loopMode: none，一次性正放）。先确认接入时机再接线，
   勿擅自接死——候选时机（产品择一或组合，实现前须书面确认）：
   - 日切 / 当日零完成进入 DORMANT 时播一次；
   - 仅「夜晚」时段（若已有时段逻辑）；
   - 未达标 Rise / Reflection 结束后若仍应回 DORMANT 时播一次。
2. 若接线：播完必须落入 `sleeping` 持续循环，不要播完又跳回 Idle 再切睡；
   末帧与 sleeping 首帧用 CapCut 叠化或可接受的短 cross-fade。
3. 与 rise-stretch-casual / Celebrating 互斥：进睡过渡不抢 Rise 主路径，Rise 不播本段。
4. 更新 EMOTION_BIBLE：sleeping/DORMANT 条目下记录本候选及「待确认接入时机」；
   「夜晚披小毯子」行可交叉引用本序列。
5. 更新 TEST_TRACKER（入库后即可「待人工测试」试播；正式接线另开一行写触发条件）。
```

### Prompt 2 分阶段计划（建议）

| 阶段 | 做什么 | 何时 |
|---|---|---|
| **2a 入库-only** | 解压 PNG → manifest（`cloakSleep`，`loopMode: none`）+ 调试试播按钮；EMOTION_BIBLE 记「候选」；TEST_TRACKER 一行「调试试播」 | 可紧接 Prompt 1 之后（不触生产触发） |
| **2b 产品择时机** | 书面确认下列之一（或组合）：① 日切/零完成进 DORMANT 播一次；② 仅夜晚；③ 中途 Rise→Reflection 结束后仍 DORMANT 时播 | **须你拍板后再动 2c** |
| **2c 接线** | `playEmotion('cloakSleep')` → onComplete → `sleeping`；与 Rise/`riseStretchCasual` 互斥；回流：睡态 → Honesty wake 仍走 `dormantWake` | 2b 确认后 |
| **2d 验收** | 主路径进睡 + 回流 Honesty 唤醒；末帧→`sleeping` 不闪；TEST_TRACKER 正式触发行 | 2c 后人工测 |

**默认建议（供 2b 拍板）**：优先 **① 当日首次进入 DORMANT 播一次**（开场/日切），避免每次 Rise 都披毯；③ 可作增强但与 Rise 伸懒腰叙事略叠，宜二选一或降频。
