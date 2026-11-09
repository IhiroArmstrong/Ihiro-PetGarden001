# Local backup storage registry

> **Status**: Step 2–3 wired (2026-09-16) · registry SSOT + CI audit  
> **Companion code**: `src/core/practiceBackup/localBackupStorageRegistry.js` · `practiceBackupSnapshot.js`  
> **Reset whitelist**: `src/core/localStateKeys.js` (**105** keys) · `docs/SHARED_RESOURCES.md` §1 · `npm run audit:shared-resources-reset`  
> **Related**: `practice-aggregate-registry.md` · `DEV_WORKFLOW_QUALITY.md` §6.25

---

## Plain-language purpose

Reverse-enumeration audit (Step 1) showed **61 → 65** reset keys vs **28** export keys — backup gaps were structural, not bad luck.

**Product decisions (2026-09-16)**:

| Topic | Decision |
|---|---|
| `entitlement-cache.v1` | **Do not export** (derived). Import runs `reconcileEntitlementCacheAfterRestore` + `refreshEntitlement`. |
| Focus Circle (6 keys) | **Export** (schema v5) |
| `focus-duration-pref` / `intentions` / `quiet-together` | **Export** (schema v5) |
| Orphan keys | **Added to `localStateKeys.js`** (reset hygiene); not all exported |

---

## Export whitelist (schema v7)

`PRACTICE_BACKUP_SCHEMA_VERSION = 7` · **31** localStorage keys + optional Electron `companionFiles`:

| Group | Keys |
|---|---|
| Practice memory (v1–v2) | journey-log · practice-days · milestone-glow · entitlement-ownership · ritual-completions · mustard-seed-seal · presence-* · reflections · locale · reminder · companion-mode · ambient-pref · session-cues · system-tts-pref · contemplative-archive-seals |
| Growth (v3–v4) | lotus-pond · tip-jar · sanctuary-entitlement · focus-coins |
| Prefs + social (v5) | focus-duration-pref · intentions · quiet-together · focus-circle · focus-circle-witness-responded · focus-circle-passive-share · focus-circle-was-here-mark · focus-circle-identity · focus-circle-identity-hidden |
| Essence (v6) | focus-essence |
| Stable prefs (v7) | stable-prefs |

**Companion fields** (Electron): `yinPersonalMemory`

**Explicitly NOT exported**:

- `companion-l2/turns.jsonl` (`confideTurnsJsonl`) — local debug log only; retention on device via `confideTurnsJsonlRetention.js` (see `confide-turns-jsonl-backup-exclude.md`)

- `focus-tiger.entitlement-cache.v1` — recompute on import (`practiceBackupEntitlementReconcile.js`)
- `focus-tiger.daily-completions.v1` — derive from practice-days (`practiceBackupDailyCompletionReconcile.js`)
- `focus-tiger.practice-backup.v1` — device cloud opt-in token
- `focus-tiger.ritual-recipe.v1` / `focus-tiger.ritual-recipe-analytics-opt-in.v1` — sitting recipe + analytics opt-in (preview-adopt; never practice-backup overwrite)
- `focus-tiger.companion-channel-recent-ids.v1` — four-channel copy recent template ids; not practice memory
- T81/T83 Practice Study keys (reset **+6** vs 2026-11-06 facts 99; **do not export** — see [`audit/findings/2026-11-09/B1-reset-plus6-export-review.md`](audit/findings/2026-11-09/B1-reset-plus6-export-review.md)):
  - `focus-tiger.co-practice-research-week-ledger.v1`
  - `focus-tiger.co-practice-research-consent.v1`
  - `focus-tiger.co-practice-research-last-post.v1`
  - `focus-tiger.co-practice-research-weekly-schedule.v1`
  - `focus-tiger.co-practice-research-first-sit-prompt.v1`
  - `focus-tiger.dev-co-practice-research-consent-fixture.v1` (DEV fixture; never export)

---

## CI

```bash
cd focus-tiger
npm run audit:local-backup-coverage   # registry ↔ snapshot ↔ localStateKeys
npm run docs:check                    # includes audit above
```

---

## Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Step 1 reverse-enumeration draft (61 reset / 19 export) |
| 2026-09-16 | PO decisions: entitlement recompute on import; v5 +9 keys; orphan reset fix; `localBackupStorageRegistry.js` + CI |
| 2026-09-20 | Focus Essence Slice 3: v6 +1 key (`focus-essence.v1`); reset whitelist 66 keys |
| 2026-10-29 | Ritual Recipe keys on reset whitelist; **not** exported (A1a) |
| 2026-11-06 | T87 stable prefs: v7 +1 export key `stable-prefs.v1` |
| 2026-11-09 | Reset whitelist **105** (facts 99 + T81/T83 six research keys). Export stays **31**. Six keys documented as NOT exported. |
