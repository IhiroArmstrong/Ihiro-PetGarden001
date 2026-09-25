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

**Snapshot**: 2026-09-26 · 27 live rows · 25 approved catalog ids

### Summary counts

| bucket | count | next step |
|---|---:|---|
| batch-2 live-surface candidates | 9 | Step 4 authoritative draft → PO tone spot-check |
| registry mapping drift | 0 | fix `catalogKbIds` on registry rows (docs-only) |
| registry links unapproved | 0 | swap to approved ids or wait for PO on 0006/0009 |
| conditional/gated-off without approved KB | 2 | PO scope before drafting |
| cross-cutting approved (no live row) | 7 | keep as behavior/platform facts |

### Batch-2 candidates (live · default-on · entitlement-gated · no approved link)

| liveId | liveStatus | menuPath | labelKeys |
|---|---|---|---|
| `kb-live-quiet-together` | gated-default-on | ⋯ → Not alone → Quiet together | `QUIET_TOGETHER_MENU_LABEL` |
| `kb-live-focus-circle` | live | ⋯ → Not alone → Focus circle | `FOCUS_CIRCLE_MENU_LABEL` |
| `kb-live-today-direction` | live | ⋯ → Preferences → Choose today's direction again | `TODAY_DIRECTION_MENU_LABEL` |
| `kb-live-sanctuary-nav` | live | ⋯ → Practice → Navigate sanctuary (wide home compass ball shortcut) | `SANCTUARY_NAV_MENU_LABEL` |
| `kb-live-community` | live | ⋯ → Preferences → Community | `COMMUNITY_MENU_LABEL` |
| `kb-live-membership` | live | ⋯ → Membership CTA / Premium unlocked | `MEMBERSHIP_MENU_CTA` `MEMBERSHIP_MENU_UNLOCKED` |
| `kb-live-ritual-morning` | entitlement-gated | ⋯ → Rituals → ritual.morning.menu | `ritual.morning.menu` |
| `kb-live-ritual-emotional-reset` | entitlement-gated | ⋯ → Rituals → ritual.emotional_reset.menu | `ritual.emotional_reset.menu` |
| `kb-live-ritual-work-transition` | entitlement-gated | ⋯ → Rituals → ritual.work_transition.menu | `ritual.work_transition.menu` |

### Registry mapping drift (registry `catalogKbIds` ≠ canonical approved map)

| liveId | liveStatus | registryKbIds | canonicalKbIds |
|---|---|---|---|

### Registry links to unapproved ids

| liveId | liveStatus | registryKbIds | unapprovedKbIds |
|---|---|---|---|

### Conditional / gated-off surfaces (no approved KB yet)

| liveId | liveStatus | menuPath | note |
|---|---|---|---|
| `kb-live-reminder` | conditional | ⋯ → Preferences → Reminder | conditional / optional surface — draft after PO confirms scope |
| `kb-live-language` | conditional | ⋯ → Preferences → Language | conditional / optional surface — draft after PO confirms scope |

### Cross-cutting approved catalog rows (no live row required)

- `KB-FUNC-0014`
- `KB-FUNC-0016`
- `KB-FUNC-0017`
- `KB-EDU-0001`
- `KB-EDU-0002`
- `KB-EDU-0003`
- `KB-EDU-0004`

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
| 4 | Authoritative-source draft → machine verify → PO tone spot-check → catalog | **0019/0020 已合 develop** (#939) · **0021 Daily quote 已入库 catalog**（闸门 **19**）· **0022/0023 待审草稿**（§4.5–4.6 · PR #971 入库旁支）· **0024–0026 Rituals 待审草稿**（§4.7 · 本旁支） |
| 手册 | `docs/internal-handbook/` | 等缺口稳定后再开 |
