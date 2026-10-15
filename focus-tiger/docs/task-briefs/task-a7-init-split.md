# Task Brief · A7 `init()` 分段拆分

> **状态（2026-10-13）**：**规格已锁** · Brief PR [#1190](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1190) 本回合刷新文案，与 `origin/develop` 对齐后合入。  
> **落地进度（git 事实 · `origin/develop` `b0d47bc8`）**：**A7.1 已合** [#1192](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1192) · **A7.2 已合** [#1199](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1199) · **A7.3 已合** [#1201](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1201) · **A7.4 已合** [#1252](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1252) · **A7.5 已合** [#1254](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1254) · **本支 A7.6**。  
> **分刀类**：默认 **A**（调用顺序、`await` 顺序、第一幕占用与现网一致）。若某刀必须改 construct 相对 `await` / 第一幕的先后 → **升 B**，停下来改本 Brief 再动。  
> **依赖**：A6 已合 [#1189](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1189)；A5 已合 [#1186](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1186)。  
> **行号基线**：`src/main.js` 仍含大段 `init()`（约 6171 行文件 · 合入后以符号为准）；段 2–3 已抽到 `src/boot/boot-scene-anim.js` · `boot-moment-hosts.js`。

## 一句话目标

把 `init()` 拆成按固定顺序调用的启动段。每段自己先声明再赋值，清掉 A6 那 23 个封顶（**本支后 0 名 / 0 次**，见下表）。一次只拆一段，不跟功能 PR 混在一起。

## 进度快照（2026-10-13 · develop）

| 指标 | A6 起点 | 现 develop | A7 全线目标 |
|---|---|---|---|
| 豁免 `name` 数 | 23 | **0**（本支 A7.6 后） | 0 |
| `main.js` 命中次数 | 67 | **0**（本支 A7.6 后） | 0 |
| `src/boot/` 文件 | 0 | **6** 模块 + 单测 | 段 2–7 各模块（段 1 可暂留 `init()`） |

**已落地文件**：`boot-scene-anim.js`（段 2）· `boot-moment-hosts.js`（段 3）· `boot-honesty-companion.js`（段 4）· `boot-session-chrome.js`（段 5）· `boot-ambient-hints.js`（段 6）· 本支 `boot-arrival-focus-ready.js`（段 7）。`init()` 内仍保留 `onboardingHintHost` box（#1139；overlayBusy 不得直接读晚绑定）。段 1 Kernel 仍暂留 `init()`。

## 为什么现在拆（2026-09-06 盘点仍有效）

[`large-file-volume-cause-audit.md`](../large-file-volume-cause-audit.md)：`init()` 是活编排，不是垃圾。拆它等于动 boot 契约，**禁止**与 Quiet Line / YPE V2 / Confide / 商品线同 PR。

A6 已经拦住**新的**先用后定义。A7.1 / A7.2 证明分刀可审、帽子只减；余下四段按本表继续，不得与功能 PR 混线。

## 范围（in · Brief PR #1190）

- 本文件与 develop 对齐：分段顺序、依赖、**已完成刀**、余下豁免清零地图、分刀表
- 账本 / 盘点表 / 契约一句指向本 Brief
- tracker 碎片（纯文档）

## 范围（out · 所有 A7 分刀）

- 不与功能 PR 混线
- 不改 Support / Stripe 付款路径、不改 `#yin-support-modal` 层级
- 不改品味层拉取时机（仍须在 sprite preload + welcome/idle 之后，RB-20260820-L330）
- 不提前摘 Loading 遮罩（仍须等到 welcome/idle boot）
- 不改第一幕 occupancy 赢家（welcome / 吹花 / 付款致谢 / 披毯）
- 不做 A8 页面防呆、A11–A13 玻璃/z-index
- 禁止「一次性把剩余 `let` 提到 `init()` 顶」的单 PR（diff 不可审，且不产生段边界）

## 拆法（锁死）

1. 新文件放 `src/boot/`，英文 ASCII kebab-case（如 `boot-scene-anim.js`）。
2. `init()` 方向：建共享 `bootCtx` → **按本表顺序** `await`/`call` 各段 → 置 `__FT_APP_READY__`（全线完成前仍有大段内联逻辑）。
3. 段内先 `let name = null`（或沿用 #1139 的 **box**，如 `onboardingHintHost`），再写闭包，**最后** `new` / 赋值。禁止再出现「函数写在 `let` 上面」。
4. 每刀结束必须：该刀点名的豁免 `maxHits` 下降或删行；全表帽子只减不增；`lint:main-use-before-define` 绿。
5. 函数声明仍可后置（A6 豁免函数声明；不要为整齐去倒腾声明提升而改调用时机）。

## 分段顺序与依赖

调用顺序 **1 → 7**，不得对调。行号为拆分前地图；**已抽段的以 `src/boot/*` + `init()` 调用点为准**。

| 段 | 文件 | 落地 | 做什么 | 依赖上一段交出的 | 本段才允许 `new` / 赋值的绑定 |
|---|---|---|---|---|---|
| **1** Kernel | 暂留 `init()` | 未抽文件 | locale、SW、3D、incense、sprite `preload`、`EmotionController`、实验室壳 | DOM `#app` | `spritePlayer` · `emotionController` · `idleOrchestrator` |
| **2** Scene + occupancy | `boot-scene-anim.js` | **已合 #1192** | `isSceneAnimOverlayBusy` / `tryPlaySceneAnim` / dispatch / occupancy / 信使 / **提醒横幅构造** | 段 1 精灵与情绪 | `sceneAnimationDispatch` · `spriteOccupancy` · `inAppReminderBannerUI` |
| **3** Moments hosts | `boot-moment-hosts.js` | **已合 #1199** | Recover 卡、罗盘、见证圈、玻璃叠层助手、Support **助手**（`new SupportYinModalUI` 在本段末） | 段 2 occupancy | `calmActionRecoverCardUI` · `fiveMomentsCompassUI` · `focusCircleWitnessChrome` · `supportYinModalUI` |
| **4** Honesty + companion | `boot-honesty-companion.js` | **已合 #1201** | Honesty UI/控制器、Companion 点选、微仪式 UI、Arrival **占位** `null` | 段 3 Support 实例 | `honestyCheckInUI` · `companionModePicker` · `microRitualUI` · `arrivalPractice`（先 null） |
| **5** Session chrome | `boot-session-chrome.js` | **已合 #1252** | `SessionUiGate`、`createSessionChromeSync`、`postChooseChrome`、Arrival 门闩旗 | 段 4 picker / Honesty | `sessionUiGate` · `postChooseChrome` · `syncArrivalGateReady` · `syncHonestyIdleEntry` · `pendingAutoStartMode` · `arrivalChoseThisRun` · `suppressCompanionOpenAfterNod` |
| **6** Ambient + hints | `boot-ambient-hints.js` | **已合 #1254** | 环境声、session cues、`onboardingHints`（保留 hint host box） | 段 5 gate | `ambientSoundscape` · `sessionCues` · `onboardingHints` · `pendingChoose` |
| **7** Arrival + Focus + ready | `boot-arrival-focus-ready.js` | **本支 A7.6** | Arrival UI 赋值、`FocusInput`、第一幕占用、品味预取、摘遮罩、`__FT_APP_READY__ = true` | 段 6 hints | `arrivalPractice`（赋值）· `focusInput` |

段 1 可与段 2 同刀文件化，只因为段 1 **没有** A6 豁免名（A7.1 未做段 1 文件化，可留给后续整线收尾）。禁止把段 6 的 `OnboardingHintsUI` 构造提前到 sprite preload 之前。

## 豁免清零地图（A6 23 名）

帽子 SSOT：[`scripts/main-use-before-define-exemptions.js`](../../scripts/main-use-before-define-exemptions.js)。每刀 PR 描述必须列出将下降的 `name` / `maxHits`。

| 刀 | 状态 | 清哪些名字（`maxHits`） |
|---|---|---|
| **A7.1** 段 2 | **已合 #1192** | `sceneAnimationDispatch` (1) · `spriteOccupancy` (1) · `inAppReminderBannerUI` (2) — **已删行** |
| **A7.2** 段 3 | **已合 #1199** | `calmActionRecoverCardUI` (1) · `fiveMomentsCompassUI` (1) · `focusCircleWitnessChrome` (1) · `supportYinModalUI` (3) — **已删行** |
| **A7.3** 段 4 | **已合 #1201** | `honestyCheckInUI` (2) · `companionModePicker` (4) · `microRitualUI` (1) · `arrivalPractice` (1) — **已删行** |
| **A7.4** 段 5 | **已合 #1252** | `sessionUiGate` (5) · `postChooseChrome` (1) · `syncArrivalGateReady` (1) · `syncHonestyIdleEntry` (1) · `pendingAutoStartMode` (1) · `arrivalChoseThisRun` (1) · `suppressCompanionOpenAfterNod` (1) — **已删行** |
| **A7.5** 段 6 | **已合 #1254** | `ambientSoundscape` (13) · `sessionCues` (9) · `onboardingHints` (13) · `pendingChoose` (1) — **已删行** |
| **A7.6** 段 7 | 本支 | `focusInput` (2) — **已删行** |

全部清零后：豁免表为空数组；夹具仍必须报 #1139 写法；`src/main.js` 零命中。

**`onboardingHints`（#1139 类）**：继续用 **box**（`onboardingHintHost`）给 overlayBusy 早读；本支把 `onboardingHints` 放进 `bootAmbientHints`，`new OnboardingHintsUI` 仍在段 6 现网位置。禁止让 overlayBusy 再直接读晚绑定。

## 分刀（每刀一个 PR）

| PR | 状态 | 做什么 | 门禁 |
|---|---|---|---|
| **Brief #1190** | 本回合刷新 | 文档与 develop 对齐 | `docs:check` + `test:smoke` |
| **A7.1** | **已合 #1192** | 段 2 → `boot-scene-anim.js` | 已验证 |
| **A7.2** | **已合 #1199** | 段 3 → `boot-moment-hosts.js` | 已验证 |
| **A7.3** | **已合 #1201** | 段 4 → `boot-honesty-companion.js` | 已验证 |
| **A7.4** | **已合 #1252** | 段 5 → `boot-session-chrome.js` | 已验证 |
| **A7.5** | **已合 #1254** | 段 6 → `boot-ambient-hints.js` | 已验证 |
| **A7.6** | 本支 | 段 7 → `boot-arrival-focus-ready.js` | `lint:main-use-before-define` + `test:smoke` + `test:e2e:startup`；CI `test:pr-smoke` |

禁止：两段进同一功能 PR；「顺便」改 Confide / 菜单文案 / 付款。

## 点击反馈（0–1 秒）

Brief PR 不涉及可点击交互。  
分刀：点击后 0–1 秒须与现网同一画面（菜单、Sit、Arrival、Support FAB）。无新静默；不新增 `SILENT_BEHAVIORS`。

## 共用机制核对

**Brief PR**：不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。  
不改 `#yin-support-modal` / Support FAB / Stripe CTA。不涉及后台网络。

**每一刀代码 PR 须重写结论句（禁止只打勾）**：

- **overlayBusy**：点名 `isSceneAnimOverlayBusy` 与 `onboardingHintHost`；消费者仍是 scene anim / 欢迎第一幕，不得改成直接读晚绑定的 `onboardingHints`。
- **HUD 呼吸**：不改 `overlayBreathing` 驱动者表；开表后左上角仍从 00:00 走动。
- **z≥17 / Support**：`#yin-support-modal` 仍走 `GLASS_CARD_KEEP_STYLESHEET_Z`；FAB `#yin-support-fab` 可点。`supportYinModalUI` 只允许段顶 `null` + 段末现网同一位置 `new`，禁止把 Support 构造挪到遮罩/欢迎之前（**#1199 已按此验收**）。
- **后台网络**：品味预取仍在 sprite + welcome/idle 之后；不新增开机请求。

## 冲突扫描

相邻：冷启动 / Sit（场景 A）· Arrival · Honesty 补登 · Support 三卡。  
Brief 无用户路径。后续分刀若保持调用顺序：强度 / 语气 / 职责均不变（不是新入口）。若某刀改了欢迎与 Idle 谁先画 → **有冲突疑点，停**。

## 已好清单

- A7.1 / A7.2 / A7.3 / A7.4 / A7.5 已合 develop；`src/boot/` 五段 + 单测在主干；本支加段 7
- A6 lint 仍进 `test:smoke`；#1139 夹具仍必须红
- A5 `pre-push` 启动冒烟仍跑（有 `src` 的刀不可 docs-skip）
- A2/A3/A4 菜单查表 / 玻璃卡登记 / 缺 handler 抛错不回退
- 品味预取、Loading 遮罩、第一幕 occupancy 时机不改
- 豁免表只减不增（本支后：**0 名 / 0 次**）
- 不与 Quiet Line / YPE / Confide / 商品 PR 混线

## 验收

### Brief PR #1190（本回合）

1. 七段顺序、依赖、豁免地图与 **develop 已合刀** 一致，不宣称「点头前禁止改 boot」。
2. A7.6 为本表最后一刀代码；段 1 Kernel 仍可暂留 `init()`，不另开功能混线 PR。

### 每一刀代码 PR

1. 点名豁免 `maxHits` 下降或删行。
2. `npm run lint:main-use-before-define` 绿；夹具仍报 `onboardingHints`。
3. `npm run test:smoke` 绿。
4. `npm run test:e2e:startup` 绿（`__FT_APP_READY__ === true`，无 pageerror）。
5. CI `test:pr-smoke` 绿；全量 e2e 以 CI 为准，不在本地跑全量。
6. 不点击 Stripe；不改 overlay dim 付款守卫。

### A7 整线完成

豁免表空；`init()` 为有序段调用；启动冒烟与现网冷启动观感一致。
