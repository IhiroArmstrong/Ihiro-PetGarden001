# Focus Tiger desktop (Electron)

Focus Tiger™ is a product of Twinsology.
Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.

Install and run from `focus-tiger/`:

```text
npm --prefix desktop install
npm run desktop:dev
```

Packaged Mac DMG / Windows installer notes live in `docs/task-briefs/task-electron-desktop-scaffold.md`.

## On-device companion (not a product entry yet)

A small local model may later sit behind the wide Idle ⋯ menu on Electron only. It is **not** in the DMG; the first use would download about 0.5 GB to userData.

**Memory note (Mac and Windows):** computers with **8 GB of RAM or less** can see heavy memory pressure if that companion loads. Focus Tiger **hides the entry by default** on those machines. We do not recommend turning it on there.

This note is also in the desktop app: tap **?** and open **Support Yin**. Safari / phone browsers do not show it.
