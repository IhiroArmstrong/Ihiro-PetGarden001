# NEW_ASSETS_2026-07-18.md — 五套新素材入库与接入 Prompt

> **归档位置**：`focus-tiger/docs/`（本文件）。素材帧已按分层规范入库
> `public/sprites/tiger-cub/monk-robe-default/{animation}/frame_NNN.png`。
> 源 zip 可留在仓库根目录作备份，不以 zip 作为运行时路径。

素材来源：本次上传，均已抠图为透明 PNG 序列，按视频帧号/上传时间戳排序重命名为
frame_NNN.png，见对应 zip。命名与已有素材（celebrate-dance / dormant-wake 等）
规范一致。

---

## Prompt 1：dance-v2 → Celebrating 第二变体

素材：`dance-v2-transparent.zip`（60 帧）

```
将 dance-v2（60 帧透明 PNG）按 sprites 分层规范入库：
sprites/{characterId}/{outfitId}/celebrate-dance-v2/frame_NNN.png

要求：
1. 在 manifest 中登记为 celebrate-dance 的第二变体，不新建 emotion key——
   仍然映射到现有 'celebrating'，但触发时在 celebrate-dance 和
   celebrate-dance-v2 之间做一次简单随机（50/50），不需要记录用户看过
   哪个、不做"轮换不重复"这类复杂逻辑，MVP 阶段随机即可。
2. loopMode: none，播放完成后的回落逻辑复用现有 celebrate-dance 的
   onComplete 处理，不需要重新实现。
3. 不改动"每日首次才完整庆祝"相关的现有/待实现逻辑，这次只解决"庆祝动作
   本身能不能有两种"，范围不要扩大。
4. 更新 EMOTION_BIBLE 中 celebrating 条目，注明现在有两个变体素材。
```

---

## Prompt 2：palms-together → Arrival Practice 的 Choose 确认动作

素材：`palms-together-transparent.zip`（14 帧）

```
将 palms-together（14 帧透明 PNG）入库：
sprites/{characterId}/{outfitId}/palms-together/frame_NNN.png

背景：ARRIVE_MOMENT_DESIGN.md 和 LIGHT_PROGRESSION_DESIGN.md 里 Choose 确认
瞬间原计划是"坐垫处一次性 CSS 光晕"，现在有了真实动作素材，用这个替换/
叠加原方案。

要求：
1. 新增 emotion key（建议 'intentionSet' 或类似命名，具体定名请按项目现有
   camelCase 习惯定），在用户完成 Choose 图标点选或打字确认的瞬间播放，
   loopMode: none，播完后进入现有 Companion Mode 三选一展开（衔接
   ARRIVE_MOMENT_DESIGN.md 已定的流程顺序，不改变这个顺序）。
2. 如果 LIGHT_PROGRESSION_DESIGN.md 里"坐垫光晕"的 CSS 效果已经实现，
   评估是保留两者叠加还是用这套真实动作替换纯 CSS 方案，给出建议但不要
   擅自删除已有实现，先反馈方案。
3. 更新 ARRIVE_MOMENT_DESIGN.md 流程图与 EMOTION_BIBLE，补充这个新
   emotion key 的位置和素材来源。
```

---

## Prompt 3：breath-halo-expand → milestoneGlow 简化候选版本

素材：`breath-halo-expand-transparent.zip`（17 帧）

```
将 breath-halo-expand（17 帧透明 PNG）入库：
sprites/{characterId}/{outfitId}/breath-halo-expand/frame_NNN.png

背景：milestoneGlow 目前已有 deep-breath-glow（含蝴蝶）作为候选素材，
这次新增的 breath-halo-expand 内容更简化（只有呼吸+光环扩展，无蝴蝶、
无莲花）。

要求：
1. 仅登记入 manifest，作为 milestoneGlow 的备选素材，不新建 emotion key，
   不接任何真实触发点——milestoneGlow 的里程碑天数判定逻辑仍未实现，
   这条边界不变，只是先把素材备好。
2. 在 EMOTION_BIBLE 的 milestoneGlow 条目里，注明现在有两个候选素材
   （deep-breath-glow 含蝴蝶 / breath-halo-expand 更简化），实际使用哪个
   等里程碑逻辑排期时再决定，不要现在替我们选。
3. 不要求提供调试预览入口之外的任何接线。
```

---

## Prompt 4：lotus-front-rising → 环境细节解锁·莲花池（Backlog，仅入库）

素材：`lotus-front-rising-transparent.zip`（7 帧）

```
将 lotus-front-rising（7 帧透明 PNG）入库：
sprites/{characterId}/{outfitId}/lotus-front-rising/frame_NNN.png

背景：这是"环境细节解锁·莲花池"（Backlog，5天首朵/10天第二朵……）这个
方向第一次有实际素材，但对应的天数追踪与解锁触发逻辑完全没有实现。

要求：
1. 仅登记入 manifest，不新建触发逻辑，不接入任何页面。
2. 在 TASKS.md 或 PROCESS.md 的 Backlog「纪念奖励系统」条目下补充一行，
   注明"莲花池首朵素材已到位（lotus-front-rising，7帧），触发逻辑
   （连续/累计天数追踪）待排期"，避免以后盘点时又当成"完全没有任何
   进展"。
3. 不要因为素材到位就顺手实现天数追踪逻辑——这需要先确定"连续"还是
   "累计"、断了要不要重置这类产品规则，不在本次任务范围内。
```

---

## Prompt 5：lotus-chest-halo → Grow Together 里程碑视觉

素材：`lotus-chest-halo-transparent.zip`（10 帧）

```
将 lotus-chest-halo（10 帧透明 PNG）入库：
sprites/{characterId}/{outfitId}/lotus-chest-halo/frame_NNN.png

背景：PRODUCT_MOMENTS.md 中 Grow Together 一格目前只有文字定义（"老虎
成长=用户成长的映射，环境细节解锁与永久纪念物"），没有具体视觉。这套
素材（胸口莲花+脑后金光同步出现）适合作为纪念物解锁那一刻的正式呈现。

要求：
1. 仅登记入 manifest，不新建触发逻辑——纪念物解锁的判定规则（哪些
   里程碑触发、触发几次）尚未设计，属于 Backlog「纪念奖励系统」范围。
2. 在 PRODUCT_MOMENTS.md 的 Grow Together 小节补充一句，注明这套素材
   已到位，可作为纪念物解锁视觉的候选，具体接入等该 Backlog 排期时
   再定。
3. 不要自行决定"什么算一次里程碑"并据此接线，这是产品规则，不是
   实现细节。
```

---

## 执行顺序建议

Prompt 1、2 可以直接接线（有现成触发点：Celebrating、Choose 确认）；
Prompt 3、4、5 只入库不接线，因为对应的触发逻辑（随机变体之外的天数
判定、里程碑规则）还没设计，接了也是空转，不如先把素材备好，逻辑排期
时直接用。
