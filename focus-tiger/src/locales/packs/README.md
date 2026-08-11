# Japanese locale review pack

## Canonical runtime files (product loads these)

| File | Role |
|---|---|
| `../en.json` | English SSOT keys + default copy |
| `../ja.json` | **Japanese runtime pack** — edit this *or* import from the TSV |
| `../zh.json` | Chinese (draft for v1.0; not in picker) |
| `../localeRegistry.js` | Which locales are `ready` vs `draft` |

There is **no separate binary language pack**. `ja.json` is the language pack.

## Human review file (this folder)

| File | Role |
|---|---|
| `ja-en-review.tsv` | Side-by-side `key` / `en` / `ja` for review in Excel / Numbers / Sheets |

### Workflow

1. Export (refresh TSV from current JSON):

```bash
cd focus-tiger && npm run locale:export-ja
```

2. Edit **only the `ja` column** in `ja-en-review.tsv` (keep `key` unchanged; `en` is reference).

3. Import back into runtime:

```bash
cd focus-tiger && npm run locale:import-ja
```

Import fails if keys are missing or unknown vs `en.json`. Then run:

```bash
npm run test:smoke
```

### Gap report (no auto-translate)

```bash
cd focus-tiger && npm run i18n:sync
```

Lists: missing/extra keys, `ja === en` placeholders, and Latin-only `ja` values (must include hiragana/katakana/**kanji**). Exit 1 on gaps. Does **not** call an LLM or write machine copy — v1 keeps **审完再露**.

### Optional: edit `ja.json` directly

Same effect — save the file and reload the app. The TSV is only for easier bilingual review.
