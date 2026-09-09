# Task Brief · Transition Moment MVP（结界划线 · Calm Action C5）

> **状态（2026-09-09 · §七 修订 v2 · P4 终稿）**：**方案文档 + 资产核实 + P1–P5 全部拍板** · C5 **已开工** · C5.1 待 overlay 验收  
> **上游**：设计师 Transition 交互提案（2026-09-09）· 分析师审阅意见 · `PRODUCT_MOMENTS.md` §4.4 · `CALM_ACTION_WISDOM.md` · roadmap **C5**  
> **参照接线范式**：`task-reset-return-mvp.md` §五（overlay / sprite 仲裁）· `task-calm-action-recover-runtime.md`（Calm Action 卡形态）

---

## 大白话总结

设计师把 Transition 定成「换任务前划一条心理结界、给一句许可」——大约十秒、不记账、不反思。资产核实：**合十动画在库但未产品接线**；CAW-T 十条在文档、运行时池未建。Idle 阿寅邻接微入口 → 短 overlay（合十 + CAW-T），**必须**接 overlay / sprite 仲裁。CAW-T 用「排除上一条」随机（#561 教训，**不用**日锁）。罗盘改路由 **分两刀**（先 overlay 稳定，再切 Compass）。背景柔化走 **纯 CSS**（LightProgression 无现成 Transition API）。**P4 拍板 A**：C5 **不开** Whisper `transition` 键。

---

## 一、资产核实（地面真相 · 2026-09-09）

### 1.1 动画 / 精灵

| 资产 | 文档声称 | 代码核实 | 可用于 Transition MVP？ |
|---|---|---|---|
| **`palms-together`** | `SCENE_ANIMATION_WIRING.md` §5.3「用户主动 Transition 一次深呼吸」 | ✅ **素材已入库**：`spriteManifest.js` → `palmsTogether`（14 帧 · 4fps · `holdLastFrame`）；`EmotionController.palmsTogether()` 可播；`SpriteSequencePlayer.test.js` 有注册单测 | ✅ **推荐主选**。文档标注「Slice C · 入口未做」= **设计预留，非已接线** |
| **`breath-halo-hq`** | 同上「或短光环」 | ✅ 素材已入库：`breathHaloHq`（16 帧 pingpong · `EmotionController.breathHaloHq()`）；现用于 Honesty≥30 试验 / 调试 | ⚠️ **备选**。视觉更重、时长更长，不如合十贴合「一次深呼吸」 |
| **`LightProgression` 背景柔化** | 设计师「界面微微暗沉或柔化」 | ✅ `LightProgression.js` 有 backdrop + `playRecoverDisturbance()`（**Recover 专用**扰动）；**无**现成「Transition 轻量柔化」API——新裁须改 `LightProgression` 并评估与 Arrival 暖幕耦合 | ❌ **MVP 不用**（§七 P5）；overlay 根 **纯 CSS** 半透明遮罩 / `backdrop-filter` |
| **磬声 / 竹木叩击** | 设计师 Step 1 音效 | ❌ **无** Transition 专用音频资产；项目无「一键磬声」管线登记 | ❌ **本轮不做**（见 §六） |

**结论（推翻设计师未核实断言）**：`palms-together` **不是**「已预留且随时可播的 Transition 主路径」——序列与 `playEmotion` **存在**，但 `ASSET_INVENTORY.md` / `EMOTION_BIBLE.md` 仍标 **「仅调试」**；Arrival Choose 已改用 `nod-bow`，日语切语已改 `bookReading`。**实现 C5 时属于「首次产品接线」**，不是改一行配置。

### 1.2 文案（CAW-T01–T10）

| 项 | 状态 |
|---|---|
| **内容 SSOT** | ✅ `CALM_ACTION_WISDOM.md` § Transition（10 条 · S/M · EN/JA/ZH 草稿） |
| **运行时 CMS** | ❌ **未建**。`src/content/calm-action-wisdom/` 仅有 recover / arrive / reflect 三池；**无** `calm-action-transition.*.js` |
| **品味 overlay** | ❌ D1 overlay（#670）仅 **Recover + Arrive**；Transition **未**进 `/api/calm-action-copy` |
| **产品语言** | v1 露出 **en + ja**（与 C1–C4 一致）；ZH 仅 CMS，不进 v1 金句池 |

**结论**：文案**可直接消费**文档表生成 `calm-action-transition.en.js` / `.ja.js`（照 C4 Reflect 模式），**不是**凭空编句。设计师举例 *「刚才的已经过去了…」* **不在** CAW-T 表内——MVP **禁止**自造句，只用 CAW-T01–T10。

### 1.3 现有「像 Transition」的功能（边界再确认）

| 功能 | 与 Transition MVP 关系 |
|---|---|
| **Work Transition 仪式** | 订阅 RitualFlow · 30s 呼吸 + prompt · **下班典礼**；罗盘芯片**临时**跳这里 |
| **Emotional Reset 仪式** | 情绪重置 · 60s；罗盘 Recover 芯片临时跳这里 |
| **Tiger Anchor / Re-focus** | Recover 家族 · 「分心了」语义 · **不是**换场 |
| **Rise → Reflection** | 专注会话出口 · 文档禁止叙事成 Transition |
| **Arrival Practice** | 开工前觉察 · **不是**两件事之间 |

---

## 二、采纳的设计师心智模型

### 2.1 核心定位（写入产品叙事）

- **结界划线（Boundary Marking）** + **许可赋予（Permission Opening）**
- 针对 **Attention Residue**（前一件事认知残留），**不是**总结、**不是**情绪清空、**不是**自责后的惩罚重置

### 2.2 三微场景（文档层采纳 · 实现不分支）

| 场景 | 典型时刻 | 心理暗示 |
|---|---|---|
| **上下文断连** Context Switch | 会议→写代码；消息→深度方案 | 「前一件事告一段落了」 |
| **工休交界** Work-to-Rest Shift | 专注完→喝水；写完功能→休息 | 「休息不需要内疚」 |
| **状态重启** Mid-day Clean Slate | 跑偏/摆烂后想轻盈重来 | 「不翻旧账，可以重新开始」 |

**实现口径**：三场景 **共用同一套 UI**（不选场景、不表单）；差异只靠 CAW-T 句池随机/日锁体现语气。**禁止** MVP 做三分支 wizard。

### 2.3 差异化定位表（采纳）

见设计师原文对照表（Transition vs Work Transition vs Recover）——与 `PRODUCT_MOMENTS.md` §4.4 一致，本 Brief 不重复。

---

## 三、MVP 交互方案（修订版）

### 3.1 时长与形态

| 项 | 口径 |
|---|---|
| 总时长 | **8–10s**（硬顶 12s）；**无**用户输入、**无** Reflection、**无** Journey / Ritual 记账 |
| 结构 | 柔化 0–2s → 合十/光环 + CAW-T 句 2–7s → 自动消散 7–10s |
| 跳过 | 点 overlay / 按 Esc → 立即结束（0–1s 淡出）；**须**登记 `SB-xx` 或写「轻触即关，非哑点击」 |
| 计时器 | **Idle 触发**：无 Focus 计时。**若**日后允许 Focusing 触发：计时 **不得**暂停（对齐 Tiger Anchor） |

### 3.2 入口（待拍板 · 见 §七）

**推荐（我认为最合理的）**：**Idle 常驻微入口**——阿寅互动区旁或热力图簇邻接，极淡图标（合十弧/微波纹），tooltip「换场 / Transition」。

| 方案 | 描述 | 取舍 |
|---|---|---|
| **A · Idle 微钮（推荐）** | `#transition-moment-trigger` 挂 Idle；Focusing 隐藏 | 符合「常驻低打扰」；不与 Rise 抢 |
| **B · 仅罗盘芯片** | 只有 Compass 能开 | 不符合「day-axis 自然嵌入」；可作补充非主入口 |
| **C · Idle + Focusing** | 两态都有入口 | 易与 Recover / Rise 职责重叠；**v2** 再议 |

**本轮不做**：`Cmd/Ctrl+Shift+T` 全局快捷键（纯 Web SPA 不可靠；**桌面壳 backlog**）。

### 3.3 交互流（实现锚点）

```text
用户点 Idle 微钮（或罗盘芯片，若拍板改路由）
  ↓
requestOverlaySlot('transition-moment') → granted
  ↓
Transition overlay 根节点 CSS 柔化渐入（`rgba` 遮罩 + 可选 `backdrop-filter`；**不**调 LightProgression）
  ↓
EmotionController.playEmotion('palmsTogether', { holdPose: true, … })
  + TransitionOverlayUI 居中一行 CAW-T（CalmActionTransitionStore 解析）
  ↓
~8s 或用户点关 → hold 释放 → CapCut 回 idle → releaseOverlaySlot
  ↓
【可选】首次完成 → markMomentWhisperSeen('transition') 已独立；Whisper 在 **开始前** 一生一次播放（见 §5.4）
```

### 3.4 文案呈现

- 复用 Calm Action 卡视觉语言（`CalmActionRecoverCardUI` 白玉毛玻璃），但 **居中**、**无**底部 toast 前置依赖
- 池：**CAW-T01–T10**；每次触发 **重新抽句**，**排除上一条**（`CalmActionTransitionStore` 持 `_previousQuoteId`；抽选时 `excludeIds: [previous]`，模式对齐 Confide `ConfideToYinUI._sessionExclude` / `pickDailyWisdomId` 的 `recentIds` 单窗）。**禁止**自然日锁（Transition 预期 3–8 次/日，日锁 = 复读观感，#561 教训）。**禁止**同秒连点连抽（UI 冷却至 overlay 关闭）

---

## 四、overlaySlotArbitration 接入（必做 · 参照 Reset MVP）

> **风险说明**：`CALM_ACTION_RECOVER` / `CALM_ACTION_ARRIVE` 已在 `overlaySlotContractRegistry.js` 登记，但 `buildLiveOverlaySnapshot()` **尚未**暴露 `calmActionRecoverOpen` 等字段——C5 实现时应 **一并补齐** Calm Action 卡 + Transition overlay 的 snapshot 接线，避免再增「登记了但未进 busy 推导」的隐性冲突。

### 4.1 新增 Overlay 契约

| Source ID | Kind | tier | snapshotField | blocksIdleYinTap | blocksEnterSleep | outsideDismiss | Idle | Focusing |
|---|---|---:|---|:---:|:---:|---|:---:|:---:|
| `transition-moment` | `VISUAL_SECONDARY` | **22** | `transitionMomentOpen` | **true** | **false** | `blank-closes` | ✅ | ❌ **MVP 禁止** |

**`requestOverlaySlot` 改造要点**：

1. `OVERLAY_SOURCES.TRANSITION_MOMENT` + `overlaySlotContractRegistry.js` 登记；`overlay-contract-ui-check.js` 映射 `TransitionMomentUI.js`。
2. `OverlaySnapshotInput` / `buildOverlaySnapshot` / `buildLiveOverlaySnapshot` 增加 `transitionMomentOpen`。
3. **Yield 给**（Transition **不得**压住）：`ARRIVAL`、`REFLECTION`、`HONESTY_*`、`MICRO_RITUAL`、`RITUAL_FLOW`、`COMPANION_PICKER`、`CONFIDE`、`COMPASS`（打开中）、`JOURNEY_LOG`、`postSessionOverlayActive`、`recoverResetPracticeOpen`、已开的 `focusDurationPicker`。
4. **被 Transition 挡住**：Idle 摸头（`blocksIdleYinTap: true`）、新 Transition 重入、Whisper 并播。
5. **不**占用 `postSessionOverlayActive`；**不** `blocksEnterSleep`（短于 10s，用户仍在 Idle）。
6. Transition 进行中 **抑制** `ActiveRecoverAnchor` 无关（Focusing MVP 不开）；Idle **隐藏** `#transition-moment-trigger` 防连点。

### 4.2 与 RitualFlow / MicroRitual 边界

| | Transition Moment | Work Transition Ritual |
|---|---|---|
| 入口 | Idle 微钮（**C5**）；罗盘仍跳仪式（**C5.1** 再改） | 菜单 Rituals / 罗盘临时桥接（C5 期间） |
| 时长 | ~10s | ~1–2 min |
| 订阅 | **免费**（Five Moments 核心面） | subscription |
| overlay source | `transition-moment` | `ritual-flow` |
| 并存 | 可先后手动触发，**不得**自动串联 |

### 4.3 Z-index

| 元素 | z-index |
|---|---|
| Transition overlay 根 | **17**（对齐 Moment Whisper / Calm Action 卡） |
| Idle 微入口 trigger | **12**（对齐 ActiveRecoverAnchor 带；**低于** dock Sit 16） |

登记 `Z_INDEX.md` 新行。

---

## 五、spriteChannelArbitration 接入

| 场景 | 决策 |
|---|---|
| Transition 播放 `palmsTogether` | 经 `EmotionController.playEmotion`；**不**新增 `SPRITE_SOURCES` 枚举 |
| 占用档 | 视同 **ack 一次性序列**（与 `mindfulAcknowledge` / `intentionSet` 同档）；播放中 `canPlayIdleYinTap` → false |
| 与 STRONG_EMOTIONS 冲突 | `Celebrating` / `sessionComplete` / `rise-hold` 播放中 → **拒绝**开 Transition（`requestOverlaySlot` deny + trigger disabled） |
| `breathHaloHq` 备选 | 若合十观感 QA 不佳再换；**禁止** MVP 双动画并联 |
| 结束后 | `playEmotion('idle', { crossFadeMs: CAPCUT_DISSOLVE_MS })`；`syncIdleYinTap()` |

**时序**：先 `requestOverlaySlot` granted → 再 `playEmotion('palmsTogether')`；关层时先 release slot 再 idle 交叉淡化（与 Arrival 纪律一致）。

---

## 六、明确排除项（本轮）

| 项 | 处理 |
|---|---|
| **全局快捷键** `Cmd/Ctrl+Shift+T` | ❌ 不做；记入桌面壳 backlog |
| **磬声 / 新音效资产** | ❌ 不做；静音 MVP |
| **场景三分支 UI** | ❌ 不做 |
| **Journey Log / Reflection / 寅币** | ❌ 不记账 |
| **D1 overlay 云端句包** | ❌ C5 后另 PR（随 Reflect overlay 节奏） |
| **Focusing 态入口** | ❌ MVP 不做 |
| **替换 Work Transition 仪式** | ❌ 并存，不删 Ritual |

---

## 七、产品拍板（P1–P5 · 2026-09-09 修订 v2）

### 7.1 已拍板

| # | 决议 | 落点 |
|---|---|---|
| **P1** | **方向同意**：Compass「Transition」最终应开 **轻量 overlay**，Work Transition **留菜单 Rituals**。**分两刀上线**：**C5** 只做 Idle 微入口 + overlay + 仲裁；**C5.1**（overlay 稳定、人工验收仲裁无摸头/Confide/进睡冲突后）再改 `fiveMomentsCompassGate` 芯片路由。C5 期间罗盘 **保持**跳 `ritual-work-transition`（已验证旧路径作兜底） | §十 实现顺序 · §九 验收 5 |
| **P2** | **同意**：Idle **阿寅邻接微图标** | §3.2 方案 A |
| **P3** | **改**：**排除上一条**随机抽 CAW-T；**禁止**自然日锁（高频场景 ≠ Reflect 一天一次；避免 #561 类复读观感） | §3.4 · `CalmActionTransitionStore` |
| **P5** | **纯 CSS** 遮罩/柔化（overlay 根节点）；**不**新增 `LightProgression.playTransition*`（无现成轻量 API，`playRecoverDisturbance` 语义不对） | §3.3 交互流 |

### 7.2 已拍板 · P4（Moment Whisper `transition` 键）

**决议：A — C5 不开放 Whisper。**

| 项 | 核实 |
|---|---|
| 已有基建 | `MOMENT_WHISPER_TRANSITION` 文案已在 `locales`；`MomentWhisperUI` + `momentWhispersGate` 已登记 `transition` 键；现 `MOMENT_WHISPER_PLAYABLE` **不含** `transition` |
| C5 口径 | **`PLAYABLE` 仍不含 `transition`**；**不**调 `maybeOfferMomentWhisper('transition')`；首次体验保持 **~10s** 纯 overlay |
| 拍板理由（分析师 2026-09-09） | 10s 量级是 Transition 与 Work Transition / Recover 的核心差异化；叠 Whisper 会把首次拉到 13–14s（稀释 ~40%）；C5 须测「结界+呼吸」本身是否缓解切换残留，混 Whisper 无法归因 |
| C5.1 / 后续 | Whisper **独立待议**——等 C5 数据后再评估是否加、何时加；**不**预先绑死与 Compass 同批 |

### 7.3 `CalmActionTransitionStore` 选句（P3 实现口径）

```text
resolveQuote():
  pool = CAW-T01..T10 (locale)
  exclude = _previousQuoteId ? [_previousQuoteId] : []
  id = pickDailyWisdomId(`caw-transition-${triggerOrdinal}`, poolIds, exclude, 1)
       // windowSize=1 → 仅排除上一条；池剩 1 条时允许回绕
  _previousQuoteId = id
  return findCalmActionTransitionEntry(id, locale)
```

- `triggerOrdinal`：进程内递增计数（或 `Date.now()` salt），**不**写 `localStorage` 日锁。
- 单测：连续抽 20 次，**不得**出现连续两次相同 id（池 ≥2 时）。

---

## 八、冲突扫描（实现前）

| 轴 | 相邻场景 | 结论 |
|---|---|---|
| 强度 | Tiger Anchor · Re-focus · Work Transition 仪式 | Transition **短于**仪式、**无**负罪叙事；**轻于** Recover 被动链 → **无冲突**（须接仲裁） |
| 语气 | CAW-T 许可句 · `EMOTION_BIBLE` 观察式 | 池已在 `CALM_ACTION_WISDOM.md` 审定 → **无冲突** |
| 职责 | Sit/Rise · Arrive · Whisper · 摸头 | 新入口不得挡 Sit(16)；叠层须 `blocksIdleYinTap` → **须接 registry（§四）** |

---

## 九、验收提纲（实现后 · 场景 **Y-Transition** 草案）

1. `?product=1` Idle → 见微入口 → 点 → **0–1s** backdrop + 合十 + 居中 CAW-T → ~8s 自动消失。
2. 进行中点空白 / Esc → 立即淡出；阿寅回 Idle 闭目。
3. **对照**：点 Sit → **不**误触 Transition；Transition 中 **无**摸头。
4. **对照**：开 Confide / Journey / Compass → Transition 入口 disabled 或请求被拒。
5. **对照**：菜单 **Work Transition** 仪式仍独立可走；**C5** 期间 Compass Transition 芯片仍跳仪式（旧路径兜底）。
6. 连续两次 Transition → **不得**连出同一条 CAW-T（池 ≥2；P3 排除上一条）。
7. **375**：句不溢出；trigger 不挡三球 / Sit。
8. **不**写入 Journey Log；**不**开 Reflection。

---

## 十、实现顺序建议

### C5 · 口令「开工 Calm Action Transition」（MVP）

1. `calm-action-transition.en.js` / `.ja.js` + `CalmActionTransitionStore`（排除上一条）+ `index.js` 导出
2. `overlaySlotContractRegistry` + `overlaySlotArbitration` + `buildLiveOverlaySnapshot`（含补齐 Calm Action 卡 snapshot **可选同 PR**）
3. `TransitionMomentUI.js`（**纯 CSS** backdrop）+ Idle 阿寅邻接 trigger
4. `main.js` 接线 + `EmotionController` palmsTogether 产品路径（去「仅调试」登记）
5. **不**改 `fiveMomentsCompassGate` · **不**开 Whisper `transition`（P4 拍板 A）
6. locale · `Z_INDEX.md` · `SCENE_ANIMATION_WIRING.md` §5.3 · `CALM_ACTION_WISDOM.md` 运行时表 · `SCENARIO_TESTS.md` · `TEST_TRACKER` 碎片

**C5 关单门禁**：场景 Y-Transition 人工验收通过 + 仲裁回归（摸头 / Confide / 进睡）无新增冲突。

### C5.1 · 口令「开工 Calm Action Transition compass」（紧随 C5 稳定后）

1. `fiveMomentsCompassGate.resolveFiveMomentAction('transition')` → `{ type: 'transition-moment' }`（新 action 类型，main.js 分发）
2. Compass 芯片按压 → 开 Transition overlay（与 Idle 微钮同路径）
3. **可选同 PR**：`MOMENT_WHISPER_PLAYABLE` 加入 `transition` + 首次触发 `maybeOfferMomentWhisper`（若 P4 拍板纳入）

---

## 十一、文档义务

- C5 / C5.1 关单分别更新 `taste-layer-calm-action-roadmap.md` C5 行 · `PRODUCT_MOMENTS.md` §4.4 现状列
