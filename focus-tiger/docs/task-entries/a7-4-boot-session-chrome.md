---
id: a7-4-boot-session-chrome
kind: feature
status: 本支 chore/a7-4-boot-session-chrome
updated: 2026-10-15
---

A7.4：抽出 `src/boot/boot-session-chrome.js` 状态袋（`SessionUiGate` / Choose-pending 盒 / Arrival 自动开表旗 / chrome sync 绑定）。清掉 A6 豁免 `sessionUiGate` · `postChooseChrome` · `syncArrivalGateReady` · `syncHonestyIdleEntry` · `pendingAutoStartMode` · `arrivalChoseThisRun` · `suppressCompanionOpenAfterNod`。Gate 与 `createSessionChromeSync` 仍在现网同一位置构造。不改付款路径、不改第一幕占用与 Loading 遮罩时机。
