# Task Brief · 吹花鼓励（分阶段）

**日期**：2026-08-05  
**状态**：规则已记录；**下一执行切片 = Phase 1 Lab 入库**（待用户确认开工）  
**角色**：Emotion / Session / UI（分阶段）  
**权威 SSOT**：[`FLOWER_BLOW_WELCOME_DESIGN.md`](../FLOWER_BLOW_WELCOME_DESIGN.md)  
**交叉**：`SCENE_ANIMATION_WIRING.md` · `EMOTION_BIBLE.md` · `ASSET_INVENTORY.md` · `PRINCIPLES.md`

---

## 一句话目标

把「变花吹散」做成 **Day1 / 久别** 冷启动微仪式（策略 C）；与同日 `WELCOME_APP` 池互斥；观察式气泡；**先实验室入库，再产品接线**。

---

## 已好清单（保护面 · 全程）

1. 现有冷启动 `WELCOME_APP`（`magicBookReading` / `nodGreeting`）同日 1 次行为 — Phase 1 **不得改**。  
2. 欢迎 vs 深夜同 tick 互斥 — 不得破坏。  
3. Idle 呼吸×5→眨眼不闪；oneshot → CapCut Idle 契约。  
4. DORMANT / 苏醒路径优先于任何欢迎彩蛋。  
5. Sit / Arrival / Hints 主路径可点；吹花不得静默吞掉 Sit。

---

## Phase 1（本 Brief 当前执行范围 · Lab）

**做**：

1. 根目录素材 → kebab 目录 `conjure-flowers-blow-away`，帧名 `frame_NNN.png`。  
2. `spriteManifest` + `EmotionController` oneshot + **~1s CapCut** 回 Idle。  
3. `#emotion-debug-ui` 可播；单测锁序列存在与回落契约（能锁的部分）。  
4. 更新 `ASSET_INVENTORY` / `EMOTION_BIBLE` 草稿行 / `TEST_TRACKER` 实验室验收行。

**不做**：

- 不改 `sceneAnimationDispatcher` 的 `WELCOME_APP`。  
- 不做气泡 UI、不做 localStorage 频次、不做 feature flag 产品路径。

---

## Phase 2+（仅记录，不开工）

见 `FLOWER_BLOW_WELCOME_DESIGN.md` §3.3：2a 气泡 → 2b Dispatcher+门闩+flag → 2c 抛光。

---

## 建议验收（Phase 1）

1. 调试钮：完整吹花弧线 → CapCut → 稳定 Idle 呼吸。  
2. 产品冷启动：仍只见书/点头池（与改前一致）。  
3. 路径无中文/下划线；体积与 fps 记入 TEST_TRACKER 供人工观感。
