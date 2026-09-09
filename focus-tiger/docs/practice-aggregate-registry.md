# Practice aggregate registry — cumulative trigger coverage audit

> **Status**: Reconnaissance (2026-09-07) · **not merged into runtime yet**  
> **Companion code**: `src/core/practiceAggregate.js` (read-only skeleton)  
> **Related**: `TODAY_PRACTICE_SEMANTICS_AUDIT.md` (today / write hooks) · `SHARED_RESOURCES.md` §1 (store semantics)

---

## Plain-language purpose

This table is the **single checklist** for every feature that unlocks or reports progress from **accumulated practice time or day count**. Each row records which ledger it reads today, what it should read after the aggregate layer lands, and whether gaps are bugs (P0/P1) or intentional product splits.

**Write side is already centralized** (`main.js` `onPracticeDay` + `completeMicroRitual`). **Read side is fragmented** across three ledgers:

| Ledger | Key | What it holds | Good for |
|---|---|---|---|
| **Lotus pond** | `focus-tiger.lotus-pond.v1` | Lifetime minutes (monotonic) | Lifetime minutes, bloom thresholds, redeem gates |
| **Practice days** | `focus-tiger.practice-days.v1` | Up to **90** rolling days `{ date, totalMinutes }` | Streak, heatmap, day count (within window) |
| **Journey log** | `focus-tiger.journey-log.v1` | Per-session rows (Sit / Breath after Reflection) | Narrative trace; **not** a full practice ledger |

**Target SSOT for cumulative unlocks** → `resolvePracticeAggregate()` in `practiceAggregate.js`:
- `lifetimeMinutes` ← lotus pond  
- `practiceDayCount` ← practice-days entry count (document 90-day window)  
- `score` ← `practiceDayCount + floor(lifetimeMinutes / 60)` (badges / memorial seals)  
- `todayMinutes` / `todayCompleted` ← daily-completions (orthogonal but exported for convenience)

---

## Baseline: practice source catalog

Sources that **should** feed cumulative practice metrics (via the shared write hook):

| Source ID | User-facing name | Writes practice ledgers? | Notes |
|---|---|:---:|---|
| `sit-timed` | Sit with Yin (timed, target reached) | ✅ | Also Journey after Reflection |
| `honesty-checkin` | Honest check-in | ✅ | **No** Journey row (product Brief) |
| `breath-micro-ritual` | Breath practice / micro-ritual | ✅ | Journey after Reflection |

**Intentionally excluded** (registry only — **not** bugs; no product change in this initiative):

| Source ID | User-facing name | Why excluded |
|---|---|---|
| `arrival-practice` | Arrival (Notice / Choose) | Atmosphere / intention, not “同坐” |
| `ritual-flow` | Advanced RitualFlow (Morning, etc.) | Separate ritual history; not shared sitting |
| `sit-rise-early` | Rise before target | May get Journey row; **not** a practice day |

**Intentionally separate sub-semantics** (out of scope for aggregate migration):

| Concern | Authority | Not the same as cumulative practice |
|---|---|---|
| Celebrating dance | `hasCelebratedToday()` | Feedback tier; timed first target only |
| Contextual tea tip | `contextualTeaTipGate` | Timed complete / milestone only |
| DORMANT 2h window | `FocusSessionEndStore` | Focus session **end**, not practice minutes |
| Retention `first_session_complete` | `RetentionFunnelStore` | Analytics; Sit ∪ Honesty first only |

---

## Consumer registry

Legend: **Gap** = baseline practice sources not reflected in current read path.  
**Migration** = planned `resolvePracticeAggregate` field(s).

### P0 — User feels practice “did not count”

| ID | Feature | Trigger | Current read path | Migration target | Gap (vs baseline) | Fix batch |
|---|---|---|---|---|---|---|
| `confide-practice-facts-duration` | Confide · “how long / total sitting time” | `practice_facts` route | `summarizePracticeFacts` → **Journey first**, then practice-days fallback | `aggregate.lifetimeMinutes` + `aggregate.practiceDayCount`; Journey only for “Sit trace” sub-mode | **Honesty** ignored whenever Journey has ≥1 row; Breath+Honesty mix under-reported | **1** |
| `confide-practice-facts-compare` | Confide · compare windows / usual time / showing up | Same module | `summarizePracticeCompareWindows` / `tallyPracticeHourBuckets` → **Journey only** when entries exist | Aggregate-backed windows; hour buckets from practice-days timestamps or unified events | Honesty + any Journey-prioritization skew | **1** |
| `tip-kindness-badges` | Idle practice / Tea kindness badges | `score` threshold | `summarizePracticeDaysForBadges(readPracticeDaysForTipBadges)` — sums **90-day** minutes as `lifetimeMinutes` | `aggregate.score` | Long-term users: minutes cap at 90-day window; **diverges from lotus** | **2** |
| `sanctuary-badges` | Sanctuary prestigious badges | Same formula | `summarizePracticeDaysForSanctuaryBadges` | `aggregate.score` | Same as tip badges | **2** |
| `mustard-seed-seal-score` | Mustard Seed · Sumeru unlock score | `score ≥ 21` | `resolveMustardSeedSeal` → practice-days badge summary | `aggregate.score` | Same 90-day / false “lifetime” issue | **2** |

### P1 — Correct ledger but wrong ceremony / consistency

| ID | Feature | Trigger | Current read path | Migration target | Gap | Fix batch |
|---|---|---|---|---|---|---|
| `mustard-seed-seal-ceremony` | Auto card after completion | Any baseline ceremony end | `maybeOfferGrowthSealAfterBaselineCeremony` in timed Sit, Honesty, Breath | Offer when `aggregate.score` crosses + any **baseline** completion ceremony | ✅ Batch 3 — Honesty + Breath wired | **3** |
| `focus-coins-redeem` | Yin coin shop redeem gates | SKU `minLifetimeMinutes` / `minPracticeDays` | `buildFocusCoinRedeemContext` → lotus + practice-day **count** | Already aligned; consume `aggregate` for one API | None for baseline sources; **badge score still diverges** | **2** (wire only) |
| `support-modal-tea-first` | Support modal card order | Any recorded practice | lotus `lifetimeMinutes` ∪ practice-day count | `aggregate` | ✅ Aligned on baseline sources | wire only |
| `lotus-pond-bloom` | Lotus birth / visible blooms | Lifetime minutes | `LotusPondStore` via `notePracticeMinutes` | `aggregate.lifetimeMinutes` | ✅ Write hook aligned | wire only |

### P2 — Aligned or display-only

| ID | Feature | Trigger | Current read path | Notes |
|---|---|---|---|---|
| `daily-completion-today` | Reminder suppress · HUD today bar | Today practiced | `DailyCompletionStore` | ✅ Three baseline paths share write hook |
| `practice-days-heatmap` | Weekly heatmap · 7-dot ring | Day lit / streak | `PracticeDaysStore.getLastNDays` / `getRingFilled` | ✅ By design (90-day window for UI) |
| `milestone-glow-streak` | Milestone glow nodes | Consecutive practice days | `practiceDaysStore.getRecentStreakDays` + `claimOffer` | ✅ Baseline paths mark practice days |
| `focus-coins-award` | Coin grants | Per-session events | `applyFocusCoinsGrant` / `applyBreathPracticeFocusCoinsGrant` | Event-driven, not cumulative ledger read |
| `journey-log-ui` | Journey Log list | Per-row display | `readJourneyLog` | Narrative SSOT; not an unlock gate |
| `practice-backup-reconcile` | Restore → reminder sync | Today in practice-days | `reconcileDailyCompletionAfterRestore` | Technical consistency |

### Intentional exclude — do not migrate to aggregate “practice”

| ID | Feature | Reason |
|---|---|---|
| `celebrating-timed-only` | Celebrating vs SessionComplete | Feedback tier (`PRINCIPLES`) |
| `contextual-tea-tip` | Scene tea bubble | Timed / milestone only |
| `dormant-focus-end` | DORMANT 2h | Session **end** timestamp, not minutes |
| `retention-first-session` | `first_session_complete` telemetry | Analytics contract |
| `arrival-practice` | Arrival flow | Not 同坐 (product) |
| `ritual-flow-complete` | RitualFlow history | Not 同坐 (product) |
| `sit-rise-journey-only` | Early Rise Journey row | Not a practice day |
| `recover-reset-breath` | Reset & Return · Take a Breath (~20s passive Recover) | Recover micro-reset ≠ active Breath practice; no `breathSessions` / lotus / practice-days / Journey (see `task-reset-return-mvp.md` §4.2) |

---

## Coverage diff method (for future CI)

For each consumer row:

```
baseline_sources = { sit-timed, honesty-checkin, breath-micro-ritual }
actual_sources   = inferred from read path (see “Gap” column)
delta            = baseline_sources − actual_sources
```

**Pass** when `delta` is empty **or** row is marked `intentional-exclude`.  
**Fail** when `delta` non-empty and priority P0/P1.

Planned script: `npm run audit:practice-coverage` (not implemented in recon pass).

---

## Phased fix plan (approved direction)

| Batch | Scope | Risk |
|---|---|---|
| **1** | Confide `practice_facts` → aggregate | **Done** (#681) — duration / compare / showing-up on aggregate; Journey kept for usual-time + Arrival ease only |
| **2** | Badges + mustard score → `aggregate.score`; wire redeem/support to same API | **Done** (#682) — tip/sanctuary badges + mustard seal on aggregate; redeem/support wired |
| **3** | Mustard auto-offer ceremony on any baseline completion | **In progress** (`fix/practice-aggregate-batch-3`) — Honesty + Breath completion paths share `maybeOfferGrowthSealAfterBaselineCeremony` |
| **4** | Registry + audit script in CI | Regression guard |

**Out of scope**: write hooks, new Store, Celebrating / tea tip / DORMANT / RitualFlow / Arrival.

---

## Changelog

| Date | Change |
|---|---|
| 2026-09-07 | Initial recon registry + `practiceAggregate.js` skeleton (no runtime wiring) |
| 2026-09-09 | Batch 1: Confide duration/compare/showing-up wired to aggregate; Journey sub-semantics unchanged for usual-time + Arrival ease |
| 2026-09-09 | Batch 2: tip/sanctuary badges + mustard seal score on aggregate; focus-coins redeem + support modal on same API |
| 2026-09-09 | Batch 3: mustard / archive auto-offer wired to Honesty + Breath baseline completion ceremonies |
| 2026-09-07 | Add `recover-reset-breath` intentional exclude (Reset MVP cross-line alignment) |
