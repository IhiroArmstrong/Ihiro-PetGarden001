# Gemma4 six-lang chitchat jc vs unsloth · annotation conclusion

**Run**: `compare-1789637343276` · 2026-09-17 · `reasoning:false` (#802)  
**Annotator**: PO first pass (`multilang-chitchat-annotate-1789637343276-claude-firstpass.csv`)

## Fixture bug (fixed same day)

| id | was | fix |
|---|---|---|
| `de-chitchat-12` | `Du wirfst heute gemütlich aus.` (`werfen` = throw) | `Du wirkst heute gemütlich.` (`wirken` = seem/look; aligns with en `You look cozy today`) |

Both jc and un replied to the literal “throw” sense — **not a model-quality signal**. Exclude from scoring; re-run A/B on corrected fixture before any model-source decision.

## Score (excl. `de-chitchat-12`)

| source | yes | maybe | no |
|---|---:|---:|---:|
| jc-builds Q4_K_M | 95 | 10 | 2 |
| unsloth UD-Q4_K_XL | 95 | 10 | 2 |

**Tie** — does not support “unsloth clearly better at daily chitchat” or “jc more stable”.

## Failure-mode split (qualitative)

| source | typical miss | product note |
|---|---|---|
| jc | grammar/gender/agreement (e.g. `Il pioggia`, `sein Fell` for cat, `Die Spaziergang`, `Sus párpados` person mismatch) | **PO: grammar errors worse** — visible, feels unprofessional |
| un | grammatically fine but off-topic / generic (e.g. es sleepy → whiskers on floor; fr somnolent → paws resting) | subtler; “not listening” over time |

## Decision (2026-09-17)

- **First pass (analyst)**: tie + jc grammar failures judged more harmful → do not switch.
- **PO override (same day)**: unsloth answers five questions more on-topic; no grammar errors in this run; 95% yes — **switch default to unsloth QAT** for live Confide肉测.
- **Rollback**: `FT_COMPANION_L0_MODEL=gemma4-e4b-jc` (alias `jc`) → jc-builds `Gemma-4-E4B-it-Q4_K_M.gguf` still in `companion-l0/`.
- `de-chitchat-12` fixture typo fixed (#818); no full 108 re-run required (1/108 bad row).
- `none-bulk-wipe` write FP: see ISSUE_LEDGER — not blocking source choice.
