---
id: a7-5-boot-ambient-hints
kind: feature
status: 本支 chore/a7-5-boot-ambient-hints
updated: 2026-10-15
---

A7.5：抽出 `src/boot/boot-ambient-hints.js` 状态袋（环境声 / session cues / `OnboardingHintsUI` / pending Choose）。清掉 A6 豁免 `ambientSoundscape` · `sessionCues` · `onboardingHints` · `pendingChoose`。`onboardingHintHost` 仍给 overlayBusy 早读。控制器与 Hints UI 仍在现网同一位置构造。不改付款路径、不改第一幕占用与 Loading 遮罩时机。
