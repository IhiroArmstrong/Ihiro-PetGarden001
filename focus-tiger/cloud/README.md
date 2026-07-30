# Focus Tiger · Cloudflare Workers (`cloud/`)

独立 API 骨架（TypeScript + Wrangler）。**尚未接入前端**；本目录可单独 `wrangler dev` 跑通两个 mock 接口，供人工 review 路径与字段设计。

## 前置

- Node.js 18+（建议 20+）
- 在本目录安装依赖：

```bash
cd focus-tiger/cloud
npm install
```

## 本地启动

```bash
cd focus-tiger/cloud
npm run dev
# 等价：npx wrangler dev
```

默认监听 **`http://127.0.0.1:8787`**（以终端输出为准）。

健康检查：

```bash
curl -s http://127.0.0.1:8787/health
# {"ok":true,"service":"focus-tiger-cloud"}
```

## Mock 接口

| Method | Path | 必需 JSON 字段（暂定，待 review） | 固定响应 |
|---|---|---|---|
| `POST` | `/api/daily-message` | `locale`, `localDate` | `{ "message": "mock", "variantSeed": "0" }` |
| `POST` | `/api/emotion-weight` | `emotionKey`, `sessionPhase` | `{ "variant": "default", "weight": 1.0 }` |

字段缺失、非字符串或空字符串 → **`400`**，body 形如：

```json
{ "error": "missing_fields", "detail": "Missing or empty required fields: locale" }
```

### curl：每日文案 stub

```bash
curl -s -X POST http://127.0.0.1:8787/api/daily-message \
  -H 'content-type: application/json' \
  -d '{"locale":"en","localDate":"2026-07-22"}'
```

期望：

```json
{"message":"mock","variantSeed":"0"}
```

缺字段示例：

```bash
curl -s -X POST http://127.0.0.1:8787/api/daily-message \
  -H 'content-type: application/json' \
  -d '{"locale":"en"}'
# 400 missing_fields（缺 localDate）
```

### curl：情绪权重 stub

```bash
curl -s -X POST http://127.0.0.1:8787/api/emotion-weight \
  -H 'content-type: application/json' \
  -d '{"emotionKey":"Idle","sessionPhase":"arrive"}'
```

期望：

```json
{"variant":"default","weight":1}
```

## 频率限制（内存 stub）

- 阈值写死：`RATE_LIMIT_PER_MINUTE = 60`（见 `src/middleware/rateLimit.ts`）
- 键：`Authorization: Bearer <token>` 优先，否则 `CF-Connecting-IP` / `X-Forwarded-For` / `X-Real-IP`
- 超限 → **`429`** + `Retry-After`
- **TODO**：迁到 Workers **KV**（或多 isolate 共享存储）；当前 `Map` 仅单 isolate、进程内有效，`wrangler` 热重载会清空

## 目录结构

```
cloud/
  wrangler.jsonc      # Worker 名 focus-tiger-cloud
  src/
    index.ts          # 路由入口
    types.ts          # Env + 请求/响应类型（暂定）
    lib/http.ts
    lib/validate.ts   # JSON + 必需字段
    middleware/rateLimit.ts
    routes/dailyMessage.ts
    routes/emotionWeight.ts
```

## 部署（本步不做）

```bash
npm run deploy
```

需已登录 Cloudflare（`npx wrangler login`）。骨架阶段请先本地 review，勿急着接正式业务。

## 与前端的关系

前端代码**未改**。接入时再定 CORS、鉴权与正式字段；本 README 中的必需字段仅为 stub 校验占位，**等待人工拍板**。

**密钥 / 环境隔离**：见 [`../docs/ENV_CONFIG.md`](../docs/ENV_CONFIG.md)。客户端禁止硬编码 Secret；Worker secrets 用 `wrangler secret put`；当前 stub **无需** GitHub Actions Secrets。

### 发布节奏（2026-07-30 拍板）

- **v1.0.0**：纯本地产品；**不接**本 Worker 到前端；核心练习路径不依赖联网。
- **v1.1**：跟进云端算法时再接线；保留本目录与类型/路由骨架，便于快速扩展。
- 权威口径：`PROCESS.md` Backlog「v1.1 云端算法」+ `MVP_PRODUCT_DEFINITION.md`「本地优先边界」。
