# Task Brief · 玻璃卡工厂收口（引导冥想 + 扫描）

> **状态（2026-11-21）**：口令「立刻开工」下一家族（玻璃卡/层级不再手写）第一刀；PO 书面免点头。  
> **类**：**B**（引导冥想卡根改走共享暖米玻璃；内层不再叠一层近不透明奶油底）。数字 z 不变。  
> **依赖**：A11.1 #1276、A12 #1281、A13 #1285、#1816 标题拖拽已合。  
> **不做**：全仓把其余豁免卡一次性换肤；CSS `--z-*` 变量化（下一刀）；不改 Stripe / Support CTA。

## 一句话目标

叠层登记过的浮动卡必须走 `createGlassCard()`。本刀先收引导冥想（今晚手测「不是 sanctuary 玻璃 / 顶被裁」），并让扫描拦住「再新手写一张卡根」。

## 范围（in）

- `GuidedMeditationUI` 卡根 `createGlassCard({ strong, deck: true })`；去掉内层 `__panel` 第二层玻璃；课次钮用 `GLASS_FILL_STRONG`；标题可拖；卡根限高可滚。  
- `check-glass-card-factory.js` 进 `docs:check`；豁免只减不增。`#yin-support-modal` 仍 keep-stylesheet-z，不进工厂。  
- Brief / task / tracker / issue 碎片。

## 范围（out）

- 不改 Support 26 / dim 25 / Sanctuary 27。  
- 不改 overlay dim 选择器、菜单逃生舱、付款 CTA。  
- 不把 26 张豁免卡一并换工厂。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

⋯ → Practice → Guided meditation：0–1 秒内见一张暖米玻璃卡（标题在卡内、可滚、课次行仍可点）。关卡再开同一张。点课次 / 结束 / 关闭的结果反馈不改。

## 边缘状态

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 共用机制核对

- **overlayBusy**：不改 occupancy / 第一幕 busy 门闩。开卡仍走现网 busy。  
- **HUD 呼吸**：不改 `overlayBreathing` 驱动者。  
- **z≥17 遮罩**：不改 dim。Support FAB / Ambient 音符 / 倾听耳仍走现网 idle-chrome dim。卡层仍 `Z.GLASS_CARD` = 18，低于 Support dim 25。  
- **新建可点击叠层**：不新增 `OVERLAY_UI_SURFACE` 行。  
- **受保护路径**：工厂不得作用于「所有居中卡片」；Support 不打 `data-ft-glass-card`、不进 18/19。

## 冲突扫描

相邻：场景 T88 引导课、玻璃叠层最多两张、Support 三卡。强度不变（仍是菜单里的一课）。人设不变。职责仍是「卡根必须是暖米玻璃」，不是新入口。无冲突疑点。

## 已好清单

- Support 大卡仍在遮罩之上，Subscribe 点到卡。  
- 玻璃叠层 inline 18/19 仍低于 Support dim 25。  
- 引导课仍是独立墙钟练习，不进 `FocusSession`。  
- #1816 标题拖拽契约仍在（本刀给引导课标题补 `data-ft-glass-drag-chrome`）。

## 验收

1. `GuidedMeditationUI.js` 含 `createGlassCard`；无 `0.92` 奶油底。  
2. 未豁免叠层 id 不走工厂 → `check:glass-card-factory` 红。  
3. 现网豁免卡仍绿；引导冥想不在豁免表。  
4. `npm run test:smoke` 绿；动了共享玻璃层 → `npm run test:payment-contract`。
