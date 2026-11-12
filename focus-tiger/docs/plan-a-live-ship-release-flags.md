# Plan A · Live ship release flags (PO checklist)

Before cutting a customer-facing `--dir` / DMG build, confirm **all three** stay off.  
Mechanical checks: `npm run build:verify-no-qa-boot` and `npm run build:verify-cloud-gate -- --require-dist` after `npm run build`; `desktop/scripts/pack.js` exits if QA env is set or the cloud gate default is on.

| Flag | What must be true | Where enforced |
|---|---|---|
| **QA boot** | No `FT_QA_BOOT` / `VITE_FT_QA_BOOT` at pack time; dist has no `qaSeed*` / inlined `VITE_FT_QA_BOOT=1` | `desktop/scripts/pack.js` · `scripts/verify-no-qa-boot-in-dist.js` |
| **Practice Study menu + T83 invite** | Production-shaped build hides ⋯ → Practice Study and blocks first-sit invite | `src/core/practiceStudyReleaseGate.js` · `idleChromeOrchestration.js` · `main.js` |
| **Cloud practice backup** | `practiceBackupCloudEnabled === false` — no silent upload/restore, no Preferences email row | `src/core/practiceBackup/practiceBackupCloudEnabled.js` · `scripts/verify-first-pack-cloud-gate.js` |

Internal QA may set `FT_PRACTICE_STUDY_MENU=1` or `VITE_FT_PRACTICE_STUDY_MENU=1` for local/vite only; **must not** be set during `desktop/scripts/pack.js`.

Opening the email cloud gate is a later public release, not the invite package.
