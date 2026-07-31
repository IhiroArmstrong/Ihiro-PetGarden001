# Task Brief · 场景→动画接线 · v1.0.0 Slice A

**日期**：2026-07-31  
**状态**：产品已拍板 · **Slice A 实现中 / 本分支** `feature/scene-animation-wiring-v1-slice-a`  
**角色**：Emotion / i18n / Honesty  
**权威**：`SCENE_ANIMATION_WIRING.md` §四–§六 · `EMOTION_BIBLE.md` 反馈分级 · `MICRO_RITUAL_PLAN.md`（微仪式已接线）

**拍板（2026-07-31 用户书面）**：接线表正式进产品稿与 Backlog；**Slice A 纳入 v1.0.0 必交付**；语言切换要做，日语用鞠躬/合十（不用庆祝舞）。**同日书面**：开工 Slice A + docs 分支经 PR 合入 `develop`。

---

## 一句话目标

在产品壳用**现有** ack/light 序列补上三个缺口中的两个实现点 + 一个回归确认：切到日语合十、切回英语鞠躬；Honesty Idle 补登成功短点头；确认一分钟呼吸完成仍为 `sessionComplete`。

---

## 范围（Slice A · 只做这些）

**做**：

1. **语言切换问候**  
   - `setLocale` / `LanguagePreferenceUI` 在 **ready locale 实际变化** 时：  
     - → `ja`：`playEmotion('intentionSet')`（`palms-together` 合十）  
     - → `en`（及其它非 ja ready）：`playEmotion('mindfulAcknowledge')`（`nod-bow` 鞠躬）  
   - 限频：同一本地自然日、同一目标 locale 最多 1 次。  
   - 门闩：`FOCUSING` / `CELEBRATE` / 重要叠层忙碌时 **跳过**（或仅记「待播」至回到 Idle 再播一次——实现选一种并单测锁死；推荐 **跳过不补发**，避免打断专注）。  
   - **禁止** `celebrating` / `milestoneGlow` / `sessionComplete`。

2. **Honesty Idle 补登成功短认可**  
   - 非 DORMANT 路径：呼吸结束、`recordCompletion` 成功、`notifyRecorded` 同时（或紧接）`playEmotion('mindfulAcknowledge')`。  
   - DORMANT 路径：保持现有 `dormantWake`；记账后 **不**再叠 Celebrating；可选不再叠第二套 nod（避免双动画——推荐睡态结束只 toast + 桥接，点头仅 Idle 路径）。  
   - 不占 MindfulAcknowledge 共享提醒池（与 Honesty 现口径一致：用户主动）。

3. **微仪式**  
   - **不改**完成反馈键：仍为 `sessionComplete` + 中置 toast。  
   - 实现 PR 中跑既有 `e2e/micro-ritual.spec.js` 作回归即可。

**不做（Slice B/C / 其它 Brief）**：

- tea / yawn / gaze / ear-wiggle / 冷启动挥手 / Reflection 收尾 / Transition  
- MilestoneGlow 正式节点（见 `task-milestone-glow-product-wire.md`）  
- 新抽帧、日式庆祝舞、改 Celebrating 触发面

---

## 已好清单（改前须守住）

1. 切语言后 UI 文案仍刷新；`focus-tiger.locale.v1` 仍只写 ready。  
2. Honesty 睡态 `dormantWake` + 呼吸 + 桥接不退化。  
3. 微仪式完成仍轻量、从不 Celebrating。  
4. 当日首次计时达标 Celebrating / 同日后续 SessionComplete 不变。  
5. CapCut 叠化：新触发切入 idle 不闪切。

---

## 验收

见 `SCENE_ANIMATION_WIRING.md` §六。  
自动化：locale→emotion 选择 + 同日限频 unit；e2e 扩 language-switch（可见播放或测试钩）；Honesty Idle 回流一条（可 `test:e2e:changed`）。

本地门禁：`npm run test:smoke` + 相关 `test:e2e:changed`。  
`TEST_TRACKER`：实现回合登记 UI 行「待人工测试」。

---

## 建议分支

`feature/scene-animation-wiring-v1-slice-a` · 基线 `origin/develop` tip · 独立 worktree。
