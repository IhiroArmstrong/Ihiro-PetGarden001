# Focus Tiger（坐禅小老虎）

Calm focus companion — mindfulness partner, not a traditional virtual pet.

**Product code lives in [`focus-tiger/`](./focus-tiger/).** Public marketing page (Slice 0) lives in [`marketing-site/`](./marketing-site/) for `twinsology.com` — it is not the practice app.

## For people trying the app

- **[User guide](./focus-tiger/docs/USER_GUIDE.md)** — open the app and complete one simple session  
- **[Privacy notice](./focus-tiger/docs/PRIVACY_NOTICE.md)** — what stays on device for v1.0.0  

v1.0.0 ships **English only**.

## For developers (local)

```bash
cd focus-tiger
npm ci
npm run dev
```

Open the printed local URL in **Safari** (preferred). Product preview often uses `?product=1`.

Useful checks:

```bash
npm run test:pr-smoke   # logic smoke + browser shell
npm run build           # production bundle → dist/
```

Engineering docs: [`focus-tiger/docs/`](./focus-tiger/docs/) — start with `PROCESS.md` / `RULES_INDEX.md`. Git branch model: [`WORKFLOW.md`](./WORKFLOW.md).

## Release note (engineering)

Stable releases are **annotated tags on `main`** (SemVer; first target `v1.0.0`). See `WORKFLOW.md`.
