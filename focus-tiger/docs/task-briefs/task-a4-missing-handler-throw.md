# Task Brief · A4 开发环境缺 handler 即抛错

> **状态（2026-10-13）**：**PO 已点头 · 开工**（口令「立刻开工 A4」；规格锁在盘点表 `root-cause-audit-2026-10-12.md` §4 A4 / §5 待 A4 行）。  
> **类**：**A**（开发/测试缺处理函数才 `throw`；接线正确时用户路径不变。生产缺函数仍 `console.error`、菜单不关）。  
> **依赖**：A2 查表分派已合 [#1179](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1179)；A3 普查已合 [#1181](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1181)。  
> **不**做 A12（层级常量化 / Z-dim (a)）。#1158 overlay dim 付款守卫已关单，不在本刀。

## 一句话目标

点菜单或 chrome 入口时，若处理函数没接上：**开发与测试必须立刻失败**，不能 `handlers.onX?.()` 静默跳过。生产只打错误日志，并保持菜单不关。

## 范围（in）

- 新增 `invokeHandler` + `resolveHandlerStrictEnv`（`idleChromeOrchestration.js`）。  
- `dispatchSecondaryChromeProxy` 缺主 handler / 缺 prelude 时走 `invokeHandler`。  
- 宽/窄 **点击** 路径上的 `onSound` / `onQuickStart` / `onSanctuaryNav` / `onFiveMoments` 改为 `invokeHandler`。  
- 单测：开发/测试缺 handler 抛错（先红后绿）；生产 `strict:false` 只 `console.error`、不关 chrome。

## 范围（out）

- 生命周期可选回调仍 `?.()`：`onMenuChange` / `onSheetChange` / `onClearStage` / `onSoundHover`；查询谓词 `isHintUnread` / `isGrowthCardOverlayActive`。  
- 不扫全仓其它 UI 的 `this.handlers.onX?.()`（不在盘点表「宽/窄 / 菜单 chrome」行）。  
- 不改 Support / Stripe、overlay dim、z-index 常量化（A12）、A5–A11、A9。

## 点击反馈（0–1 秒）

接线正确：与现网同一结果。接线缺失：开发/测试崩溃可见；生产菜单仍开、不把「关上」当成成功。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。  
不改 `#yin-support-modal` / Support FAB / Stripe CTA。不涉及后台网络。

## 冲突扫描

相邻：A1 可达网、A2 查表、菜单治理。无用户路径强度/语气变化。职责仍是 chrome 接线，不是新入口。

## 已好清单

- 目录行仍走 `SECONDARY_PROXY_DISPATCH`。  
- 锁定/静态行仍 `blocked`、不调 handler。  
- 未知 proxy（sit / breath 委托 DOM）仍 `unknown`。  
- companion 仍可 `close:false` + prelude。

## 验收

1. 单测：缺 `onMembership` 在默认测试环境 `throw`。  
2. 单测：`handlerStrict: false` 时不 throw、不 close。  
3. `npm run test:smoke` 绿。  
4. 不点击 Stripe；不改 overlay dim。
