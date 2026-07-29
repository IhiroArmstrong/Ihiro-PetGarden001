# Focus Tiger · Cloudflare Workers (`cloud/`)

独立 API 包（TypeScript + Wrangler）。

> **路径 B（2026-07-29）**：产品主路径 **不** 联网。本地 SSOT 在 `src/core/softScheduleConfig.js`；钩子 `CloudConfigClient` 默认 `mode: 'local'`。  
> 本目录 stub **保留**，响应形状须与 [`docs/CLOUD_CONFIG_V1.md`](../docs/CLOUD_CONFIG_V1.md) 一致，避免启用日才发现漂移。  
> CI：改本目录时跑 `npm run typecheck`（见 `.github/workflows/focus-tiger-cloud-typecheck.yml`）。**不**自动部署、**不**进 pr-smoke。

## 前置

- Node.js 18+（建议 20+）
- 在本目录安装依赖：

```bash
cd focus-tiger/cloud
npm install
```

## 本地启动（可选 · 人工验 stub）

```bash
cd focus-tiger/cloud
npm run dev
```

默认 **`http://127.0.0.1:8787`**。

```bash
curl -s http://127.0.0.1:8787/health
# {"ok":true,"service":"focus-tiger-cloud"}
```

## 契约（与 CLOUD_CONFIG_V1 / 本地 SSOT 对齐）

| Method | Path | 必需字段 | 响应（摘要） |
|---|---|---|---|
| `POST` | `/api/daily-message` | `locale`, `localDate` | `{ schemaVersion, messageKey, variantSeed }`（A2） |
| `POST` | `/api/emotion-weight` | `emotionKey`, `sessionPhase` | `{ schemaVersion, variants: [{id,weight}] }`（A4 形态 2） |

- `celebrating` → 默认 50/50 两舞；其它 emotion → `variants: []`  
- 缺字段 → **400**；限流超限 → **429**（内存 Map；启用多 isolate 前迁 KV）

### curl 示例

```bash
curl -s -X POST http://127.0.0.1:8787/api/daily-message \
  -H 'content-type: application/json' \
  -d '{"locale":"en","localDate":"2026-07-29"}'

curl -s -X POST http://127.0.0.1:8787/api/emotion-weight \
  -H 'content-type: application/json' \
  -d '{"emotionKey":"celebrating","sessionPhase":"focus"}'
```

## 类型检查

```bash
cd focus-tiger/cloud
npm run typecheck
```

## 部署

路径 B **不做**生产部署。将来 `enable-cloud-config-hot-update` 触发后再 `npm run deploy`（需 `wrangler login`）。

## 与前端的关系

前端 **未** 以 `mode:'remote'` 接线。改 stub 字段时同步改：

1. `docs/CLOUD_CONFIG_V1.md`  
2. `src/core/softScheduleConfig.js` / `CloudConfigClient.js`  
3. 本目录 `src/types.ts` + routes
