# KB live entry registry — static delineation (Step 1)

> **Status**: Step 1 wired (2026-09-22) · registry SSOT + CI audit  
> **Companion code**: `src/core/kbLiveEntryRegistry.js` · `scripts/audit-kb-live-entries.js`  
> **Brief**: `docs/task-briefs/task-kb-scaled-production.md` · **无运行时** · 不改 catalog

---

## Plain-language purpose

This table answers: **which product surfaces are live in code right now**, which locale keys label them, and which feature gates can hide them. It is the foundation for KB scaled production — Epic / Test Tracker / PR text may suggest topics, but **only rows here (with authoritative locale / rule sources) may draft catalog entries**.

**Hard rules (PO 2026-09-22)**:

- Operational numbers (daily caps, point values) **must not** appear in recitable short answers.
- When retesting whether a KB entry hits, confirm the test build already contains that catalog commit — do not blame the algorithm for a stale directory.
- Internal handbook (`docs/internal-handbook/`) waits until this list exists; do not run both in parallel.

---

## Live entry registry (machine block)

<!-- kb-live-entry-registry:begin -->

> **机器块 · 勿手改**。真源：`src/core/kbLiveEntryRegistry.js`。刷新：`npm run audit:kb-live-entries -- --write`。

**Row count**: 25 (21 menu/ritual · 3 home-ball · 1 hud)

| id | surface | proxy | liveStatus | menuPath | labelKeys | catalogKbIds |
|---|---|---|---|---|---|---|
| `kb-live-sit` | home-ball | — | live | Idle bottom primary · Sit with Yin | `BTN_FOCUS_START` | `KB-FUNC-0001` |
| `kb-live-rise` | home-ball | — | live | During sit · Rise (end session) | `BTN_FOCUS_STOP` | `KB-FUNC-0007` |
| `kb-live-breath` | home-ball | — | live | Idle left orb · Breath practice (not in ⋯ menu) | `QUICK_START_ARIA` `micro_ritual.pick_duration` `micro_ritual.leave` | `KB-FUNC-0006` |
| `kb-live-companion` | menu | `companion` | conditional | ⋯ → Practice → How shall we sit? | `COMPANION_MODE_HINT` `COMPANION_MODE_TITLE` | `KB-FUNC-0004` |
| `kb-live-ground` | menu | `ground-exercise` | live | ⋯ → Practice → Ground exercise | `GROUND_EXERCISE_MENU_LABEL` | `KB-FUNC-0002` |
| `kb-live-five-moments` | menu | `five-moments` | live | ⋯ → Practice → Five Moments | `FIVE_MOMENTS_MENU_LABEL` | — |
| `kb-live-honesty` | menu | `honesty` | live | ⋯ → Practice → Honest check-in | `HONESTY_IDLE_ENTRY` | — |
| `kb-live-journey-log` | menu | `journey-log` | live | ⋯ → Practice → Journey log | `JOURNEY_LOG_MENU_LABEL` | `KB-FUNC-0009` |
| `kb-live-presence-signals` | menu | `presence-signals` | live | ⋯ → Practice → Presence signals | `PRESENCE_SIGNALS_MENU_LABEL` | — |
| `kb-live-yin-coin` | menu | `yin-coin` | gated-default-on | ⋯ → Practice → Yin Coin | `YIN_COIN_MENU_LABEL` | `KB-FUNC-0018` |
| `kb-live-confide` | menu | `confide` | gated-default-off | ⋯ → Practice → Confide to Yin (wide ear shortcut) | `CONFIDE_MENU_LABEL` | `KB-FUNC-0005` |
| `kb-live-daily-quote` | menu | `daily-quote` | live | ⋯ → Inspiration → Daily quote | `DAILY_ZEN_QUOTE_MENU_LABEL` | — |
| `kb-live-zen-cinema` | menu | `zen-cinema` | live | ⋯ → Inspiration → Zen Cinema | `ZEN_CINEMA_MENU_LABEL` | — |
| `kb-live-wallpapers` | menu | `wallpapers` | live | ⋯ → Inspiration → Wallpapers | `WALLPAPER_MENU_LABEL` | — |
| `kb-live-quiet-together` | menu | `quiet-together` | gated-default-on | ⋯ → Not alone → Quiet together | `QUIET_TOGETHER_MENU_LABEL` | — |
| `kb-live-focus-circle` | menu | `focus-circle` | live | ⋯ → Not alone → Focus circle | `FOCUS_CIRCLE_MENU_LABEL` | — |
| `kb-live-reminder` | menu | `reminder` | conditional | ⋯ → Preferences → Reminder | `reminder.setting_title` | — |
| `kb-live-language` | menu | `language` | conditional | ⋯ → Preferences → Language | `LANGUAGE_MENU_LABEL` | — |
| `kb-live-local-backup` | menu | `local-backup` | live | ⋯ → Preferences → Backup & restore | `LOCAL_BACKUP_MENU_LABEL` | `KB-FUNC-0003` `KB-FUNC-0015` |
| `kb-live-community` | menu | `community` | live | ⋯ → Preferences → Community | `COMMUNITY_MENU_LABEL` | — |
| `kb-live-membership` | menu | `membership` | live | ⋯ → Membership CTA / Premium unlocked | `MEMBERSHIP_MENU_CTA` `MEMBERSHIP_MENU_UNLOCKED` | — |
| `kb-live-hud-progress` | hud | — | live | Top-left HUD · Today shared sitting | `HUD_PROGRESS_SHARED_SITTING` | — |
| `kb-live-ritual-morning` | ritual | `ritual-morning` | entitlement-gated | ⋯ → Rituals → ritual.morning.menu | `ritual.morning.menu` | — |
| `kb-live-ritual-emotional-reset` | ritual | `ritual-emotional-reset` | entitlement-gated | ⋯ → Rituals → ritual.emotional_reset.menu | `ritual.emotional_reset.menu` | — |
| `kb-live-ritual-work-transition` | ritual | `ritual-work-transition` | entitlement-gated | ⋯ → Rituals → ritual.work_transition.menu | `ritual.work_transition.menu` | — |

<!-- kb-live-entry-registry:end -->

---

## How to refresh

```bash
cd focus-tiger && npm run audit:kb-live-entries -- --write
```

CI / smoke: `npm run audit:kb-live-entries` (no write) is part of `npm run docs:check`.

---

## Next steps (not this PR)

| Step | Content | Status |
|---|---|---|
| 2 | Compare list vs existing `KB-FUNC-*` passed rows → gap candidates | **本旁支** · `audit:kb-live-gap` · `kb-live-gap-audit.md` |
| 3 | Expand retrieval keywords on passed rows (fact unchanged) | 待口令 |
| 4 | Authoritative-source draft → machine verify → PO tone spot-check → catalog | B 类 · 待口令 |
| 手册 | `docs/internal-handbook/` | 等本清单稳定后再开 |
