# Growth metrics KV changelog

Manual audit trail for **production** changes to `GROWTH_METRICS_KV` key `growth-metrics:v1:params`.

**Rules**

- Append **one row** before every KV write or Dashboard edit.
- **Never** copy production values back into git freeze sources (`scoreDailyCap.js`, etc.).
- Source merge + Worker redeploy alone do **not** change client caps until KV holds a value **and** differs from git freeze (180) when you intend a fork.

## How to change `dailyScoreCapMinutes` (example 180 → 240)

1. Append a row below (date, author, old → new, reason).
2. On Mac with Cloudflare auth:

```bash
cd focus-tiger/cloud
npx wrangler kv key put growth-metrics:v1:params \
  '{"schemaVersion":1,"dailyScoreCapMinutes":240}' \
  --binding GROWTH_METRICS_KV
```

3. Redeploy Worker after PR merge (user command **「部署」**).
4. Verify: `curl -s -X POST https://focus-tiger-cloud.ihiro.workers.dev/api/growth-metrics-config \
  -H 'Content-Type: application/json' -d '{"clientSchema":1}'` → `dailyScoreCapMinutes: 240`.
5. Client (`?product=1`): `__growthMetrics.status()` → `{ growthMetrics: true, dailyScoreCapMinutes: 240 }`.

## Log

| Date (UTC+8) | Author | Change | Reason |
|---|---|---|---|
| _（尚无生产写入）_ | — | — | Pilot PR only; KV empty → Worker returns git freeze 180 |
