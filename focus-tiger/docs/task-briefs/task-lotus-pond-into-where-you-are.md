# Task Brief · 莲花池迁入 Where you are（Idle  spiral 退役）

> **状态（2026-10-11）**：**已锁** · PO 书面点头（公式分开、首页永不画花、1–12 横排无阶段名）· 旁支 `feature/lotus-pond-into-where-you-are`。  
> **类**：B（用户可见布局 / 叠层职责）。  
> **用户书面（2026-10-11）**：莲花池与屏幕其它功能冲突 → 纳入 Where you are；插在截图红框位置（下一小步句与累计分钟之间）；随 Yin’s evolution 逐步排成一排；莲花缩小 50%。

## 一句话目标

Idle 主屏 **不再** 在阿寅身前画持久螺旋莲花。可见朵数改到「Where you are」纸面里、**下一小步句与累计时间之间**，随已开朵数从左到右排成一排，单朵视觉约为现网的 **一半**。分钟账本、开花阈值、备份键 **不变**。

## 背景

现网 `#lotus-pond` 挂在 `#sprite-overlay`（阿寅前、z 2），螺旋槽位要躲开脸、蒲团、Sit / 三球、睡觉姿势。这套几何已经和首页其它 chrome 抢空间。Where you are（场景 AV）是只读成长纸，已经读同一份莲花终身分钟当累计时间——把 **可见花** 挪到这张纸上，主屏让给阿寅与按钮。

「Yin’s evolution」在此 **不是** 阶段 HUD / 用户可见阶段名（`YIN_EVOLUTION.md` 禁止）。它是 Visible Growth：终身分钟开出第 1…12 朵时，纸面上多一朵，排成一行。

## 插入位置（锁）

`GrowthJourneyDetailUI` 现序：标题 → 阶段轨道 → You're here → 下一小步 → **【此处插莲花行】** → 累计分钟 → 节奏点。

与用户截图红框一致。无朵时 **不占空行**（0 朵隐藏该行）。

## 范围（in）

- 从 `#sprite-overlay` **卸掉** `#lotus-pond` / `#lotus-pond-birth-fx` 常驻层；Idle 螺旋槽位不再种植。  
- Where you are 内新增只读行 `#growth-journey-lotus-row`（`data-testid=growth-journey-lotus-row`）：`flex` 横排，朵数 = `getVisibleBloomCount()`（仍 cap 12）。  
- 单朵贴图仍 `/textures/lotus.png`（一炷香去水印，禁止 rising/halo 帧）。宽度约为现网 `min(12vw, 96px)` 的 **50%** → `min(6vw, 48px)`；窄屏一行挤不下时 **整行等比再缩** 以保住一排，禁止折成两行。  
- `releaseBirths()`：主屏 **不再** 播全屏出生 FX。若纸面当时开着 → 新朵在行尾淡入（约 900ms，与现 `plantBloom` 同族）；若关着 → 下次打开时安静种好。分钟仍在达标时立刻入账。  
- 改场景 AV + 「莲花池（持久螺旋）」剧本：空池/满池对照改到 Where you are 行，不再断言阿寅左侧身旁。  
- 改 `GROWTH_JOURNEY.md` 一句：圆点仍 **不是** 朵数；纸面可 **展示** 园子痕迹（花），不合并公式。  
- `Z_INDEX.md`：删 sprite 子层莲花池登记；花在详情纸内部，不新开全局 z。  
- 单测 + tracker 碎片。

## 范围（out）

- `lotus-pond.v1` 阈值 / 日封顶 / 备份 / `scoreFormula`。  
- Yin Evolution 阶段名、Stage HUD、Journey Log 记忆句。  
- 首页短轨迹外观。  
- 寅币 `lotus-dew` 滤镜（若仍挂旧 pond class，只改挂载点，不改 SKU）。  
- Slice B 金环。

## 冲突扫描（2026-10-11）

相邻：场景 **AV**（Where you are）、**莲花池持久螺旋**、Idle 三球 / Sit、睡觉不得盖花、Yin Evolution 禁 HUD。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 主屏少一层装饰，不比 Celebrating / MilestoneGlow 更吵。纸面多一排静物。出生 FX 离开 Idle，强度下降。 |
| **b. 语气** | 痕迹，不是奖杯墙。无百分比、无「还差 N 朵」。 |
| **c. 职责** | **有疑点，须 PO 点头。** `GROWTH_JOURNEY.md` 写「不是莲花朵数」「四者并存、不合并」。本 Brief **不把朵数变成圆点**；只把花的 **画面宿主** 从 Idle 改到同一张纸。若 PO 认为「同纸即合并」→ 停。 |

## 共用机制核对

- **overlayBusy / HUD 呼吸**：不新增 overlay。沿用现有 `#growth-journey-detail` backdrop（z 17）。莲花行 `pointer-events: none`。  
- **结论**：不改 overlayBusy 消费者；Idle 精灵层少两个子层。Focusing 时详情本就会关，花不跟坐。  
- **后台网络**：不涉及。

## 点击反馈

- 点首页短行打开 Where you are：0–1 秒内纸面出现，有朵则见横排莲花。  
- 莲花本身不可点。静默属装饰，不单开 SB（与现 pond `aria-hidden` 同族）。

## 验收

1. Idle `?product=1`：阿寅身前 **无** 持久莲花；Sit / 三球 / 睡觉不被花挡。  
2. `qaLotusBlooms=0`：Where you are 无莲花行。  
3. `qaLotusBlooms=1` … `12`：花在下一小步与累计分钟之间，一排从左往右增多；单朵约现网一半。  
4. 375：仍一排，不折行、不挡 Close。  
5. 达标开新朵：主屏无出生 FX；再打开纸面（或当时已开）见新朵。  
6. `npm run test:smoke` 绿。  
7. tracker 碎片「待人工测试」。

## 实现入口（点头后）

- `src/ui/GrowthJourneyDetailUI.js`  
- `src/ui/LotusPondChrome.js` / `LotusPondRuntime.js`（宿主从 overlay 改为详情行；螺旋槽可留作死代码删除或测试夹具，禁止 Idle 再 mount）  
- `src/core/lotusPondMath.js`（横排槽位；螺旋常量可删或标退役）  
- `src/main.js` 接线  
- `docs/SCENARIO_TESTS.md` 场景 AV + 莲花池行  
- `docs/GROWTH_JOURNEY.md` 一句宿主说明  
- `docs/Z_INDEX.md`  
- `docs/tracker-entries/<branch>.md`
