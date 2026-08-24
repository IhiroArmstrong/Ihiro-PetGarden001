# Focus Tiger desktop (Electron)

Focus Tiger™ is a product of Twinsology.
Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.

Install and run from `focus-tiger/`:

```text
npm --prefix desktop install
npm run desktop:dev
```

If Electron prints `failed to install correctly`, npm 11 blocked its postinstall (`allow-scripts` empty). This folder’s `.npmrc` allows `electron`, `electron-winstaller`, and `node-llama-cpp`. Then:

```text
rm -rf desktop/node_modules/electron desktop/node_modules/node-llama-cpp
npm --prefix desktop install
npm run desktop:dev
```

Packaged Mac DMG / Windows installer notes live in `docs/task-briefs/task-electron-desktop-scaffold.md`.

## On-device companion (L1 panel)

A local model sits behind the **wide Idle ⋯ Confide** row on Electron only (not a second menu). It is **not** in the DMG; the first open downloads about **1.1 GB** (`Qwen3-1.7B-Q4_K_M`) to userData. If you already ran `desktop:companion-spike-17b`, the app may copy that cache instead of re-downloading.

**Memory note (Mac and Windows):** computers with **8 GB of RAM or less** can see heavy memory pressure if that companion loads. Focus Tiger **hides the entry by default** on those machines. We do not recommend turning it on there.

This note is also in the desktop app: tap **?** and open **Support Yin**. Safari / phone browsers do not show it.

## How to test the local model (not Safari)

Safari on the QA tree (`http://127.0.0.1:5173/?product=1`) is the **Web** product. It never loads llama. Use an **Electron window**.

Do not run another Vite on port 5173 at the same time (`desktop:dev` starts its own and waits for that port).

From the develop QA worktree on the Mac:

```text
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm --prefix desktop install
npm run desktop:dev
```

Probe only (no product menu; quits when done):

```text
npm run desktop:companion-l0
```

Skip the probe window: `FT_COMPANION_L0_SKIP_WINDOW=1 npm run desktop:companion-l0`.

Stop Electron when finished (that also stops the Vite it started). For Web QA in Safari, start `npm run dev:qa` again. Full policy: `docs/task-briefs/task-desktop-on-device-companion.md`.
