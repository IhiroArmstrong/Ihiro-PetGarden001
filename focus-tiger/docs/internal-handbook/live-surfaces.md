# Internal handbook · live surfaces

Team onboarding only. **Do not paste this file into `product-knowledge-base.md` or the Confide catalog.**
Yin may recite only rows that already passed the knowledge-base review. This list is the scan, not a script.

Source: `src/core/kbLiveEntryRegistry.js`. Refresh: `node scripts/write-internal-handbook.js`.

| id | where | status | path | labels | catalog |
|---|---|---|---|---|---|
| `kb-live-sit` | home-ball | live | Idle bottom primary · Sit with Yin | BTN_FOCUS_START | KB-FUNC-0001 |
| `kb-live-pomodoro` | home-ball | live | Sit with Yin → 25 minutes (voice: Start a pomodoro) | BTN_FOCUS_START | KB-FUNC-0034 |
| `kb-live-rise` | home-ball | live | During sit · Rise (end session) | BTN_FOCUS_STOP | KB-FUNC-0007 |
| `kb-live-breath` | home-ball | live | Idle left orb · Breath practice (not in ⋯ menu) | QUICK_START_ARIA micro_ritual.pick_duration micro_ritual.leave | KB-FUNC-0011 |
| `kb-live-companion` | menu | conditional | ⋯ → Practice → How shall we sit? | COMPANION_MODE_HINT COMPANION_MODE_TITLE | KB-FUNC-0008 |
| `kb-live-ground` | menu | live | ⋯ → Practice → Ground exercise | GROUND_EXERCISE_MENU_LABEL | KB-FUNC-0002 |
| `kb-live-five-moments` | menu | live | ⋯ → Practice → Five Moments | FIVE_MOMENTS_MENU_LABEL | KB-FUNC-0019 |
| `kb-live-honesty` | menu | live | ⋯ → Practice → Honest check-in | HONESTY_IDLE_ENTRY | KB-FUNC-0020 |
| `kb-live-journey-log` | menu | live | ⋯ → Practice → Journey log | JOURNEY_LOG_MENU_LABEL | KB-FUNC-0012 |
| `kb-live-presence-signals` | menu | live | ⋯ → Practice → Presence signals | PRESENCE_SIGNALS_MENU_LABEL | KB-FUNC-0013 |
| `kb-live-yin-coin` | menu | gated-default-on | ⋯ → Practice → Yin Coin | YIN_COIN_MENU_LABEL | KB-FUNC-0018 |
| `kb-live-confide` | menu | gated-default-off | ⋯ → Practice → Confide to Yin (wide ear shortcut) | CONFIDE_MENU_LABEL | KB-FUNC-0005 KB-FUNC-0010 |
| `kb-live-daily-quote` | menu | live | ⋯ → Inspiration → Daily quote | DAILY_ZEN_QUOTE_MENU_LABEL | KB-FUNC-0021 |
| `kb-live-zen-cinema` | menu | live | ⋯ → Inspiration → Zen Cinema | ZEN_CINEMA_MENU_LABEL | KB-FUNC-0022 |
| `kb-live-wallpapers` | menu | live | ⋯ → Inspiration → Wallpapers | WALLPAPER_MENU_LABEL | KB-FUNC-0023 |
| `kb-live-quiet-together` | menu | gated-default-on | ⋯ → Not alone → Quiet together | QUIET_TOGETHER_MENU_LABEL | KB-FUNC-0027 |
| `kb-live-focus-circle` | menu | live | ⋯ → Not alone → Focus circle | FOCUS_CIRCLE_MENU_LABEL | KB-FUNC-0028 |
| `kb-live-reminder` | menu | conditional | ⋯ → Preferences → Reminder | reminder.setting_title | KB-FUNC-0033 |
| `kb-live-language` | menu | conditional | ⋯ → Preferences → Language | LANGUAGE_MENU_LABEL | — |
| `kb-live-today-direction` | menu | live | ⋯ → Preferences → Choose today's direction again | TODAY_DIRECTION_MENU_LABEL | KB-FUNC-0029 |
| `kb-live-sanctuary-nav` | menu | live | ⋯ → Practice → Navigate sanctuary (wide home compass ball shortcut) | SANCTUARY_NAV_MENU_LABEL | KB-FUNC-0030 |
| `kb-live-local-backup` | menu | live | ⋯ → Preferences → Backup & restore | LOCAL_BACKUP_MENU_LABEL | KB-FUNC-0003 KB-FUNC-0015 |
| `kb-live-community` | menu | live | ⋯ → Preferences → Community | COMMUNITY_MENU_LABEL | KB-FUNC-0031 |
| `kb-live-membership` | menu | live | ⋯ → Membership CTA / Premium unlocked | MEMBERSHIP_MENU_CTA MEMBERSHIP_MENU_UNLOCKED | KB-FUNC-0032 |
| `kb-live-hud-progress` | hud | live | Top-left HUD · Today shared sitting | HUD_PROGRESS_SHARED_SITTING | KB-FUNC-0004 |
| `kb-live-ritual-morning` | ritual | entitlement-gated | ⋯ → Rituals → ritual.morning.menu | ritual.morning.menu | KB-FUNC-0024 |
| `kb-live-ritual-emotional-reset` | ritual | entitlement-gated | ⋯ → Rituals → ritual.emotional_reset.menu | ritual.emotional_reset.menu | KB-FUNC-0025 |
| `kb-live-ritual-work-transition` | ritual | entitlement-gated | ⋯ → Rituals → ritual.work_transition.menu | ritual.work_transition.menu | KB-FUNC-0026 |

