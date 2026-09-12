# Taste layer KV changelog

Manual audit trail for **production** changes to `TASTE_LAYER_KV` key `taste-layer:v1:params`.

**Rules**

- Append **one row** before every KV write or Dashboard edit.
- **Never** copy production values back into git freeze sources (`tasteLayerFreeze.ts`, `sceneAnimationDispatcher.js`).
- Source merge + Worker redeploy alone do **not** change client weights until KV holds a value **and** differs from git freeze when you intend a fork.
- **Stretch / curiosity pools** stay client-only (`sceneAnimationDispatcher.js`); not in this KV schema.

## How to fork weights or Honesty threshold (example Honesty 30 → 20)

1. Append a row below (date, author, old → new, reason).
2. Create namespace if missing (once per account):

```bash
cd focus-tiger/cloud
npx wrangler kv namespace create TASTE_LAYER_KV
npx wrangler kv namespace create TASTE_LAYER_KV --preview
# Paste returned ids into wrangler.jsonc TASTE_LAYER_KV binding.
```

3. Put fork payload (example: Honesty long-sit at 20 minutes):

```bash
npx wrangler kv key put taste-layer:v1:params \
  '{"schemaVersion":1,"riseInterruptPool":[{"key":"riseStretchCasual","weight":60},{"key":"teaDrinking","weight":25},{"key":"bookReading","weight":15}],"welcomePool":[{"key":"magicBookReading","weight":60},{"key":"nodGreeting","weight":40}],"lightCompletePool":[{"key":"sessionComplete","weight":70},{"key":"mindfulAcknowledge","weight":30},{"key":"parrotEarVisit","weight":8}],"honestyLongMinMinutes":20}' \
  --binding TASTE_LAYER_KV \
  --remote
```

4. Redeploy Worker after PR merge (user command **「部署」**).
5. Verify: `curl -s -X POST https://focus-tiger-cloud.ihiro.workers.dev/api/emotion-weight \
  -H 'Content-Type: application/json' -d '{"emotionKey":"Idle","sessionPhase":"arrive"}'` → `honestyLongMinMinutes: 20`.
6. Client (`?product=1`): `__tasteLayer.status()` → `honestyLongMinMinutes: 20` when KV differs from freeze.

## Log

| Date (UTC+8) | Author | Change | Reason |
|---|---|---|---|
| 2026-09-12 | Armstrong | Namespace created + Worker redeploy (`c26fbec7`); KV empty → API returns git freeze | #722 post-merge deploy |
