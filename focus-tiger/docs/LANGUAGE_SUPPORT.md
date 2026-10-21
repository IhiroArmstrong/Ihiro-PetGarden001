# Language support matrix

> **SSOT for copy.** Knowledge-base shorts and Help Center articles point here; they must not paste this table.  
> Tasks: **T35** (matrix + three phrase roles) · **T37** (static shorts, same docs PR) · **T36** (Confide Japanese not-yet-open runtime — other PR, needs Brief + freeze exception).  
> Checked on `origin/develop` `09f11959` (2026-10-21): Japanese semantic crisis does not run (kana → keep literal route); no Confide language gate; T14 help entry defaults off.

## Three roles of “Hi, Yin” (do not collapse)

| Role | What it is | Ship? |
|---|---|---|
| Always-on wake | Device listens for the name without a button | **No.** T10 first slice left this out. Parking lot. |
| Voice **do** routing | Spoken (or typed) `Hi Yin, please…` + closed command set | **Yes.** No address → not a command, even if the sentence contains `backup`. Safety / FORGET still win without the address. |
| Recommended wording | Help / knowledge-base example | **Yes, as example only.** Typed how-to questions do **not** require it. |

Typed product questions go to Help Center ask cards (T22 / T23). Do not add a typed “say Hi Yin or we ignore you” gate.

## Matrix

| Surface | English | Chinese | Japanese | Why |
|---|---|---|---|---|
| Buttons, settings, timer, check-in | Open | Open | Open | Static copy |
| Help Center **articles** | Open | Open | Open | Already translated |
| Help Center **ask cards** | Open | Not a release blocker | Same | Retrieval is English-shaped. **T37 does not change retrieval.** Parking lot. |
| Confide mood / generate | Release language | Contrast only; not a hard gate today | **T36: not yet open after safety** | Untested generate is a safety hole |
| Confide crisis referral | Must work | Must work | Must work | Language gate must not eat safety |
| Voice do (T10) | Open | Commands not open | Commands not open | English closed set + address |
| Speak-to-type | Open | Not release | Not release | English dictation |

**Open Japanese Confide generate only when:** Japanese eval set exists, native review re-opens CR-04, and sealed safety does not regress.

## Trigger for “not yet open” (T36 · deterministic, no threshold)

1. Safety / crisis / FORGET first (literal, then existing semantic layer). Japanese explicit self-harm still refers.  
2. Then language: treat as non-English when the utterance contains Hiragana or Katakana (`[\u3040-\u30ff]`), same detector as `looksLikeJapaneseConfideText`. Mixed English + kana → not yet open. Latin-only (including `Yin`, `Sit`) → English path.  
3. First open of Confide: one static notice. Later: only on non-English (Japanese) input. Remember dismiss.  
4. Copy: English lead + one fixed Japanese sentence. Never “cannot be used”; say **not yet open**.

## T37 shorts (lock here; apply to catalog / Help Center in this docs PR only as documentation until locale slice is in the same PR)

**Voice do (KB / Help 0039 scope):**  
On Mac, to have Yin do something by voice, say a short English request that starts with Hi, Yin, please… Yin repeats anything that writes a file. You do not need this phrase when typing a how-to question in Help Center.

**Language:**  
Listening and how-to replies are ready in English. Other languages are not yet open for Confide talking. Buttons and written help pages may already be translated. If this feels too heavy to hold alone, reach someone you trust or a local crisis line. Yin is not a substitute for professional help.

**Japanese companion line (static):**  
傾きの会話は、いま英語だけ開いています。日本語はまだ開いていません。

## Parking lot (no new T code)

- Always-on wake  
- Hard-block Chinese Confide  
- Multilingual Help Center **ask** retrieval  

## Ground facts (re-check on `origin/develop` before T36 code)

1. `looksLikeJapaneseConfideText` → semantic crisis **does not run**; literal route kept.  
2. Confide send path has **no** “not yet open” language gate.  
3. `FT_CONFIDE_HELP_ENTRY` defaults **off**.
