# Growth metrics charter — governance SSOT

> **Status**: Initial charter (2026-09-10) · persona regression in CI  
> **Companion code**: `src/core/growthMetricsRegistry.js` · `src/core/growthPersonaFixtures.js` · `src/core/growthPersonaRegression.js`  
> **Related**: `practice-aggregate-registry.md` (baseline write hook + P0 consumers) · `FOCUS_COINS.md` (currency track) · `TEST_TRACKER.md` (QA seeds)

---

## Plain-language purpose

Focus Tiger **does not** use one formula for all growth. That is intentional product design:

| Layer | Examples | How it grows |
|---|---|---|
| **Garden (自动)** | Lotus pond, practice badges, memorial seals | Lifetime / score / streak — never sold for coins |
| **Collections (结缘)** | 清供八件、称号 | Focus Coins + SKU gates |
| **Session feedback** | Celebrating, MilestoneGlow animation | Today / streak nodes — not a scoreboard |

This charter makes **fairness operable**: every track declares input sources, window, daily-cap policy, formula version, and authoritative consumers. **Persona fixtures** turn “is this fair?” into pass/fail regression instead of ad-hoc debate.

---

## Two question types (do not merge)

| Type | Question | What “good” looks like |
|---|---|---|
| **Unlock gate** | May the user see this memorial / badge tier / SKU? | Monotonic, auditable, anti-cheat; product line, not psychometrics |
| **Presentation feedback** | Does growth *feel* right (lotus curve, glow timing)? | Persona curves match intent; tune with fixtures, not proofs |

Debates like “raise minute weight?” belong to **persona regression**, not abstract math.

---

## Governance checklist (ship gate)

Before changing any growth formula or adding a cumulative consumer:

1. **Registry row** — append/update `growthMetricsRegistry.js` (all required fields).
2. **Version + migration** — bump `formulaVersion`; document old→new in this file § Migrations.
3. **Persona table** — add or update fixtures; `npm run audit:growth-metrics` must pass.
4. **Consumer wiring** — P0/P1 reads stay in `practiceAggregateConsumerRegistry.js`; CI `audit:practice-coverage`.
5. **TEST_TRACKER** — QA seeds must cite persona ids (not hand-waved arithmetic).

---

## Track registry (machine block)

<!-- growth-metrics-registry:begin -->

> **机器块 · 勿手改**。真源：`src/core/growthMetricsRegistry.js` · persona：`src/core/growthPersonaFixtures.js`。刷新：`npm run audit:growth-metrics -- --write`。

| id | purpose | window | formulaVersion | formulaSummary |
|---|---|---|---|---|
| `practice-score` | unlock-gate | mixed | scoreFormula.v3 | practiceDayCount + floor(scoreEligibleLifetimeMinutes / 60); per-day lotus cap 180m |
| `lotus-bloom` | presentation-feedback | lifetime | lotusPondSliceA.v1 | Piecewise thresholds: bloom1=25m; blooms2–5 +25m each; blooms6–12 +45m each; max 12 visible. |
| `practice-badges-free` | presentation-feedback | mixed | badgeAward.v1 | target = min(9, max(1, 1 + floor(score/3))); 0 badges when no practice. |
| `practice-badges-paid` | presentation-feedback | mixed | badgeAward.v1 | target = min(17, max(3, 3 + floor(score/3))) for Sanctuary; tip max 9. |
| `mustard-seal` | unlock-gate | mixed | mustardUnlock.v1 | score ≥ 21; three verse cases revealed one per baseline completion. |
| `contemplative-archive` | unlock-gate | mixed | caUnlock.v1 | Each CA entry: score ≥ entry.scoreThreshold. |
| `milestone-glow-streak` | presentation-feedback | consecutive-streak | milestoneGlow.v1 | resolveMilestoneGlowNodeId(recentStreakDays) — orthogonal to practice score. |
| `focus-coins-earn` | currency | event-driven | focusCoinsL0.v1 | Event grants on completion hooks; Stay 5m=1pt; Across/Honesty 10m=1pt; echo +3. |
| `focus-coins-redeem` | unlock-gate | mixed | focusCoinsRedeem.v1 | evaluateFocusCoinRedeem(skuId, context) — coins never satisfy isEntitled. |
| `celebrating-today` | session-feedback | session | sessionFeedback.v1 | hasCelebratedToday() — not cumulative unlock. |

### Persona regression (contract)

| id | label | intent | score | mustard | blooms | badges |
|---|---|---|---:|---|---:|---:|
| `steady-light` | 坚持型轻练习者 | 每天 Honesty 5 分钟 ×21 天 — 应能开芥子印（奖励常回来） | 22 | yes | 4 | 8 |
| `single-binge` | 单次爆肝型 | 一天坐 10 小时 — 不应单日接近芥子 unlock 线（防 binge 刷分） | 4 | no | 12 | 2 |
| `single-binge-extreme` | 极端单次爆肝型 | 一天 24 小时不间断 — 封顶后不得越过芥子 unlock 线 | 4 | no | 12 | 2 |
| `deep-weekly` | 深度冥想型 | 12 个练习日 × 每次 60 分钟 — 莲花开得快，score 也达标 | 24 | yes | 12 | 9 |
| `rolling-veteran` | 断续型老用户 | 窗口内 30 天 + 高终身分钟 — 分钟不倒退，池满 12 朵封顶 | 113 | yes | 12 | 9 |
| `qa-mustard-shortcut` | QA · 芥子印正确播种 | qaSeedStreak=21（只写 practice-days）→ score=21，可测纪念印 | 21 | yes | 0 | 8 |
| `qa-seed-streak-15-legacy` | QA · 旧文档陷阱（Batch 2 后失效） | qaSeedStreak=15 不写 lotus — score=15，不得再当芥子印捷径 | 15 | no | 0 | 6 |
| `milestone-streak-7` | 连续 7 天 · MilestoneGlow | 6 个连续练习日 + 今日达标 → streak-7 节点可 claim | 8 | no | 5 | 3 |

<!-- growth-metrics-registry:end -->

Human-readable expansion (input sources · caps · consumers) lives in `growthMetricsRegistry.js` JSDoc rows. The machine block above is the CI-synced index.

---

## Persona regression

Fixtures live in `growthPersonaFixtures.js`. Each row encodes **product intent** + expected outputs from live formulas.

| Persona id | Use when |
|---|---|
| `steady-light` | Honesty-only regulars should reach memorial unlock |
| `single-binge` | One-day binge must not near unlock line |
| `single-binge-extreme` | 24h single-day binge must stay well below unlock line after cap |
| `deep-weekly` | Depth-heavy users bloom fast + unlock |
| `rolling-veteran` | Lifetime minutes survive 90-day window roll |
| `qa-mustard-shortcut` | **Correct** mustard QA: `?qaSeedStreak=21` |
| `qa-seed-streak-15-legacy` | **Trap** after Batch 2: `?qaSeedStreak=15` alone → score 15 |
| `milestone-streak-7` | MilestoneGlow node at consecutive day 7 |

Run: `npm run audit:growth-metrics` (also in `docs:check`).

---

## Formula versions & migrations

### `scoreFormula.v3` (current · 2026-09-10)

```text
score = practiceDayCount + floor(scoreEligibleLifetimeMinutes / 60)
```

- `practiceDayCount` ← count of entries in `focus-tiger.practice-days.v1` (≤ 90-day window).
- `scoreEligibleLifetimeMinutes` ← `focus-tiger.lotus-pond.v1` field accrued at write time with **180 min/calendar-day** soft cap toward score.
- `lifetimeMinutes` (same key) ← true lifetime, monotonic, **uncapped** — drives lotus blooms only.

**Binge acceptance**: `single-binge` / `single-binge-extreme` persona scores must stay ≤ 60% of mustard threshold (21 → ≤ 12).

**Consumers**: tip/sanctuary badges, mustard seal, contemplative archive, focus-coins redeem gates (via `resolvePracticeAggregate`).

**Migration rule (v2→v3)**: grandfather — on first read, `scoreEligibleLifetimeMinutes = lifetimeMinutes`; new accrual capped per day. No retroactive score downgrade. Blooms unchanged.

### `scoreFormula.v2` (retired · Batch 2, 2026-09-09)

```text
score = practiceDayCount + floor(lifetimeMinutes / 60)
```

Uncapped lifetime minutes allowed single-day binge to approach unlock line.

### `scoreFormula.v1` (retired semantics)

Pre-Batch-2 reads summed **90-day practice-days minutes** as if they were lifetime. That inflated score for long-window users and made `qaSeedStreak=15` × 25 min **appear** to reach 21 without lotus data.

**Migration rule (v1→v2)**: no silent reweight — long-term users may **gain** score/badges/seals when lotus lifetime was always higher than the window sum. Document as expected fix, not regression.

---

## Open product questions (explicit)

| Topic | Current state | Decision owner |
|---|---|---|
| Lotus lifetime minutes **per day cap** | **Closed** — 180 min/day toward score only; blooms uncapped (`scoreFormula.v3`) | PO 2026-09-10 |
| **scoreFormula fairness** (binge vs light practice) | **Resolved · under observation** — v3 + persona CI lock `single-binge`/`single-binge-extreme` at score 4 and `steady-light` at 22 (mustard ok). **No v4 candidate deliberation** until: (1) real user/CS signal that depth users are too slow or light users too fast; (2) a new feature is more score-sensitive than mustard unlock; or (3) mustard threshold (21) changes — then rerun persona table (review `steady-light` vs `single-binge` first). Do **not** raise minute weight or add AND gates without that trigger. | PO 2026-09-10 |
| Honesty 5 min × 21 days → mustard unlock | Allowed by score (days dominate) | Persona `steady-light` locks intent until changed |
| MilestoneGlow vs score | Orthogonal streak ladder | By design |

---

## QA seed contract (TEST_TRACKER)

| Goal | URL seed | Persona |
|---|---|---|
| MilestoneGlow day 7 | `?qaSeedStreak=6` + today sit | `milestone-streak-7` (6 prior + today) |
| Mustard seal score gate | `?qaSeedStreak=21` + baseline ceremony | `qa-mustard-shortcut` |
| **Do not use** for mustard | `?qaSeedStreak=15` without lotus | `qa-seed-streak-15-legacy` (score 15) |
| Lotus bloom birth | `?qaLotusBlooms=N` | separate key — see `qaLotusPondSeed.js` |

Optional mustard path with lotus supplement: `qaSeedStreak=15&qaLotusBlooms=12` (440 lifetime min → +7 score → 22).

---

## Changelog

| Date | Change |
|---|---|
| 2026-09-10 | Initial charter + registry schema + persona CI + TEST_TRACKER seed contract |
| 2026-09-10 | scoreFormula.v3 — 180 min/day score cap; `single-binge-extreme` persona |
| 2026-09-10 | Open questions: scoreFormula fairness marked **resolved · under observation**; v4 candidate deliberation gated on data / new feature / threshold change |
