# Task Brief · T46 老虎图整数倍/高清

**状态**：PO 2026-10-21 已在 `GLOSSARY.md`「电脑版十二条对照」对照 2 锁定改善句；本文件为实现规格。  
**类**：B（用户可见：阿寅清晰度/尺寸）

## 目标（不得改口）

保持 PNG 序列。用更高清底图、只按整数倍放大、或限制最大显示尺寸。禁止改成矢量老虎。

## 本 PR 范围（第一刀）

1. **整数倍放大**：舞台比素材大时，`contain` 放大倍率 `floor` 到整数（≥1），避免 1.37× 之类亚像素放大发糊。  
2. **像素采样**：精灵 `<img>` 使用近邻/像素化 `image-rendering`（Safari `-webkit-optimize-contrast`，其它 `pixelated`）。  
3. **布局**：按整数像素宽高居中绘制帧，仍走现有 `displayFit` / Dolly / CapCut 叠化，不改情绪路由。

**不在本 PR**：替换 `@2x` 素材包（可后续单独 PR）；`maxUpscale: 1` 产品开关（代码已留 `containRectCrisp` 选项）。

## 变体矩阵（A10）

本刀只影响 2D 精灵层 `#sprite-overlay`，与宽窄视口、语言、付款无关。  
**合规跳过句**：不触及练习种类、商品/付款、多语言入口变体。

## 点击反馈 + 边缘状态（A14）

无可点击改动。  
**合规跳过句**：本任务不含可点击、付款、练习结束或已购态。

## 冲突扫描

对照 `SCENARIO_TESTS.md`：仅渲染尺度，不改变情绪强度、语气或职责路由 → **无冲突**。

## 验收

- 单元：`spriteCrispRendering.test.js`；`spriteDisplayFit` / `SpriteSequencePlayer` 既有单测仍绿。  
- 人工：大屏 Electron / Safari 看 Idle 与挥手，放大时边缘应比亚像素放大更利落；动画转场与 T38 倾听坐姿无回归。
