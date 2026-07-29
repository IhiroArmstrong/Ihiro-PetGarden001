# Cloud Config v1（路径 B · 体验优先）

> **状态（2026-07-29）**：总原则与 A1–A6 已拍板；执行走 **路径 B**——本地默认表为真相源 + 接云端钩子；**Worker 不接产品主路径**。  
> 防盗型「关键素材上云」、**(B) 练习进度/账号同步** 均不在本版。

## 总原则（v1）

1. 云端只做：可热更新的文案选取 + 情绪变体权重 / 软调度参数。  
2. 客户端是真相源兜底：失败 / 超时 / 离线 → 本地逻辑继续，产品不挂。  
3. 不引入模型（无 LLM / 无远程推理）；v1 = 配置表 + 简单确定性 / 加权随机规则。  
4. 文案正文留在客户端 `en.json` / `zh.json`；云端优先返回 `messageKey` / pool / seed。  
5. **云端结果不得挡交互**：只允许预取 / 后台刷新 / 用当日缓存；禁止「点击 → 等接口 → 再播动画」。  
6. **缺云端 ≈ 与今日发版行为一致**：本地 fallback 必须对齐现网 `tPool` 语义与 Celebrating **50/50**，禁止随便占位默认。

## A1–A6（已拍板）

| # | 结论 |
|---|---|
| A1 | `daily-message` = **技术验证通道**（按日固定选取）；不绑定「今日一炷香」正式文案 |
| A2 | 只返回 `messageKey` |
| A3 | 权重仅 **celebrating → celebrateDance / celebrateDanceV2**；其余未配置 → 默认 |
| A4 | **形态 2**：下发权重表，客户端本地随机 |
| A5 | 按 `localDate` 缓存当日结果；失败用本地默认；不跨日沿用 |
| A6 | 允许 `weight=0`；若加权后无候选 → 回退本地默认 50/50 |

鉴权（将来启用时）：无账号 + IP 限流 + CORS。  
CI（当前）：`cloud/` **typecheck** 保留，防 stub 过期；**不**进 pr-smoke 强依赖、**不**自动部署。

## 路径 B · 代码落点

| 模块 | 路径 |
|---|---|
| 本地 SSOT（权重表、按日选句、加权挑选） | `src/core/softScheduleConfig.js` |
| 钩子（默认 `mode: 'local'`） | `src/core/CloudConfigClient.js` |
| Celebrating 接线 | `EmotionController.pickCelebrateDanceVariant` → 读上表 |
| Workers stub（未接线） | `cloud/`（响应形状须与上文契约一致） |

## Backlog：`enable-cloud-config-hot-update`

**目的**：在「确实需要不发版调参」时再接线 Worker，避免空转基建。

### 触发计数器（必填，防 backlog 永睡）

每当你或产品同学冒出 **「要是不用发版就能改这个就好了」**（针对 Celebrating 权重或每日 `messageKey` 池），在下表加一行（日期 + 谁 + 想改什么）。**攒满 ≥3 笔** → 排期启用远端（按 A1–A6 接线）。未满 3 笔 → 继续本地改表发版。

| 日期 | 记录人 | 想热更的内容（一句话） |
|---|---|---|
| — | — | （尚无） |

### 启用时还须做

- 前端 `CloudConfigClient` 设 `mode: 'remote'`（或等价）；遵守原则 5–6  
- Worker 真表与本地默认表对齐后部署；限流迁 KV（若多 isolate）  
- 扩展 CI：路由单测；仍可不做自动部署  

### stub 防过期

- PR 改 `focus-tiger/cloud/**` 或本契约时跑 **cloud typecheck**  
- 改本地 `softScheduleConfig` / 客户端期望形状时，同步改 `cloud/src/types.ts` 与 stub 响应（见 `cloud/README.md`）
