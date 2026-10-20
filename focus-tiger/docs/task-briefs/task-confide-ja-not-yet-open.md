# Task Brief · T36 Confide Japanese not yet open

> **Class:** B (changes user-visible Confide replies and routing).  
> **Status:** queued. **Do not implement** until PO writes T36 into the 10/27 send-chain freeze **safety exception**.  
> **SSOT copy / matrix:** [`LANGUAGE_SUPPORT.md`](../LANGUAGE_SUPPORT.md).  
> **Does not include:** Help Center ask retrieval, always-on wake, Chinese hard-block, T14 crisis-entry calendar.

## 1. Why

Japanese Confide still enters the pipeline. Semantic crisis skips Japanese (kana) and keeps the literal route. Untested paraphrases can reach mood or generate. That is a safety hole, not a polish item. First Confide: Japanese **not yet open**, **after** safety.

## 2. Done line (two regressions only — not a hit-rate gate)

1. Japanese **explicit** self-harm still `safety_redirect` + safety-01 (or current referral copy). Removing the language gate must **not** drop this.  
2. With the language gate removed in a test double / flag, safety still fires; the new notice must not replace referral.

Also lock: kana in the utterance → after safety, static not-yet-open; **no** cosine / margin to tune.

## 3. Order

Safety / aggression / FORGET → (existing) address+command → Japanese not-yet-open → rest of Confide.

## 4. Copy

English lead + fixed Japanese line from `LANGUAGE_SUPPORT.md`. Key: not yet open (not “cannot be used”). Crisis referral unchanged and not spoken if current crisis TTS rules forbid it.

## 5. Out of scope

T35/T37 docs. T10 always-on. T22 retrieval. Changing CR-04 prototypes. T14 default-on.

## 6. Variant matrix (A10)

Touches multilingual Confide **input**, not practice kinds or payment.

| Variant | Expect |
|---|---|
| English only | Unchanged path |
| Kana / Japanese | After safety: not yet open |
| Mixed English + kana | Not yet open |
| Chinese explicit crisis | Existing literal safety (unchanged this slice) |
| Wide Electron Confide | In scope |
| Web / narrow | Same copy if Confide harness is on; no new mount |

Payment / Sit vs Breath: **skip** — this slice does not add products or practice kinds.

## 7. Click feedback + edges (A14)

No new persistent control required. First-open notice is one-shot copy in the existing Confide card.

- 0–1s after Share on Japanese (non-crisis): user sees the static notice (and hears it only if T34/TTS rules already speak non-crisis replies).  
- Crisis Japanese: referral first; do not substitute the language notice.  
- Second Japanese turn after dismiss: notice may show again on language miss; do not toast-spam every keystroke.  
- Overlay / focusing: do not new-layer over Support / menu escape hatch.

If a control is not meant to act: not applicable; this is send-path copy, not a new button.

## 8. Freeze

Agent recommendation: merge **before** 10/27 23:59 as a **safety exception**, so 10/28 T14 internal test does not ship the Japanese generate hole.  
This is **not** automatically the existing “English safety-line trip” exception. **PO must say** T36 is in the exception list.
