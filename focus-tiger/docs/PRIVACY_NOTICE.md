# Focus Tiger · Privacy notice (plain language)

> Short user-facing note for **v1.0.0** (local-first). Product promises: `MVP_PRODUCT_DEFINITION.md` §六. In-app: **?** → purpose card → **Privacy**.

## In short

- We **do not sell** your data.
- We **do not** use your focus intentions or reflections for ads or personality scoring.
- **v1.0.0** is built to work **on your device**. Core practice does not require an account or cloud AI.
- **No ads** in the practice space. We aim for a quiet place — no pressure to perform.

## What stays on your device (typical)

- Preferences (e.g. reminder settings, hint “seen” flags, locale preference)
- Optional ambient music **you upload** (MP3/M4A) — stored only in this browser’s IndexedDB; not sent to a server; removable from the Soundscape panel or via full local reset
- Recent session / reflection snippets the product needs to show continuity (kept limited; not mined for psychology)

Exact keys and retention evolve with features; we only keep what the current feature needs.

## Local companion (where available)

Some conversations can stay on your device. Yin can listen locally — those words are not sent to cloud AI.

## What we do **not** do in v1.0.0

- No account login required for the core loop
- No cloud sync of your practice by default
- **Crash / analytics SDK**: still **not** wired by default. Optional **support-funnel counts** may leave the device **only** after you turn on the Privacy-sheet toggle (anonymous counts; no email / reflections / payment IDs).
- We do **not** promise any named cloud vault sync in v1

## Cloud later (v1.1+)

If we add cloud features, we will explain **what** is sent, **why**, **how long**, and ask for consent before it leaves your device.

Planned (not shipped): optional **Yin cloud personalization** is a **fourth** independent consent (off by default; not Memory, not practice backup, not the support-funnel toggle). User-facing retention is **turn off → stop sending → delete the cloud personalization data tied to that choice** (V1 = this install’s YPE profile, not an account-wide wipe). Copy is in `task-briefs/task-l2-personalization-consent.md` until the L2 UI start passphrase. Identity: `task-briefs/task-l2-personalization-identity.md`. Do not describe it as anonymous.

## In-app placement（2026-08-07）

完整隐私说明 **可在产品内打开浏览**（不只躺在 GitHub docs）。

| Entry | Behavior |
|---|---|
| Primary | **?** → `#onboarding-app-purpose` → **Privacy** → `#onboarding-privacy-sheet`（i18n 摘录对齐本页） |
| Wellness (not clinical) | Always-available lookup: **?** purpose card, `.onboarding-app-purpose__wellness` (en + ja). Privacy sheet has a one-line cross-link back to that notice. **Not** auto-shown on cold start (scares users away). QA only: `?wellnessFirst=1` forces `#onboarding-wellness-first`. |
| Credit | Purpose-card footer colophon (Focus Tiger™ / Created by… / ©). Not part of this privacy notice. |
| Secondary | Future About / Tip Jar footer may reuse the same sheet |
| Do not | Settings tree only for privacy; paste the full notice inside the purpose card |

## Questions

Use in-app **?** for the short purpose card; use **Privacy** from that card for this notice. Engineering checklist: `MVP_PRODUCT_DEFINITION.md` §六.
