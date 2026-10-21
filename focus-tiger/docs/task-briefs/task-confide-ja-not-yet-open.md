# Task Brief · T36 Confide Japanese not yet open

> **Class:** B (changes user-visible Confide replies and routing).  
> **Status:** PO locked freeze exception 2026-10-21. Implementing.  
> **SSOT copy:** English lead + fixed Japanese companion line in locale slice `confide-ja-not-yet-open`.  
> **Does not include:** Help Center ask retrieval, always-on wake, Chinese hard-block, T14 crisis-entry calendar, extra language detectors.

## 1. Why

Japanese Confide still enters the pipeline. Semantic crisis skips Japanese (kana) and keeps the literal route. Untested paraphrases can reach mood or generate. That is a safety hole, not a polish item. First Confide: Japanese **not yet open**, **after** safety.

## 2. Done line (two regressions only — not a hit-rate gate)

1. Japanese **explicit** self-harm still `safety_redirect` + safety-01 (or current referral copy). Removing the language gate must **not** drop this.  
2. With the language gate removed in a test double / flag, safety still fires; the new notice must not replace referral.

Also lock: kana in the utterance → after safety, static not-yet-open; **no** cosine / margin to tune.

## 3. Order

Safety / aggression / FORGET → (existing) address+command → Japanese not-yet-open → rest of Confide.

## 4. Copy

English lead + fixed Japanese line. Key: not yet open (not “cannot be used”). Crisis referral unchanged; T34 speaks on-screen crisis copy when a body is shown.

## 5. Out of scope

T35/T37 docs except freeze wording. T10 always-on. T22 retrieval. Changing CR-04 prototypes. T14 default-on. Extra detectors for kanji-only Japanese.

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

No new persistent control required. Notice is send-path copy in the existing Confide card.

- 0–1s after Share on Japanese (non-crisis): user sees the static notice (and hears it when T34 rules speak the on-screen body).  
- Crisis Japanese: referral first; do not substitute the language notice.  
- Later Japanese turns: same notice on language miss; do not toast-spam every keystroke.  
- Overlay / focusing: do not new-layer over Support / menu escape hatch.

Known boundary (not a follow-up in this PR): kanji-only Japanese may miss; kana may catch mixed Chinese+kana. Do not add another detector here.

## 8. Freeze

PO 2026-10-21: T36 **is** the send-chain freeze safety exception. Merge **before** 10/27 23:59. If it misses that clock, **do not** enter the freeze window; do it after freeze. Do not widen the exception.
