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
- Internal handbook (`docs/internal-handbook/`) is generated from this list. Do not paste it into the recitable catalog.

---

## Live entry registry (machine block)

<!-- kb-live-entry-registry:begin -->

> **机器块 · 勿手改**。真源：`src/core/kbLiveEntryRegistry.js`。刷新：`npm run audit:kb-live-entries -- --write`。

**Row count**: 56 (51 menu/ritual · 4 home-ball · 1 hud)

| id | surface | proxy | liveStatus | menuPath | labelKeys | catalogKbIds |
|---|---|---|---|---|---|---|
| `kb-live-sit` | home-ball | — | live | Idle bottom primary · Sit with Yin | `BTN_FOCUS_START` | `KB-FUNC-0001` |
| `kb-live-pomodoro` | home-ball | — | live | Sit with Yin → 25 minutes (voice: Start a pomodoro) | `BTN_FOCUS_START` | `KB-FUNC-0034` |
| `kb-live-rise` | home-ball | — | live | During sit · Rise (end session) | `BTN_FOCUS_STOP` | `KB-FUNC-0007` |
| `kb-live-breath` | home-ball | — | live | Idle left orb · Breath practice (not in ⋯ menu) | `QUICK_START_ARIA` `micro_ritual.pick_duration` `micro_ritual.leave` | `KB-FUNC-0011` |
| `kb-live-companion` | menu | `companion` | conditional | ⋯ → Practice → How shall we sit? | `COMPANION_MODE_HINT` `COMPANION_MODE_TITLE` | `KB-FUNC-0008` |
| `kb-live-ground` | menu | `ground-exercise` | live | ⋯ → Practice → Ground exercise | `GROUND_EXERCISE_MENU_LABEL` | `KB-FUNC-0002` |
| `kb-live-guided-meditation` | menu | `guided-meditation` | live | ⋯ → Practice → Guided meditation | `GUIDED_MEDITATION_MENU_LABEL` | `KB-EDU-0003` |
| `kb-live-five-moments` | menu | `five-moments` | live | ⋯ → Practice → Five Moments | `FIVE_MOMENTS_MENU_LABEL` | `KB-FUNC-0019` |
| `kb-live-honesty` | menu | `honesty` | live | ⋯ → Practice → Honest check-in | `HONESTY_IDLE_ENTRY` | `KB-FUNC-0020` |
| `kb-live-journey-log` | menu | `journey-log` | live | ⋯ → Practice → Journey log | `JOURNEY_LOG_MENU_LABEL` | `KB-FUNC-0012` |
| `kb-live-presence-signals` | menu | `presence-signals` | live | ⋯ → Practice → Presence signals | `PRESENCE_SIGNALS_MENU_LABEL` | `KB-FUNC-0013` |
| `kb-live-yin-coin` | menu | `yin-coin` | gated-default-on | ⋯ → Practice → Yin Coin | `YIN_COIN_MENU_LABEL` | `KB-FUNC-0018` |
| `kb-live-confide` | menu | `confide` | gated-default-off | ⋯ → Practice → Confide to Yin (wide ear shortcut) | `CONFIDE_MENU_LABEL` | `KB-FUNC-0005` `KB-FUNC-0010` `KB-FUNC-0039` |
| `kb-live-daily-quote` | menu | `daily-quote` | live | ⋯ → Inspiration → Daily quote | `DAILY_ZEN_QUOTE_MENU_LABEL` | `KB-FUNC-0021` |
| `kb-live-contemplative-inquiry` | menu | `contemplative-inquiry` | live | ⋯ → Inspiration → Sit with a question | `CI_EX1_MENU_LABEL` |  |
| `kb-live-zen-cinema` | menu | `zen-cinema` | live | ⋯ → Inspiration → Mindful Theater | `ZEN_CINEMA_MENU_LABEL` | `KB-FUNC-0022` |
| `kb-live-mustard-seed-seal` | menu | `mustard-seed-seal` | entitlement-gated | ⋯ → Inspiration → Mustard Seed · Sumeru (after unlock) | `MUSTARD_SEED_SEAL_MENU_LABEL` |  |
| `kb-live-wallpapers` | menu | `wallpapers` | live | ⋯ → Inspiration → Wallpapers | `WALLPAPER_MENU_LABEL` | `KB-FUNC-0023` |
| `kb-live-art-collection` | menu | `art-collection` | live | ⋯ → Inspiration → Yin's Art Collection | `ART_COLLECTION_MENU_LABEL` |  |
| `kb-live-quiet-together` | menu | `quiet-together` | gated-default-on | ⋯ → Not alone → Quiet together | `QUIET_TOGETHER_MENU_LABEL` | `KB-FUNC-0027` |
| `kb-live-focus-circle` | menu | `focus-circle` | live | ⋯ → Not alone → Focus circle | `FOCUS_CIRCLE_MENU_LABEL` | `KB-FUNC-0028` |
| `kb-live-reminder` | menu | `reminder` | conditional | ⋯ → Preferences → Reminder | `reminder.setting_title` | `KB-FUNC-0033` |
| `kb-live-work-end` | menu | `work-end` | conditional | ⋯ → Preferences → Wrap-up time | `WORK_END_MENU_LABEL` |  |
| `kb-live-language` | menu | `language` | conditional | ⋯ → Preferences → Language | `LANGUAGE_MENU_LABEL` | — |
| `kb-live-sound` | menu | `sound` | live | ⋯ → Preferences → Sound | `SOUND_MENU_LABEL` | — |
| `kb-live-always-on-top` | menu | `always-on-top` | conditional | ⋯ → Preferences → Keep in front (Electron) | `ALWAYS_ON_TOP_MENU_LABEL` |  |
| `kb-live-window-layout` | menu | `window-layout` | conditional | ⋯ → Preferences → Window (Electron) | `WINDOW_LAYOUT_MENU_LABEL` |  |
| `kb-live-input-rhythm` | menu | `input-rhythm` | conditional | ⋯ → Preferences → Focus rhythm (Electron) | `INPUT_RHYTHM_MENU_LABEL` |  |
| `kb-live-mindflow-nebula` | menu | `mindflow-nebula` | live | ⋯ → Preferences → Mindflow nebula | `MINDFLOW_NEBULA_MENU_LABEL` | — |
| `kb-live-presence-field` | menu | `presence-field` | live | ⋯ → Preferences → Presence Field | `PRESENCE_FIELD_MENU_LABEL` | — |
| `kb-live-health-shortcut-log` | menu | `health-shortcut-log` | live | ⋯ → Preferences → Log to Health (Shortcuts) | `HEALTH_SHORTCUT_MENU_LABEL` | — |
| `kb-live-today-direction` | menu | `today-direction` | live | ⋯ → Preferences → Choose today's direction again | `TODAY_DIRECTION_MENU_LABEL` | `KB-FUNC-0029` |
| `kb-live-sanctuary-nav` | menu | `sanctuary-nav` | live | ⋯ → Practice → Navigate sanctuary (wide home compass ball shortcut) | `SANCTUARY_NAV_MENU_LABEL` | `KB-FUNC-0030` |
| `kb-live-newsletter` | menu | `newsletter` | live | ⋯ → Preferences → Stay in touch | `NEWSLETTER_MENU_LABEL` `NEWSLETTER_MENU_CONFIRMED` |  |
| `kb-live-account` | menu | `account` | conditional | ⋯ → Preferences → Save or restore with email | `EMAIL_JOURNEY_MENU_LABEL` `ACCOUNT_MENU_PLACEHOLDER` `EMAIL_JOURNEY_MENU_STORE_OFF` |  |
| `kb-live-help-center` | menu | `help-center` | live | ⋯ → Preferences → Help Center | `HELP_CENTER_MENU_LABEL` | `KB-EDU-0001` `KB-EDU-0002` `KB-EDU-0003` `KB-EDU-0004` `KB-FUNC-0001` `KB-FUNC-0002` `KB-FUNC-0003` `KB-FUNC-0004` `KB-FUNC-0005` `KB-FUNC-0006` `KB-FUNC-0007` `KB-FUNC-0008` `KB-FUNC-0010` `KB-FUNC-0011` `KB-FUNC-0012` `KB-FUNC-0013` `KB-FUNC-0014` `KB-FUNC-0015` `KB-FUNC-0016` `KB-FUNC-0017` `KB-FUNC-0018` `KB-FUNC-0019` `KB-FUNC-0020` `KB-FUNC-0021` `KB-FUNC-0022` `KB-FUNC-0023` `KB-FUNC-0024` `KB-FUNC-0025` `KB-FUNC-0026` `KB-FUNC-0027` `KB-FUNC-0028` `KB-FUNC-0029` `KB-FUNC-0030` `KB-FUNC-0031` `KB-FUNC-0032` `KB-FUNC-0033` `KB-FUNC-0034` `KB-FUNC-0035` `KB-FUNC-0036` `KB-FUNC-0037` `KB-FUNC-0038` `KB-FUNC-0039` |
| `kb-live-local-backup` | menu | `local-backup` | live | ⋯ → Preferences → Backup & restore | `LOCAL_BACKUP_MENU_LABEL` | `KB-FUNC-0003` `KB-FUNC-0015` |
| `kb-live-practice-study` | menu | `practice-study` | live | ⋯ → Preferences → Practice Study | `PRACTICE_STUDY_MENU_LABEL` |  |
| `kb-live-community` | menu | `community` | live | ⋯ → You are not alone → Community | `COMMUNITY_MENU_LABEL` | `KB-FUNC-0031` |
| `kb-live-membership` | menu | `membership` | live | ⋯ → Preferences → Subscription | `MENU_SUBSCRIPTION_ROW` `RITUAL_MENU_LOCK_A11Y` | `KB-FUNC-0032` |
| `kb-live-hud-progress` | hud | — | live | Top-left HUD · Today shared sitting | `HUD_PROGRESS_SHARED_SITTING` | `KB-FUNC-0004` |
| `kb-live-archive-seal-ca-01-old-pond` | menu | `contemplative-archive-seal:ca-01-old-pond` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-01) | `CONTEMPLATIVE_ARCHIVE_CA01_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-02-cherry-blossoms` | menu | `contemplative-archive-seal:ca-02-cherry-blossoms` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-02) | `CONTEMPLATIVE_ARCHIVE_CA02_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-03-morning-field` | menu | `contemplative-archive-seal:ca-03-morning-field` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-03) | `CONTEMPLATIVE_ARCHIVE_CA03_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-04-empty-room` | menu | `contemplative-archive-seal:ca-04-empty-room` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-04) | `CONTEMPLATIVE_ARCHIVE_CA04_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-05-bird-has-flown` | menu | `contemplative-archive-seal:ca-05-bird-has-flown` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-05) | `CONTEMPLATIVE_ARCHIVE_CA05_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-06-spring-water` | menu | `contemplative-archive-seal:ca-06-spring-water` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-06) | `CONTEMPLATIVE_ARCHIVE_CA06_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-07-distant-mountain` | menu | `contemplative-archive-seal:ca-07-distant-mountain` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-07) | `CONTEMPLATIVE_ARCHIVE_CA07_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-08-moonlight` | menu | `contemplative-archive-seal:ca-08-moonlight` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-08) | `CONTEMPLATIVE_ARCHIVE_CA08_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-09-still-tree` | menu | `contemplative-archive-seal:ca-09-still-tree` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-09) | `CONTEMPLATIVE_ARCHIVE_CA09_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-10-sound-after-bell` | menu | `contemplative-archive-seal:ca-10-sound-after-bell` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-10) | `CONTEMPLATIVE_ARCHIVE_CA10_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-11-falling-leaf` | menu | `contemplative-archive-seal:ca-11-falling-leaf` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-11) | `CONTEMPLATIVE_ARCHIVE_CA11_MENU_LABEL` |  |
| `kb-live-archive-seal-ca-12-cypress-old-lane` | menu | `contemplative-archive-seal:ca-12-cypress-old-lane` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-12) | `CONTEMPLATIVE_ARCHIVE_CA12_MENU_LABEL` |  |
| `kb-live-ritual-morning` | ritual | `ritual-morning` | entitlement-gated | ⋯ → Rituals → ritual.morning.menu | `ritual.morning.menu` | `KB-FUNC-0024` |
| `kb-live-ritual-emotional-reset` | ritual | `ritual-emotional-reset` | entitlement-gated | ⋯ → Rituals → ritual.emotional_reset.menu | `ritual.emotional_reset.menu` | `KB-FUNC-0025` |
| `kb-live-ritual-work-transition` | ritual | `ritual-work-transition` | entitlement-gated | ⋯ → Rituals → ritual.work_transition.menu | `ritual.work_transition.menu` | `KB-FUNC-0026` |

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
| 2 | Compare list vs existing `KB-FUNC-*` passed rows → gap candidates | **已合 develop** (#931) · `catalogKbIds` drift cleared |
| 3 | Expand retrieval keywords on passed rows (fact unchanged) | **本旁支** |
| 4 | Authoritative-source draft → machine verify → PO tone spot-check → catalog | **0019–0032 已入库**（闸门 **34**）· batch-2 存活面候选清零 |
| 手册 | `docs/internal-handbook/` | **雏形已开**（2026-10-01）· 只从本清单生成 |