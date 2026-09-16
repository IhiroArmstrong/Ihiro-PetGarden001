# Task Brief · Overlay UI surface (O-04)

日期：2026-09-16  
范围：文档 + `docs:check` 扫描 + 提醒遮挡 e2e。**不**做 z-index 常量化全表扫描（Z-dim，暂缓）。

## 共用机制核对

- overlayBusy：不新增 source；只要求新 UI 必须在 `OVERLAY_UI_SURFACE` 声明 `request` 或 `derive`。
- HUD 呼吸：不触及。
- z≥17 遮罩：不新增 dim。O-04 body 挂载声明须达到 `Z_INDEX.md` onboarding hint 行，非常量化重构。
- 新建可点击叠层：本 Brief 落地 O-04 七列 SSOT（`overlayUiSurfaceContract.js`）。结论：存量行允许 `grandfather:true` gap；**新 occupancy 行禁止 gap**。

## 验收

1. `npm run docs:check` 绿。  
2. `overlayUiSurfaceContract.test.js` 绿。  
3. 提醒 e2e 由 CI / 单 spec 跑 `e2e/in-app-reminder.spec.js`。  
4. 留痕迹遮挡共存仍须人工（TRACKER 已写覆盖范围）。
