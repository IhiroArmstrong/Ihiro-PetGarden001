# Task Brief · 鹦鹉耳边造访入库 + 场景 A/B

**日期**：2026-08-03  
**状态**：**实现中**（`feature/parrot-ear-visit-2026-08-03`）  
**角色**：Emotion / Session / UI  
**权威**：`EMOTION_BIBLE.md` `ParrotEarVisit` · `SCENE_ANIMATION_WIRING.md` · `ASSET_INVENTORY.md`  
**素材源**：仓库根 `Yin_Parrot_Ear_Visit_Feather_transparent` → `public/sprites/.../parrot-ear-visit-feather/`（93 帧 · `frame_NNN.png`）

---

## 一句话目标

把「鹦鹉飞来阿寅耳边低语、留羽飞走」入库为 `parrotEarVisit`，并接两条产品场景：应用内轻提醒信使（A）与稀有完成彩蛋（B）；**不**替换既有 streak-7 `MilestoneGlow`。

---

## 已好清单（不变量）

1. 应用内提醒横幅文案 / suppress 忙碌策略 / 本页 dismiss 不重复 — **不变**。  
2. streak-7 / 21 / 100 `MilestoneGlow` 变体轮换 — **不**被鹦鹉替换。  
3. 微仪式完成仍禁 Celebrating；轻完成池仍禁舞蹈。  
4. CapCut 回 Idle；禁止闪切。  
5. 不做宠物「收集羽毛」库存（若做残影仅视觉）。

## 保护面

- `InAppReminderBannerController` / e2e `in-app-reminder`  
- `LIGHT_COMPLETE_POOL` / `session-completion-feedback` / 微仪式完成  
- Idle 呼吸基底回落

## 范围

**做**：

1. 入库 93 帧 + manifest + EmotionController + 调试入口。  
2. **场景 A**：横幅本页首次可见 → `playEmotion('parrotEarVisit')`（`parrotMessengerGate`）。  
3. **场景 B**：`LIGHT_COMPLETE_POOL` 加低权重 `parrotEarVisit`（微仪式 / 轻完成稀有）。  
4. 文档 + 单测 + e2e 锁 Scene A 门闩。

**不做（待拍板）**：

- 用鹦鹉替换 streak-7 蝴蝶金辉，或与 Glow 叠播。  
- 羽毛飘落 DOM 残影 / 可点击收集。  
- 改提醒文案键（现有 `reminder.gentle_waiting` 已对齐 presence 口径）。

---

## 建议验收

1. 调试钮播完整信使弧线 + CapCut Idle。  
2. 设提醒 → 回前台 → 横幅 + 鹦鹉同现；本页不重播。  
3. 微仪式多次完成，偶见鹦鹉；从不跳舞。  
4. streak-7 仍见蝴蝶金辉（非鹦鹉替代）。
