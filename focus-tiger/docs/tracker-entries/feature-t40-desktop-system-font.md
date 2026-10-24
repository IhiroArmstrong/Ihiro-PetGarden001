# feature/t40-desktop-system-font

| 电脑版系统字体（T40） | UI可见 | 待人工测试 | **Electron** `npm run desktop:dev` 宽屏 `?product=1`：⋯ / Language / Support / HUD 无衬线为系统字体（非 Nunito 圆体感）。**Web** `:5173` 同路径仍为 Nunito；`html` 无 `ft-desktop-shell`。衬线金句卡不变。**自动化**：`desktopSystemTypography.test.js` + `test:smoke`。 | 2026-10-24 PO：B 波第一刀 T40，Brief 免点头 | post-v1 | `feature/t40-desktop-system-font` | `desktop:dev` · Safari 对照 | 2026-10-24 |
