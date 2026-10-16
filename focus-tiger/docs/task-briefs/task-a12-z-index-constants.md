# Task Brief · A12 层级常量化

> **状态（2026-10-16）**：口令「立刻开工 A12」；规格锁在 `root-cause-audit-2026-10-12.md` §4 A12。  
> **类**：**A**（数字不变；用户看到的叠层顺序不变。若必须改某个数字 → 升 B，停下来改本 Brief）。  
> **依赖**：A11.1 #1276、A11.2 #1278 已合；本刀不改卡根背景。  
> **不做**：A13 截图比对；不改 Stripe / 付款 CTA；不把 Enso 从 4 抬到 11。

## 一句话目标

产品 `z-index` 只许来自 `zIndexLayers.js`，且每个数字能在 `Z_INDEX.md` 对上。扫描进 `docs:check`。现存手写数字先换成常量；`index.html` 静态壳豁免，帽子只减不增。

## 范围（in）

- `src/ui/zIndexLayers.js` 与登记表一一对应。  
- `scripts/z-index-literal-check.js`：表外数字红；表内手写数字除非豁免也红。  
- 产品 `src/` 赋值改为 `Z.*`（含 Support 25/26、Sanctuary 27、玻璃叠层 18/19）。  
- `DOC_CODE_CONTRACT` Z-dim (a) 指向该扫描。  
- 补登代码里已有、表里漏掉的 5 / 31 / 42；Enso 行改成实际的 4。

## 范围（out）

- 不改任何层级**数值**。  
- 不改 `#yin-support-modal` keep-stylesheet-z；工厂/玻璃底色不在本刀。  
- 不做 CSS 变量化（`--z-support-modal`）。  
- 不改 overlay dim 选择器名单。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 共用机制核对

- **overlayBusy**：不改 occupancy / 第一幕 busy 门闩。  
- **HUD 呼吸**：不改 `overlayBreathing` 驱动者。  
- **z≥17 遮罩**：不改 dim 行为。Support FAB / Ambient 音符 / 倾听耳（z=24）仍走现网 `overlayBackdrop` idle-chrome dim，不得只盖低于 17 的背景。本刀只把 17/24/25/26 换成同值常量。  
- **新建可点击叠层**：不新增 `OVERLAY_UI_SURFACE` 行。  
- **受保护路径**：Support 遮罩仍 `Z.SUPPORT_DIM` = 25，大卡 `Z.SUPPORT_MODAL` = 26，Sanctuary `Z.SANCTUARY_CARD` = 27；大卡不得被玻璃叠层写成 18/19。

## 冲突扫描

无用户路径。强度 / 人设 / 职责都不因换名而变。

## 已好清单

- Support 大卡在遮罩之上，Subscribe 点到卡而不是关卡。  
- 玻璃叠层 inline 18/19 仍低于 Support dim 25。  
- 菜单逃生舱 / FAB 可点性不因本刀改变。  
- overlay dim 选择器仍是 Support FAB、mute、倾听耳。

## 验收

1. 夹具：表外 `z-index: 9999` → 扫描红。  
2. 未豁免文件手写 `zIndex: 17` → 扫描红。  
3. 现网 `src/` 已常量化；`index.html` 豁免帽子只减不增。  
4. `npm run check:z-index-literals` 绿；`npm run test:smoke` 绿；`npm run test:payment-contract`（动了共享 z 层）。
