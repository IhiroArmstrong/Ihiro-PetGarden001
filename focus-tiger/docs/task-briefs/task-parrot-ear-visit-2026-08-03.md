# Task Brief · 鹦鹉耳边造访入库 + 场景 A/B

**日期**：2026-08-03  
**状态**：**实现中**（`feature/parrot-ear-visit-2026-08-03`）  
**角色**：Emotion / Session / UI  
**权威**：`EMOTION_BIBLE.md` `ParrotEarVisit` · `MilestoneGlow` · `SCENE_ANIMATION_WIRING.md` · `ASSET_INVENTORY.md`  
**素材源**：仓库根 `Yin_Parrot_Ear_Visit_Feather_transparent` → `public/sprites/.../parrot-ear-visit-feather/`（93 帧 · `frame_NNN.png`）

---

## 一句话目标

把「鹦鹉飞来阿寅耳边低语、留羽飞走」入库为 `parrotEarVisit`，接应用内轻提醒信使（A）、轻完成稀有彩蛋（B），并让 **streak-7 MilestoneGlow 在蝴蝶金辉与鹦鹉之间 50/50 随机二选一**（节点仍只 claim 一次）。

---

## 已好清单（不变量）

1. 应用内提醒横幅文案 / suppress 忙碌策略 / 本页 dismiss 不重复 — **不变**。  
2. streak-7 / 21 / 100 **节点记账**只增不减、每节点一次 — **不变**；仅 streak-7 **视觉**在蝴蝶↔鹦鹉间随机。  
3. streak-21 / 100 仍琉璃星石。  
4. 微仪式完成仍禁 Celebrating；轻完成池仍禁舞蹈。  
5. CapCut / 末帧 hold 契约：蝴蝶·星石末帧 hold；鹦鹉 CapCut 回 Idle。  
6. **不做**羽毛残影 / 可收集（2026-08-03 拍板）。

## 保护面

- `InAppReminderBannerController` / e2e `in-app-reminder`  
- `MilestoneGlowStore` / e2e `milestone-glow-product`（锁 claim，不锁像素）  
- `LIGHT_COMPLETE_POOL` / 微仪式完成  
- Idle 呼吸基底回落

## 范围

**做**：

1. 入库 93 帧 + manifest + EmotionController + 调试入口。  
2. **场景 A**：横幅本页首次可见 → `parrotEarVisit`。  
3. **场景 B**：`LIGHT_COMPLETE_POOL` 低权重稀有。  
4. **streak-7**：`pickMilestoneGlowVariant` 50/50 → 蝴蝶序列或委派 `parrotEarVisit`。  
5. 文档 + 单测 + e2e。

**不做**：

- 羽毛飘落 DOM 残影 / 可点击收集。  
- 改提醒文案键。  
- 改 streak-21/100 星石路径。

---

## 建议验收

1. 调试钮播完整信使弧线 + CapCut Idle。  
2. 设提醒 → 回前台 → 横幅 + 鹦鹉同现；本页不重播。  
3. 微仪式多次完成，偶见鹦鹉；从不跳舞。  
4. streak-7：多次清 `milestone-glow.v1` 复现，应有时见蝴蝶、有时见鹦鹉；节点只记一次。
