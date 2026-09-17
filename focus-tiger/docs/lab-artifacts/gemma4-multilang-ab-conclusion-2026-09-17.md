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

- **Do not switch default GGUF to unsloth** on this A/B alone (tie + jc failure mode judged more harmful).
- **Keep** `l0ModelProfiles.js` default **jc-builds** until post-fix re-run (optional: only `de-chitchat-12` spot-check or full 108).
- `none-bulk-wipe` write FP: see ISSUE_LEDGER — not blocking source choice.
