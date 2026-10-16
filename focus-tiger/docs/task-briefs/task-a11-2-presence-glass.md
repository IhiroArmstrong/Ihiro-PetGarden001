# Task Brief · A11.2 在场信号卡换暖米玻璃

> **状态（2026-10-16）**：**PO 书面免审开工**（口令：Brief 无需审核，连贯执行下一步；立刻开工 A11.2）。  
> **类**：**B**（卡根从近乎不透明纸色换成 sanctuary 暖米玻璃，用户看得见）。  
> **依赖**：A11.1 已合 [#1276](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1276)（`createGlassCard` + `check-glass-card-roots`；`presence-signals-panel` 为 opaque-cream holdout）。  
> **不做**：A12 层级常量化；A13 截图比对；不改存储 / Consent / 90 天 / 双写 / 删除联动。

## 一句话目标

`#presence-signals-panel` 卡根走共享暖米玻璃（`createGlassCard()` + `GLASS_FILL`）。扫描不再把它当纸色暂留。宽屏侧停、人时、`···` Remove 仍按 D.2 机制，只换表面。

## 为什么现在做

A11.1 发现唯一仍近乎不透明的登记卡根就是在场信号卡（`PAPER_FILL` ≈ 0.98）。A11 父 Brief 写明：有可见换肤则升 B、另开本刀。

## 范围（in）

- `PresenceSignalsPanelUI` 根节点用 `createGlassCard({ id: 'presence-signals-panel', deck: true })`。  
- 样式表卡根填色改为 `GLASS_FILL` / `GLASS_BORDER` / `GLASS_SHADOW` / `GLASS_BLUR_CSS` / `GLASS_RADIUS`；去掉 `PAPER_*`。  
- 从 `GLASS_CARD_ROOT_HOLDOUT_IDS` 拿掉 `presence-signals-panel`。此后该卡根若再写 opaque-cream / 深色底板，扫描必须红。  
- `SANCTUARY_UI_ART_DIRECTION.md` D.2 卡根表面改为暖米玻璃（覆盖原「实色纸感」句；机制句不动）。  
- 本 Brief、task/issue/tracker 碎片。

## 范围（out）

- 不改 `z-index` 数字或 `Z_INDEX.md`（A12）。遮罩仍 z=15、卡仍 z=16。  
- 不改 Stripe / Support CTA / `#yin-support-modal`。  
- 不把列表行、Consent 钮、overflow 菜单改成另一套玻璃体系（行内可保持略实，便于阅读）。  
- 不改宽/窄停靠几何、人时、删除、入账。  
- 不做截图 CI（A13）。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 ≥480 | ⋯ → Presence moments | 0–1 秒内 `#presence-signals-panel` 可见，靠右停靠；卡根暖米半透明玻璃（能透出栖居），不是实色纸板 | 本刀源码契约 + `check:glass-card-roots`；停靠几何既有 `PresenceSignalsPanelUI.test.js` |
| 窄屏 ≤479 | 底栏抽屉同入口 | 0–1 秒内短底面板出现；卡根同一套 `GLASS_FILL`，不停靠规则不改 | 同上 |
| 空列表 | 无 presence 行 | 空态文案仍在玻璃卡内 | 既有 empty testid；本刀不改文案 |
| 有行 + 展开人时 | 点行头 | 精确时间展开；卡根仍玻璃 | 既有 human-time 单测 |
| `···` Remove | 有可删行 | 菜单出现 → Remove 行为与联动删除不变 | 既有 overflow 单测 |

本次不新增练习种类、商品类型或多语言入口差异。宽窄只分停靠，卡根填色同一套 token。

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 菜单 Presence moments | 面板淡入；卡根是暖米玻璃（不再是实色纸） | — |
| 关闭钮 / 点空白遮罩 | 面板收起（现网 dismiss） | — |
| 行头 | 展开/收起精确时间 | — |
| `···` → Remove | 菜单出现；删行后列表刷新或失败状态句 | 失败：既有 status 文案；不新造静默 |

不新增静默。设计静默（Leave 记账等）不在本刀。

## 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 已开另一张可拖玻璃卡 | 仍最多两张叠层（现网 deck）；本刀不改 18/19 规则 |
| Support 大卡 / FAB | 不受本刀影响；不得把 Support 打进 presence 样式 |
| 窄屏键盘/安全区 | 仍用现网 `bottom` / safe-area；只换填色 |
| 无付款/已购分支 | 本刀无 SKU |

## 共用机制核对

- **overlayBusy**：不改 `isSceneAnimOverlayBusy` / Presence 开卡门闩。开 `#presence-signals-panel` 仍走现网 `PresenceSignalsPanelUI` + overlay registry，不新增 `OVERLAY_UI_SURFACE` 行。  
- **HUD 呼吸**：不改 `overlayBreathing` 驱动者；开卡不另接呼吸步。  
- **z≥17 遮罩**：不改 dim。本卡仍登记 z=16、backdrop z=15（`Z_INDEX.md` Presence 行）。Idle 常驻 chrome（Support FAB z=24、Ambient 音符、倾听耳）不被本刀改 pointer-events。  
- **新建可点击叠层**：不新增 overlay。`createGlassCard({ deck: true })` 仅给已在 `GLASS_CARD_ELEMENT_IDS.presence` 的 id 打标，与现网 `installGlassCardDeck` 一致。  
- **后台网络**：不涉及。  
- **受保护路径**：只作用于 `#presence-signals-panel` / `.presence-signals-panel`。不含 `#yin-support-fab`、`#yin-support-modal`、Subscribe / 会员 / Sanctuary / 请茶 CTA。工厂不得改成「所有居中卡片」。

## 冲突扫描

相邻：场景 AF Presence 入账/披露；TEST_TRACKER D.2 侧停/人时/删除；SANCTUARY D.2 原「实色纸感」；A11.1 扫描 holdout；玻璃叠层最多两张。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 不增加点击或仪式；只换卡根透明度。 |
| **b. 语气** | 不改文案。 |
| **c. 职责** | 仍是同一 Presence 面板，不是新入口。D.2 **机制**（人时、删除、存储）保留；**卡根表面**按本 Brief 覆盖为 sanctuary 玻璃（PO 已点名换肤）。 |

无冲突疑点（表面 SSOT 以本 Brief + 将改的 D.2 句为准）。

## 已好清单

- 宽屏仍靠右停；窄屏仍短底面板。  
- 人时默认、精确时间仅展开。  
- `···` Remove 与 Reflection 联动删除不变。  
- `#yin-support-modal` 不可拖、z 仍 26。  
- 菜单 `⋯` / 抽屉抓手不被 hide。  
- #1147 深色语音卡夹具扫描仍红。

## 验收

1. 源码无 `PAPER_FILL` / `rgba(255, 249, 240, 0.98)` 卡根。  
2. `createGlassCard` 创建 `#presence-signals-panel`；CSS 卡根 `background` 为 `GLASS_FILL`。  
3. `GLASS_CARD_ROOT_HOLDOUT_IDS` 不含该 id；对该文件再写入 opaque-cream 则 `check:glass-card-roots` 红。  
4. `PresenceSignalsPanelUI.test.js` 停靠 / overflow / 人时仍绿。  
5. `npm run test:smoke` 绿。本刀不改玻璃叠层共享 z 逻辑；不点 Stripe。  
6. 人工：宽/窄打开 Presence，卡能透出栖居，不是实色纸板。
