# Local backup storage registry

> **Status**: Step 2–3 wired (2026-09-16) · registry SSOT + CI audit  
> **Companion code**: `src/core/practiceBackup/localBackupStorageRegistry.js` · `practiceBackupSnapshot.js`  
> **Reset whitelist**: `src/core/localStateKeys.js` (65 keys) · `docs/SHARED_RESOURCES.md` §1  
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

## Export whitelist (schema v5)

`PRACTICE_BACKUP_SCHEMA_VERSION = 5` · **28** localStorage keys + optional Electron `companionFiles`:

| Group | Keys |
|---|---|
| Practice memory (v1–v2) | journey-log · practice-days · milestone-glow · entitlement-ownership · ritual-completions · mustard-seed-seal · presence-* · reflections · locale · reminder · companion-mode · ambient-pref · session-cues · contemplative-archive-seals |
| Growth (v3–v4) | lotus-pond · tip-jar · sanctuary-entitlement · focus-coins |
| Prefs + social (v5) | focus-duration-pref · intentions · quiet-together · focus-circle · focus-circle-witness-responded · focus-circle-passive-share · focus-circle-was-here-mark · focus-circle-identity · focus-circle-identity-hidden |

**Companion fields** (Electron): `yinPersonalMemory`

**Explicitly NOT exported**:

- `companion-l2/turns.jsonl` (`confideTurnsJsonl`) — local debug log only; retention on device via `confideTurnsJsonlRetention.js` (see `confide-turns-jsonl-backup-exclude.md`)

- `focus-tiger.entitlement-cache.v1` — recompute on import (`practiceBackupEntitlementReconcile.js`)
- `focus-tiger.daily-completions.v1` — derive from practice-days (`practiceBackupDailyCompletionReconcile.js`)
- `focus-tiger.practice-backup.v1` — device cloud opt-in token

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
