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
| `kb-live-guided-meditation` | menu | live | ⋯ → Practice → Guided meditation | GUIDED_MEDITATION_MENU_LABEL | KB-EDU-0003 |
| `kb-live-five-moments` | menu | live | ⋯ → Practice → Five Moments | FIVE_MOMENTS_MENU_LABEL | KB-FUNC-0019 |
| `kb-live-honesty` | menu | live | ⋯ → Practice → Honest check-in | HONESTY_IDLE_ENTRY | KB-FUNC-0020 |
| `kb-live-journey-log` | menu | live | ⋯ → Practice → Journey log | JOURNEY_LOG_MENU_LABEL | KB-FUNC-0012 |
| `kb-live-presence-signals` | menu | live | ⋯ → Practice → Presence signals | PRESENCE_SIGNALS_MENU_LABEL | KB-FUNC-0013 |
| `kb-live-yin-coin` | menu | gated-default-on | ⋯ → Practice → Yin Coin | YIN_COIN_MENU_LABEL | KB-FUNC-0018 |
| `kb-live-confide` | menu | conditional | ⋯ → Practice → Confide to Yin (wide ear shortcut) | CONFIDE_MENU_LABEL | KB-FUNC-0005 KB-FUNC-0010 KB-FUNC-0039 |
| `kb-live-daily-quote` | menu | live | ⋯ → Inspiration → Daily quote | DAILY_ZEN_QUOTE_MENU_LABEL | KB-FUNC-0021 |
| `kb-live-contemplative-inquiry` | menu | live | ⋯ → Inspiration → Sit with a question | CI_EX1_MENU_LABEL | KB-FUNC-0040 |
| `kb-live-zen-cinema` | menu | live | ⋯ → Inspiration → Mindful Theater | ZEN_CINEMA_MENU_LABEL | KB-FUNC-0022 |
| `kb-live-mustard-seed-seal` | menu | entitlement-gated | ⋯ → Inspiration → Mustard Seed · Sumeru (after unlock) | MUSTARD_SEED_SEAL_MENU_LABEL | — |
| `kb-live-wallpapers` | menu | live | ⋯ → Inspiration → Wallpapers | WALLPAPER_MENU_LABEL | KB-FUNC-0023 |
| `kb-live-art-collection` | menu | live | ⋯ → Inspiration → Yin's Art Collection | ART_COLLECTION_MENU_LABEL | KB-FUNC-0050 |
| `kb-live-quiet-together` | menu | gated-default-on | ⋯ → Not alone → Quiet together | QUIET_TOGETHER_MENU_LABEL | KB-FUNC-0027 |
| `kb-live-focus-circle` | menu | live | ⋯ → Not alone → Focus circle | FOCUS_CIRCLE_MENU_LABEL | KB-FUNC-0028 |
| `kb-live-reminder` | menu | conditional | ⋯ → Preferences → Reminder | reminder.setting_title | KB-FUNC-0033 |
| `kb-live-work-end` | menu | conditional | ⋯ → Preferences → Wrap-up time | WORK_END_MENU_LABEL | KB-FUNC-0044 |
| `kb-live-language` | menu | conditional | ⋯ → Preferences → Language | LANGUAGE_MENU_LABEL | — |
| `kb-live-sound` | menu | live | ⋯ → Preferences → Sound | SOUND_MENU_LABEL | KB-FUNC-0037 |
| `kb-live-always-on-top` | menu | conditional | ⋯ → Preferences → Keep in front (Electron) | ALWAYS_ON_TOP_MENU_LABEL | KB-FUNC-0045 |
| `kb-live-window-layout` | menu | conditional | ⋯ → Preferences → Window (Electron) | WINDOW_LAYOUT_MENU_LABEL | KB-FUNC-0046 |
| `kb-live-input-rhythm` | menu | conditional | ⋯ → Preferences → Focus rhythm (Electron) | INPUT_RHYTHM_MENU_LABEL | KB-FUNC-0047 |
| `kb-live-mindflow-nebula` | menu | live | ⋯ → Preferences → Mindflow nebula | MINDFLOW_NEBULA_MENU_LABEL | — |
| `kb-live-presence-field` | menu | live | ⋯ → Preferences → Presence Field | PRESENCE_FIELD_MENU_LABEL | KB-FUNC-0041 |
| `kb-live-health-shortcut-log` | menu | live | ⋯ → Preferences → Log to Health (Shortcuts) | HEALTH_SHORTCUT_MENU_LABEL | KB-FUNC-0048 |
| `kb-live-today-direction` | menu | live | ⋯ → Preferences → Choose today's direction again | TODAY_DIRECTION_MENU_LABEL | KB-FUNC-0029 |
| `kb-live-sanctuary-nav` | menu | live | ⋯ → Practice → Navigate sanctuary (wide home compass ball shortcut) | SANCTUARY_NAV_MENU_LABEL | KB-FUNC-0030 |
| `kb-live-newsletter` | menu | live | ⋯ → Preferences → Stay in touch | NEWSLETTER_MENU_LABEL NEWSLETTER_MENU_CONFIRMED | KB-FUNC-0049 |
| `kb-live-account` | menu | conditional | ⋯ → Preferences → Save or restore with email | EMAIL_JOURNEY_MENU_LABEL ACCOUNT_MENU_PLACEHOLDER EMAIL_JOURNEY_MENU_STORE_OFF | — |
| `kb-live-help-center` | menu | live | ⋯ → Preferences → Help Center | HELP_CENTER_MENU_LABEL | KB-EDU-0001 KB-EDU-0002 KB-EDU-0003 KB-EDU-0004 KB-FUNC-0001 KB-FUNC-0002 KB-FUNC-0003 KB-FUNC-0004 KB-FUNC-0005 KB-FUNC-0006 KB-FUNC-0007 KB-FUNC-0008 KB-FUNC-0010 KB-FUNC-0011 KB-FUNC-0012 KB-FUNC-0013 KB-FUNC-0014 KB-FUNC-0015 KB-FUNC-0016 KB-FUNC-0017 KB-FUNC-0018 KB-FUNC-0019 KB-FUNC-0020 KB-FUNC-0021 KB-FUNC-0022 KB-FUNC-0023 KB-FUNC-0024 KB-FUNC-0025 KB-FUNC-0026 KB-FUNC-0027 KB-FUNC-0028 KB-FUNC-0029 KB-FUNC-0030 KB-FUNC-0031 KB-FUNC-0032 KB-FUNC-0033 KB-FUNC-0034 KB-FUNC-0035 KB-FUNC-0036 KB-FUNC-0037 KB-FUNC-0038 KB-FUNC-0039 KB-FUNC-0040 KB-FUNC-0041 |
| `kb-live-local-backup` | menu | live | ⋯ → Preferences → Backup & restore | LOCAL_BACKUP_MENU_LABEL | KB-FUNC-0003 KB-FUNC-0015 |
| `kb-live-practice-study` | menu | live | ⋯ → Preferences → Practice Study | PRACTICE_STUDY_MENU_LABEL | — |
| `kb-live-community` | menu | live | ⋯ → You are not alone → Community | COMMUNITY_MENU_LABEL | KB-FUNC-0031 |
| `kb-live-membership` | menu | live | ⋯ → Preferences → Subscription | MENU_SUBSCRIPTION_ROW RITUAL_MENU_LOCK_A11Y | KB-FUNC-0032 |
| `kb-live-hud-progress` | hud | live | Top-left HUD · Today shared sitting | HUD_PROGRESS_SHARED_SITTING | KB-FUNC-0004 |
| `kb-live-archive-seal-ca-01-old-pond` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-01) | CONTEMPLATIVE_ARCHIVE_CA01_MENU_LABEL | — |
| `kb-live-archive-seal-ca-02-cherry-blossoms` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-02) | CONTEMPLATIVE_ARCHIVE_CA02_MENU_LABEL | — |
| `kb-live-archive-seal-ca-03-morning-field` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-03) | CONTEMPLATIVE_ARCHIVE_CA03_MENU_LABEL | — |
| `kb-live-archive-seal-ca-04-empty-room` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-04) | CONTEMPLATIVE_ARCHIVE_CA04_MENU_LABEL | — |
| `kb-live-archive-seal-ca-05-bird-has-flown` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-05) | CONTEMPLATIVE_ARCHIVE_CA05_MENU_LABEL | — |
| `kb-live-archive-seal-ca-06-spring-water` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-06) | CONTEMPLATIVE_ARCHIVE_CA06_MENU_LABEL | — |
| `kb-live-archive-seal-ca-07-distant-mountain` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-07) | CONTEMPLATIVE_ARCHIVE_CA07_MENU_LABEL | — |
| `kb-live-archive-seal-ca-08-moonlight` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-08) | CONTEMPLATIVE_ARCHIVE_CA08_MENU_LABEL | — |
| `kb-live-archive-seal-ca-09-still-tree` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-09) | CONTEMPLATIVE_ARCHIVE_CA09_MENU_LABEL | — |
| `kb-live-archive-seal-ca-10-sound-after-bell` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-10) | CONTEMPLATIVE_ARCHIVE_CA10_MENU_LABEL | — |
| `kb-live-archive-seal-ca-11-falling-leaf` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-11) | CONTEMPLATIVE_ARCHIVE_CA11_MENU_LABEL | — |
| `kb-live-archive-seal-ca-12-cypress-old-lane` | menu | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-12) | CONTEMPLATIVE_ARCHIVE_CA12_MENU_LABEL | — |
| `kb-live-ritual-morning` | ritual | entitlement-gated | ⋯ → Rituals → ritual.morning.menu | ritual.morning.menu | KB-FUNC-0024 |
| `kb-live-ritual-emotional-reset` | ritual | entitlement-gated | ⋯ → Rituals → ritual.emotional_reset.menu | ritual.emotional_reset.menu | KB-FUNC-0025 |
| `kb-live-ritual-work-transition` | ritual | entitlement-gated | ⋯ → Rituals → ritual.work_transition.menu | ritual.work_transition.menu | KB-FUNC-0026 |

