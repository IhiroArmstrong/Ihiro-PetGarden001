# Task Brief · Reset & Return MVP（Feel the Ground / Take a Breath / Look Around）

> **状态（2026-09-13）**：**部分 superseded**。触发/归属（并入 Recover、接被动 Re-focus、5-emoji 分流）以 [`task-ground-exercise-standalone-menu.md`](./task-ground-exercise-standalone-menu.md) 为准。本文仍可用于盘点已合入的练习组件与历史决策，**不得再按本文 §一决策 1/2/5 实现新代码**。  
> **原状态（2026-09-07）**：方案文档 · 纯 PRD / 落位方案 · **不写代码**  
> **上游决策**：`task-focus-tiger-reset-system-mvp-brief.md`（5 项架构决策已拍板；其中决策 1 已推翻）  
> **叙事归属（历史）**：Recover Moment · 被动 Re-focus Acknowledge 同线（非第三套「练习中断提示」）

---

## 大白话总结

分心离开专注超过一分钟再回来时，阿寅会先像现在一样轻轻点头、说一句观察式的话；**在这之后**，多给一张可选的小卡片，用五个表情选「此刻更像哪种状态」，再带进三项短练习里的一项，或直接回到专注。三项练习分别是感受脚底、跟着呼吸、环顾四周，每项十几秒到一分钟，计时器不停。若选的是「 overwhelmed」，练完后只多一句可点的倾诉入口，不强制、也不改倾诉里的情绪分类。主动点阿寅复苏、菜单入口和游戏化奖励本轮都不做。

---

## 一、已拍板架构决策（实现须遵循）

| # | 决策 | 本 Brief 落点 |
|---|---|---|
| 1 | Reset 并入 Recover(#6)，与 Re-focus Acknowledge 同叙事线 | §二嵌入方案 · §四触发门闩 |
| 2 | 独立轻量 emoji 选择器；overwhelmed 仅练后柔性 Confide 出口 | §三选择器 · §三.4 Confide |
| 3 | Take a Breath 复用 breath-pacer PRD 参数体系 | §一.2 · §五技术附录 |
| 4 | MVP 仅三项；其余 5 项进 backlog | §一 · §六排除项 |
| 5 | 仅被动触发；须接 overlay / sprite 仲裁 | §四 · §五 |

---

## 二、与 Re-focus Acknowledge 的嵌入方式（代码审查结论）

### 2.1 现有实现链路（地面真相）

| 环节 | 模块 | 行为 |
|---|---|---|
| 离开检测 | `AttentionSignals.js` | visibility + blur/focus；≥20s 记账；**>60s** 才 `displayEligible: true` |
| 会话门闩 | `MindfulReminderController.handleAttentionReturn` | 每场最多 1 次；占 `ReminderQuotaManager` 日额度（三类合计 ≤3） |
| 呈现 | `_showReminder('refocus')` | `mindfulAcknowledge` + `subtype: 'refocus'` → **nod-bow**；`toast.show(REFOCUS_ACKNOWLEDGE)` 默认底部 ~4s |
| 光影 | `main.js` `onReminderShown('refocus')` | `lightProgression.playRecoverDisturbance()` |
| 抑制 | `suppressAwayReminders` | Offline / Flow 不走本路径（smoke B / E） |

**关键事实**：当前 Re-focus **只有** toast + nod-bow + 光影扰动，**无**多步 UI、无用户选择、**不**暂停 `FocusSession` 墙钟计时。

### 2.2 方案对比

| 方案 | 描述 | 结论 |
|---|---|---|
| **A · 替换** | 取消 toast/nod-bow，直接进 emoji 选择器 | ❌ 破坏已验收场景 B；丢失观察式 Acknowledge 与额度语义 |
| **B · 并行打断** | 与 nod-bow 同时弹出选择器 | ❌ 与角色动画抢注意力；违反「被动回归不应比主动 Recover 更重」（#323 revert 教训） |
| **C · 追加可选后续步** | 保持 Acknowledge → 完成后（或 toast 将尽时）再出轻量 emoji 条 | ✅ **推荐** |

### 2.3 拍板嵌入：**C · 追加可选后续步**

```
用户切回（>60s，Here & Now，未 suppress）
  ↓
【不变】Step 1 — Re-focus Acknowledge
  · nod-bow（mindfulAcknowledge · subtype refocus）
  · REFOCUS_ACKNOWLEDGE 观察式 toast
  · LightProgression Recover 扰动
  · 占本场 refocus 槽 + 日提醒额度（与现网一致）
  ↓
【新增】Step 2 — Reset Offer（可选，可跳过）
  · 时机：nod-bow 进入回落后 ~1s（约 t+8s），或用户点掉 toast 后立即
  · UI：底部轻条 / 小卡（非全屏 modal），一行 prompt + 5 emoji
  · 默认 8s 无操作自动淡出（须登记 SB-xx）
  · 不占额外提醒额度；每场 refocus 最多 offer 一次
  ↓
用户选 emoji
  ├─ 🌤️ → 直接回到专注（关条，无练习）
  ├─ 🪨 / 💨 / 👀 → 进入对应 Reset 微练习（§一）
  └─ 😰 → Take a Breath（短版）→ 练完见 Confide 柔性出口（§三.4）
  ↓
练习结束 / 点 ✕ / 超时
  → 关叠层，计时器从未暂停，回到 Focusing HUD
```

**接线锚点（实现期）**：

- 在 `MindfulReminderController._showReminder('refocus')` 返回 `shown: true` 后，由 `main.js` 调度 `RecoverResetOfferUI.tryShow()`（新模块名示意）。
- **不**改 `handleAttentionReturn` 额度逻辑。
- **不**挂在 `mindful` / `stretch` / `activeRecover` 路径。
- **不**恢复 #323 的 20–180s「轻语两钮」区间。

### 2.4 与主动 Recover（Tiger Anchor）的边界

| | 被动 Re-focus + Reset Offer | 主动 Recover |
|---|---|---|
| 触发 | 切走 >60s 回来 | Focusing 轻触阿寅 |
| Reset Offer | ✅ MVP 唯一入口 | ❌ v2 backlog |
| 额度 | 占被动池 | 不占 |
| 呈现 | toast 底部 + 可选后续条 | 中置 toast ~3s，无后续条 |

---

## 三、状态选择器交互

### 3.1 布局与行为

| 项 | 口径 |
|---|---|
| 形式 | 单行 **5 个 emoji 钮** + 一句 prompt；**无**分类树、**无** Confide 路由 |
| 位置 | Focusing **底部**（对齐 `FocusAwarenessCardUI`  clearance 带） |
| 层级 | `z-index: 17`（与 Moment Whisper / Focus Awareness 同带） |
| 跳过 | 点 🌤️、点 ✕、点条外空白（`blank-closes`）、8s 超时 → 等同「继续专注」 |
| 计时 | **全程不暂停** `FocusSession`（与 Tiger Anchor 一致） |
| 反馈 | 点 emoji **0–1s** 内：钮 `translateY(1px)` + 条开始收起；随即进入练习或关闭 |

### 3.2 五档 emoji → 路由（MVP）

| Emoji | 用户可读标签（en，仅选择器下 micro-label） | 路由 |
|---|---|---|
| 🌤️ | Steady enough | **直接进入 Focus**（无练习） |
| 🪨 | Heavy or ungrounded | **Feel the Ground**（20s） |
| 💨 | Breath feels tight | **Take a Breath**（2× natural 循环，~20s） |
| 👀 | Mind keeps scanning | **Look Around**（45s） |
| 😰 | Overwhelmed | **Take a Breath**（2× natural）→ 练完 **Confide 柔性出口**（§三.4） |

> **说明**：😰 不单独做第六套练习；先给最短呼吸重置，再在**练习结束屏**提供倾诉入口，符合决策 #2「分类逻辑不合并」。

### 3.3 选择器文案（en）

| Key（示意） | Copy |
|---|---|
| `RESET_OFFER_PROMPT` | Something still feels off? Pick what’s here — or keep going. |
| `RESET_OFFER_SKIP` | Keep focusing |
| `RESET_EMOJI_STEADY` | Steady enough |
| `RESET_EMOJI_HEAVY` | Heavy or ungrounded |
| `RESET_EMOJI_TIGHT` | Breath feels tight |
| `RESET_EMOJI_SCANNING` | Mind keeps scanning |
| `RESET_EMOJI_OVERWHELMED` | Overwhelmed |

语气自检：观察式、不贴诊断、不说教（对齐 `REFOCUS_ACKNOWLEDGE_*` / `ACTIVE_RECOVER_*`）。

### 3.4 overwhelmed → Confide 柔性出口

| 选项 | 做法 | 取舍 |
|---|---|---|
| 练完弹 modal | 二次打断 | ❌ 过重 |
| 延迟 5s toast | 易错过；与提醒池混淆 | ❌ |
| **练完结束条内嵌一行链接** | 非强制；点链才开 Confide | ✅ **推荐** |
| 自动打开 Confide | 违背「非强制」 | ❌ |

**推荐交互**：

1. Take a Breath 正常结束（或用户 ✕ 退出）后，底部出现 **结束条**（非 modal），停留 ~6s 可点关。
2. 文案 + 链接（en）：

| Key | Copy |
|---|---|
| `RESET_OVERWHELMED_CONFIDE_OFFER` | If it still feels like a lot, Yin can listen — no fixing, just company. |
| `RESET_OVERWHELMED_CONFIDE_LINK` | Talk to Yin |

3. 点链 → 走现有 `ConfideToYinUI.open()`（entitlement / `canOpenConfideNow` 门闩不变）。
4. **禁止**：把 emoji 送入 Confide 情绪桶、共用 safety 路由、写入 `presence-signals` 情绪 tag。

---

## 四、三项练习 UX 文案（en）

### 4.1 Feel the Ground（目标 20s，范围 15–30s）

| 阶段 | Key | Copy |
|---|---|---|
| 开场 | `RESET_GROUND_INTRO` | Feel the ground beneath you. Nothing to fix — just notice the contact. |
| 引导 1（0–7s） | `RESET_GROUND_FEET` | Soles of the feet… pressing, resting, or barely there. |
| 引导 2（7–14s） | `RESET_GROUND_SEAT` | The seat holds you. Weight can settle, even a little. |
| 引导 3（14–20s） | `RESET_GROUND_HERE` | Right here — the floor, the chair, this moment of return. |
| 结束 | `RESET_GROUND_OUTRO` | The ground is still here. You can keep going whenever you’re ready. |
| 关闭钮 | `RESET_DISMISS` | ✕ |

**交互**：单屏渐变文案（无步骤钮）；20s 自动结束；✕ 随时退出，无惩罚 copy。

### 4.2 Take a Breath（复用 breath-pacer · ~20s）

#### 沿用的 PRD 字段 / 模块（`docs/archive/stashed-prds-2026-07-24/breath-pacer-prd.md`）

| 沿用 | 用途 |
|---|---|
| `breath-engine.js` 状态机 | `inhale` / `hold` / `exhale` 相位、`start/pause/resume/stop` |
| `breath-presets.js` → **`natural`** | `{ inhale: 4, hold: 0, exhale: 6 }` |
| `breath-halo.css` + `--phase-duration` | 光晕与相位联动 |
| 相位文案键 | Inhale… / Exhale…（hold:0 跳过留息） |
| 事件 `breath-dismissed` / `breath-complete-done` | 宿主收尾 |

#### 本次新增 / 裁剪（Reset 上下文专用）

| 项 | 值 | 说明 |
|---|---|---|
| `preset` | 锁定 `natural` | **隐藏** 三 preset pill 切换 |
| `cycles` | **2**（非默认 4） | 2×(4+6)=**20s**，落在 Recover 微重置量级 |
| 完成钮 | 仅 **Done** | **不展示**「开始专注」；不 dispatch `breath-complete-focus` |
| 布局 | 紧凑条 / 半高卡 | 非全屏 Arrival 式；Focusing 背景仍可见 |
| 存储 | MVP **不写** `breathSessions` | 避免与左球 Breath practice 记账混淆；v2 可议 |

> **累计时长口径（有意排除 · 2026-09-07 分析师确认）**：Reset 上下文下的 Take a Breath（~20s、被动 Recover 应激呼吸）**不计入**练习累计时长、`breathSessions` IndexedDB、lotus pond / practice-days / Journey 任一账本。这是产品架构决策（Recover 微重置 ≠ 用户主动 Breath practice），**不是**「来源覆盖不完整」类 bug。并行排查「非 Sit 练习未计入累计判断」时，**勿将本项误判为遗漏漏洞**。

| 阶段 | Key | Copy |
|---|---|---|
| 开场 | `RESET_BREATH_INTRO` | One slow breath at a time. The timer keeps going — stay as long as you like. |
| 相位 | `BREATH_PHASE_INHALE` 等 | 与 PRD 一致（复用 breath-pacer 池） |
| 结束 | `RESET_BREATH_OUTRO` | This breath is still here. |

> **依赖说明**：breath-pacer 组件尚未入库；Reset MVP 实现前须先落地 PRD 任务 1–3（引擎 + 组件），再接 Recover 宿主。

### 4.3 Look Around（目标 45s，范围 30–60s）

5-4-3-2-1 感官锚定，**轻量自动推进**（每步 ~9s，可点「Next」加速）。

| 步 | Key | Copy |
|---|---|---|
| 开场 | `RESET_LOOK_INTRO` | Let the eyes land on what’s actually here. |
| 5 看 | `RESET_LOOK_SEE` | Notice **five** things you can see — no need to name them perfectly. |
| 4 触 | `RESET_LOOK_TOUCH` | **Four** things you can feel — air, fabric, the chair, your hands. |
| 3 听 | `RESET_LOOK_HEAR` | **Three** sounds, near or far. |
| 2 嗅 | `RESET_LOOK_SMELL` | **Two** scents — or the quiet absence of scent. |
| 1 | `RESET_LOOK_ONE` | **One** steady point to rest the gaze on. |
| 结束 | `RESET_LOOK_OUTRO` | The room is still here. Attention can return to what you were doing. |
| 下一页 | `RESET_LOOK_NEXT` | Next |

---

## 五、overlaySlotArbitration / spriteChannelArbitration 接入

### 5.1 新增 Overlay 契约（须在 `overlaySlotContractRegistry.js` 登记）

| Source ID | Kind | tier | snapshotField | blocksIdleYinTap | blocksEnterSleep | outsideDismiss | Focusing 允许 |
|---|---|---:|---|:---:|:---:|---|:---:|
| `recover-reset-offer` | `VISUAL_SECONDARY` | 24 | `recoverResetOfferOpen` | false | false | `blank-closes` | **是**（同 `FOCUS_AWARENESS`） |
| `recover-reset-practice` | `VISUAL_SECONDARY` | 24 | `recoverResetPracticeOpen` | **true** | false | `backdrop-only` | **是** |

**`requestOverlaySlot` 改造要点**：

1. 在 `session-hard-gate` 例外列表中，为上述两 source 增加与 `FOCUS_AWARENESS` 相同的 **Focusing 允许**分支。
2. `deriveFocusAwarenessCardBusy` 扩展为 `deriveFocusingSoftCardBusy`：互斥 `recoverResetOfferOpen` / `recoverResetPracticeOpen` / `focusAwareness` 同时 show。
3. Reset Offer **yield** 给：`CELEBRATE`、`arrivalOpen`、`reflectionOpen`、`microRitualOpen`、`honesty*`、`compassOpen`、`mustardSeedOpen`、`flowerWelcomeVisible`、`focusCircleWitness*`、已开的 `recoverResetPracticeOpen`。
4. Reset Practice **yield** 给：同上 + `recoverResetOfferOpen`（练习中不再弹 offer）。
5. **不**占用 `postSessionOverlayActive`；**不**触发 `blocksEnterSleep`（用户仍在 Focusing）。

### 5.2 与 Re-focus Acknowledge 的时序互斥

| 时段 | 占用 |
|---|---|
| nod-bow 播放中 | sprite 通道：`mindfulAcknowledge` 仪式占用；**不**弹 Offer |
| toast 可见 | Offer 可准备但不遮挡脸部（底部条） |
| Offer 可见 | 不重复触发第二次 refocus |
| Practice 可见 | 抑制 `ActiveRecoverAnchor` 微光提示（防误触）；invisible hit 策略对齐 FB-01 文档 |

### 5.3 spriteChannelArbitration

| 场景 | 决策 |
|---|---|
| Reset Offer | `requestSpriteChannel` → **KEEP**（idle-breathing）；无新 `SPRITE_SOURCES` |
| Feel the Ground / Look Around | KEEP + 可选轻 `blink-smile` @ 4fps（与 Arrival 呼吸 beat 同档，**不**切 dormant） |
| Take a Breath | `<breath-pacer>` 的 `slot="mascot"` 展示当前 idle 帧；**不**申请 `CELEBRATE` / `HONESTY_ACK` |
| 强反馈冲突 | 与 `MindfulReminderController` 相同：`STRONG_EMOTIONS` 集合 → 整链静默（含 Offer） |

### 5.4 Z-index

| 元素 | z-index |
|---|---|
| Reset Offer / Practice 根 | **17**（登记 `Z_INDEX.md`，对齐 Focus Awareness） |
| Practice 内 ✕ | 18 |
| overwhelmed Confide 结束条 | 17（Practice 关闭后单独短条） |

---

## 六、明确排除项（本轮）

- **Reset Take a Breath 不计入累计时长 / `breathSessions`**（有意排除；见 §4.2 说明；不在「非 Sit 练习累计覆盖」bug 排查范围内）
- 主动菜单 / 阿寅触点入口（v2 backlog）
- 游戏化奖励 / 寅币 / Journey 记账
- 修改 Confide 情绪桶 / safety 路由
- backlog 5 项 Reset（未命名项不在本 Brief 展开）
- 20–180s 切走轻语（已 revert，禁止复活）
- Offline / Flow `suppressAwayReminders` 路径
- Electron 托盘 SB-18 路径

---

## 七、冲突扫描（实现前）

| 轴 | 相邻场景 | 结论 |
|---|---|---|
| 强度 | 场景 B Re-focus；场景 X Tiger Anchor | Offer 仅在被动 refocus **之后**、可跳过；强度 ≤ 主动 Recover（主动无 Offer）→ **无冲突** |
| 语气 | `REFOCUS_ACKNOWLEDGE`；`ACTIVE_RECOVER`；EMOTION_BIBLE 观察式 | 文案池已按四项自检起草 → **无冲突** |
| 职责 | Focus Awareness 卡；Moment Whisper；左球 Breath practice | 不同触发器与 store；Reset 不写 `moment-whispers-seen` / 不占提醒额度 → **无冲突** |

---

## 八、验收提纲（实现后 · 场景 **B-Reset** 草案）

1. `?product=1&sessionMinutes=5` → Here & Now → 切走 **70s** → 回来：先见 **经典** toast + nod-bow → **随后**底部 emoji 条（可跳过）。
2. 选 🌤️：条消失，HUD 继续计时，无练习。
3. 选 🪨：20s 文案引导 → 自动结束；计时未停。
4. 选 💨：2 循环 natural 呼吸（~20s）；无 preset 切换、无「开始专注」。
5. 选 👀：5-4-3-2-1 步进 ~45s。
6. 选 😰：呼吸结束后见 Confide 内嵌链接；不自动打开 Confide。
7. **对照**：主动点阿寅 Recover → **无** emoji 条。
8. **对照**：Offline Space 切走回来 → **无** refocus、无 Reset。
9. **回归**：场景 B 额度 / 每场 1 次仍成立；Focus Awareness / Whisper 行为不变。

---

## 九、实现顺序建议

1. `overlaySlotContractRegistry` + `overlaySlotArbitration` 注册两 source + 单测
2. breath-pacer PRD 任务 1–3（若尚未合入）
3. `RecoverResetOfferUI` + 三练习 UI（可同一 PR）
4. `main.js` 接线：`onRefocusShown` → `tryShowOffer`
5. locale en/zh/ja；`Z_INDEX.md`；`SCENARIO_TESTS.md` 场景 B-Reset；`TEST_TRACKER` 碎片

---

## 十、已拍板项（2026-09-07 · 分析师确认）

| 项 | 定稿 |
|---|---|
| 😰 overwhelmed | 先 Take a Breath（~20s），练完再给 Confide 柔性链接；**不**直接跳倾诉入口 |
| Offer 超时 | **8s** 自动消失（低强度、可忽略；常驻至手动 ✕ 视为过重） |
| Look Around | **45s** 自动步进，可点 Next 加速 |
