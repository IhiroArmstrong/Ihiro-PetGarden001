# KB live gap audit — Step 2 (live registry vs approved catalog)

> **Status**: Step 2 wired (2026-09-22) · gap report SSOT + CI audit  
> **Companion code**: `scripts/audit-kb-live-gap.js` · `src/core/kbLiveEntryRegistry.js` · `src/core/confide/productKnowledgeCatalog.json`  
> **Brief**: `docs/task-briefs/task-kb-scaled-production.md` · **无运行时** · 不改 catalog / Confide 检索

---

## Plain-language purpose

Step 1 answered **which product surfaces are live**. Step 2 answers **where approved `KB-FUNC-*` rows already cover those surfaces, where registry links drift, and which live menus still need authoritative drafts**.

This is an **A 类** audit artifact. Gaps listed here are **expected** until Step 4 drafts pass PO tone spot-check and enter `productKnowledgeCatalog.json` (B 类).

**Hard rules (carry forward from Step 1)**:

- Epic / Test Tracker / PR text may suggest topics; only rows with locale / rule SSOT may draft catalog entries.
- Operational numbers stay out of recitable short answers.
- `KB-FUNC-0009` (cloud backup) remains **未审核** in `product-knowledge-base.md` — live registry links approved sibling **0012** for journey-log UI (not cloud backup). `KB-FUNC-0006` breath pilot is **已通过** as inventory reference only (`yin_may_retrieve: 否`; retrieval via **0011+0001**).

---

## How to read the buckets

| Bucket | Meaning | Typical next step |
|---|---|---|
| **batch-2 candidates** | Live (or default-on / entitlement-gated) surface with **no** approved catalog link | Step 4 authoritative draft → machine verify → PO tone spot-check |
| **registry mapping drift** | `catalogKbIds` on a live row ≠ canonical approved map derived from `product-knowledge-base.md` locale keys | Fix registry links in a docs-only PR (no catalog change) |
| **registry links unapproved** | Live row still points at `0006` / `0009` or other non-catalog ids | Swap to approved sibling (e.g. `0012` not `0009`) or wait for PO on draft |
| **conditional / gated-off** | Surface exists but off/conditional by default — draft only after PO confirms user scope | PO call before Step 4 |
| **cross-cutting approved** | Approved catalog fact without a menu row (`0014` memory panel, `0016` unload, `0017` browser) | Keep; no live row required |

---

## Gap audit (machine block)

<!-- kb-live-gap-audit:begin -->

> **机器块 · 勿手改**。真源：`scripts/audit-kb-live-gap.js` + `kbLiveEntryRegistry.js` + `productKnowledgeCatalog.json`。刷新：`npm run audit:kb-live-gap -- --write`。

**Snapshot**: 2026-11-13 · 56 live rows · 57 approved catalog ids

### Summary counts

| bucket | count | next step |
|---|---:|---|
| batch-2 live-surface candidates | 15 | Step 4 authoritative draft → PO tone spot-check |
| registry mapping drift | 0 | fix `catalogKbIds` on registry rows (docs-only) |
| registry links unapproved | 0 | swap to approved ids or wait for PO on 0006/0009 |
| conditional/gated-off without approved KB | 2 | PO scope before drafting |
| cross-cutting approved (no live row) | 17 | keep as behavior/platform facts |

### Batch-2 candidates (live · default-on · entitlement-gated · no approved link)

| liveId | liveStatus | menuPath | labelKeys |
|---|---|---|---|
| `kb-live-mustard-seed-seal` | entitlement-gated | ⋯ → Inspiration → Mustard Seed · Sumeru (after unlock) | `MUSTARD_SEED_SEAL_MENU_LABEL` |
| `kb-live-mindflow-nebula` | live | ⋯ → Preferences → Mindflow nebula | `MINDFLOW_NEBULA_MENU_LABEL` |
| `kb-live-practice-study` | live | ⋯ → Preferences → Practice Study | `PRACTICE_STUDY_MENU_LABEL` |
| `kb-live-archive-seal-ca-01-old-pond` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-01) | `CONTEMPLATIVE_ARCHIVE_CA01_MENU_LABEL` |
| `kb-live-archive-seal-ca-02-cherry-blossoms` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-02) | `CONTEMPLATIVE_ARCHIVE_CA02_MENU_LABEL` |
| `kb-live-archive-seal-ca-03-morning-field` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-03) | `CONTEMPLATIVE_ARCHIVE_CA03_MENU_LABEL` |
| `kb-live-archive-seal-ca-04-empty-room` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-04) | `CONTEMPLATIVE_ARCHIVE_CA04_MENU_LABEL` |
| `kb-live-archive-seal-ca-05-bird-has-flown` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-05) | `CONTEMPLATIVE_ARCHIVE_CA05_MENU_LABEL` |
| `kb-live-archive-seal-ca-06-spring-water` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-06) | `CONTEMPLATIVE_ARCHIVE_CA06_MENU_LABEL` |
| `kb-live-archive-seal-ca-07-distant-mountain` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-07) | `CONTEMPLATIVE_ARCHIVE_CA07_MENU_LABEL` |
| `kb-live-archive-seal-ca-08-moonlight` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-08) | `CONTEMPLATIVE_ARCHIVE_CA08_MENU_LABEL` |
| `kb-live-archive-seal-ca-09-still-tree` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-09) | `CONTEMPLATIVE_ARCHIVE_CA09_MENU_LABEL` |
| `kb-live-archive-seal-ca-10-sound-after-bell` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-10) | `CONTEMPLATIVE_ARCHIVE_CA10_MENU_LABEL` |
| `kb-live-archive-seal-ca-11-falling-leaf` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-11) | `CONTEMPLATIVE_ARCHIVE_CA11_MENU_LABEL` |
| `kb-live-archive-seal-ca-12-cypress-old-lane` | entitlement-gated | ⋯ → Inspiration → Contemplative Archive (CA-12) | `CONTEMPLATIVE_ARCHIVE_CA12_MENU_LABEL` |

### Registry mapping drift (registry `catalogKbIds` ≠ canonical approved map)

| liveId | liveStatus | registryKbIds | canonicalKbIds |
|---|---|---|---|

### Registry links to unapproved ids

| liveId | liveStatus | registryKbIds | unapprovedKbIds |
|---|---|---|---|

### Conditional / gated-off surfaces (no approved KB yet)

| liveId | liveStatus | menuPath | note |
|---|---|---|---|
| `kb-live-language` | conditional | ⋯ → Preferences → Language | conditional / optional surface — draft after PO confirms scope |
| `kb-live-account` | conditional | ⋯ → Preferences → Save or restore with email | conditional / optional surface — draft after PO confirms scope |

### Cross-cutting approved catalog rows (no live row required)

- `KB-FUNC-0006`
- `KB-FUNC-0014`
- `KB-FUNC-0016`
- `KB-FUNC-0017`
- `KB-EDU-0001`
- `KB-EDU-0002`
- `KB-EDU-0003`
- `KB-EDU-0004`
- `KB-FUNC-0035`
- `KB-FUNC-0036`
- `KB-FUNC-0038`
- `HELP-BREATH-DURATION`
- `HELP-LOTUS-BLOOMS`
- `HELP-BUY-COLLECTIONS`
- `HELP-BADGE-NOT-COIN`
- `HELP-DEVICES-SAFARI`
- `HELP-APPLE-HEALTH-LOG`

<!-- kb-live-gap-audit:end -->

---

## How to refresh

```bash
cd focus-tiger && npm run audit:kb-live-gap -- --write
```

CI / smoke: `npm run audit:kb-live-gap` (no write) is part of `npm run docs:check`.

---

## Next steps (not this PR)

| Step | Content | Status |
|---|---|---|
| 1 | Static live-entry registry | **已合 develop** (#929) |
| 2 | Gap audit (this doc) | **已合 develop** (#931) · registry drift cleared |
| 3 | Expand retrieval keywords on passed rows (fact unchanged) | **本旁支** · catalog keywords only |
| 4 | Authoritative-source draft → machine verify → PO tone spot-check → catalog | 以本节**机器块**为准。「batch-2 存活面候选清零」只描述当时那一批（0019–0032）入库；之后漏登菜单行登记进 live registry 但尚未链 catalog 时，计数会再出现。待人工审的项收在 `docs/kb-po-review-queue.md`。 |
| 手册 | `docs/internal-handbook/` | **雏形已开**（2026-10-01）· 不从本审计灌正文 |
