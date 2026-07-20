# NEW_ASSETS_2026-07-18-B.md — 眼动序列 + 打哈欠入库 Prompt

> **归档位置**：`focus-tiger/docs/`（本文件）。素材帧已按分层规范入库
> `public/sprites/tiger-cub/monk-robe-default/{animation}/frame_NNN.png`。
> 源 zip 可留在仓库根目录作备份，不以 zip 作为运行时路径。
>
> **执行状态（2026-07-19 晚）**：Prompt 1–2 素材已入库，但**正式 Idle 不再调度**张望/哈欠。
> 闭目坐禅改为：呼吸×5 → 眨眼 → 往复。EyeTracking 已废弃（见 `CORE_LOOP.md`）。

---

---

## 关于 EyeTracking 静态瞳孔图（已废弃）

曾自 `eye-pupils-transparent.zip` 接入：`public/textures/eye-pupils/pupil-left.png` /
`pupil-right.png`。**2026-07-19 起不再接线**——用户实测瞳孔叠图错位（楔形/月牙状），
已决定放弃；权威结论见 `CORE_LOOP.md`「已废弃：EyeTracking 实时瞳孔跟随鼠标」。
PNG 可留作历史素材。Idle 离散张望（本文件 Prompt 1）与本模块无关、继续有效。

---

## Prompt 1：四段眼动素材 → IdleOrchestrator 新增变体

素材：`gaze-p1-center-blink-left-transparent.zip`（15帧）、
`gaze-p2-left-to-up-transparent.zip`（13帧）、
`gaze-p3-toward-right-transparent.zip`（13帧）、
`gaze-p4-right-to-down-transparent.zip`（25帧）

```
将四段头部+眼睛转向素材按 sprites 分层规范入库：
sprites/{characterId}/{outfitId}/gaze-p1-center-blink-left/frame_NNN.png
sprites/{characterId}/{outfitId}/gaze-p2-left-to-up/frame_NNN.png
sprites/{characterId}/{outfitId}/gaze-p3-toward-right/frame_NNN.png
sprites/{characterId}/{outfitId}/gaze-p4-right-to-down/frame_NNN.png

要求：
1. 内容确认：p1 结尾停在"看向左"，p2 开头正是"由左转向上"，两者动作方向
   衔接自然；p3 是"转向右看"的过程，p4 从"右"转向"下"，同样衔接自然。
   p2 结尾（上）与 p3 开头、p4 结尾（下）与回到中间之间没有素材衔接，
   不要强行拼接或用代码插值弥补，保持两组独立变体即可。
2. 加入 IdleOrchestrator 的随机变体池，新增两个组合变体：
   - "张望A"：p1 + p2 连续播放（中间→眨眼→左→上）
   - "张望B"：p3 + p4 连续播放（右→下）
   播放时机、触发概率沿用 idle-eye-glance 现有的随机调度逻辑，不需要
   新的调度机制，只是往同一个池子里加选项。
3. 播放结束后回到 idle-breathing 的过渡方式，沿用 dormantWake 已验证的
   180ms cross-fade 手法，保持全项目过渡效果一致。
4. 不要绑定到任何具体功能触发点（不是提醒、不是反馈），纯粹作为 IDLE/
   FOCUSING 状态下的随机生命感变体。
5. 更新 EMOTION_BIBLE 中 idle 变体相关条目，补充这两个新组合变体的说明。
```

---

## Prompt 2：打哈欠伸展 → IdleOrchestrator 新增"犯困"变体

素材：`yawn-stretch-transparent.zip`（16帧）

```
将 yawn-stretch（16帧透明 PNG）入库：
sprites/{characterId}/{outfitId}/yawn-stretch/frame_NNN.png

要求：
1. 这套素材语义是"有点无聊/犯困"，和已分配给 stretchReminder、dormantWake
   的另外两套"目的性伸懒腰"素材不同，不要混用或替换那两个坑位。
2. 加入 IdleOrchestrator 随机变体池，作为长时间无互动时偶尔出现的变体，
   触发概率建议比 idle-eye-glance 更低（这个动作幅度更大，不适合太频繁
   出现），具体概率数值请先给建议值，不要自行拍板写死。
3. loopMode: none，播完 cross-fade 回落 idle-breathing，手法同上。
4. 更新 EMOTION_BIBLE，补充这个新变体及其触发概率说明。
```
