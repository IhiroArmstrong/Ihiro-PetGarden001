# Plan A · Live ship release flags (PO checklist)

Before cutting a customer-facing `--dir` / DMG build, confirm **all three** stay off.  
Mechanical checks: `npm run build:verify-no-qa-boot` after `npm run build`; `desktop/scripts/pack.js` exits if QA env is set.

| Flag | What must be true | Where enforced |
|---|---|---|
| **QA boot** | No `FT_QA_BOOT` / `VITE_FT_QA_BOOT` at pack time; dist has no `qaSeed*` / inlined `VITE_FT_QA_BOOT=1` | `desktop/scripts/pack.js` · `scripts/verify-no-qa-boot-in-dist.js` |
| **Practice Study menu + T83 invite** | Production-shaped build hides ⋯ → Practice Study and blocks first-sit invite | `src/core/practiceStudyReleaseGate.js` · `idleChromeOrchestration.js` · `main.js` |
| **Cloud practice backup** | `practiceBackupCloudEnabled === false` — no silent upload/restore | `src/core/practiceBackup/practiceBackupCloudEnabled.js` |

Internal QA may set `FT_PRACTICE_STUDY_MENU=1` or `VITE_FT_PRACTICE_STUDY_MENU=1` for local/vite only; **must not** be set during `desktop/scripts/pack.js`.

Registry code SSOT: `src/core/planALiveShipReleaseGate.js`.
