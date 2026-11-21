# Task Brief · 静态壳层级 CSS 变量

> **状态（2026-11-21）**：玻璃卡家族第二刀；PO 书面免点头。  
> **类**：**A**（数字不变；用户看到的叠层顺序不变。若必须改某个数字 → 升 B，停下来改本 Brief）。  
> **依赖**：A12 #1281 已合；`index.html` 曾豁免手写数字。  
> **不做**：不把 `src/ui/*.js` 的 `Z.*` 改成读 CSS；不改 Support 25/26/27 数值；不做引导冥想换肤（#1825）。

## 一句话目标

`index.html` 不再手写 z-index 数字。变量来自与 `zIndexLayers.js` 对账的 `z-index-tokens.css`。

## 范围（in）

- `src/ui/z-index-tokens.css`：`--z-*` 与 `Z` 1:1。  
- `index.html` 六处改 `var(--z-…)`。  
- `check:z-index-tokens` 进 `docs:check`；A12 豁免表删掉 `index.html`。  
- 扫描跳过 tokens 文件本身（数字只许出现在这一份表）。

## 范围（out）

- 不改运行时叠层顺序。  
- 不改 ui-kit `--z-modal` 1000（附录，非产品壳）。  
- 不顺手把 JS `Z.GLASS_CARD` 改成 `getComputedStyle`。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 共用机制核对

- **overlayBusy**：不改 occupancy。  
- **HUD 呼吸**：不改驱动者。  
- **z≥17 遮罩**：不改 dim 行为。Support FAB / Ambient 音符 / 倾听耳仍走现网 idle-chrome dim。`--z-support-dim` = 25、`--z-support-modal` = 26、`--z-sanctuary-card` = 27，与现网常量同值。  
- **新建可点击叠层**：不新增 overlay 行。  
- **受保护路径**：不给 Support 写 inline z。

## 冲突扫描

无用户路径。强度 / 人设 / 职责都不因换名而变。

## 已好清单

- Support 大卡在遮罩之上。  
- 玻璃 18/19 仍低于 Support dim 25。  
- `#ui-overlay` 仍是 10；loading 仍是 100。

## 验收

1. `index.html` 无 `z-index: <数字>`。  
2. tokens 与 `Z` 不一致 → 扫描红。  
3. `npm run check:z-index-literals` 绿（豁免 0 条）。  
4. `npm run test:smoke` 绿；`npm run test:payment-contract`。
