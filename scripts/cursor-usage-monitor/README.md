# Cursor Usage Monitor

定期读取 Cursor Dashboard 导出的 usage CSV，检查 token / 花费阈值，并通过 webhook 发送告警。

## 功能

- 从**本地文件**或 **URL** 读取 Cursor usage CSV
- 解析每条记录的**时间、模型、token 数、花费**
- 两类可配置告警：
  - **单条记录 token 超限**（默认 100 万）
  - **最近 1 小时累计花费超限**（默认 $5）
- 通过 **webhook POST** 发送 JSON 告警（可对接企业微信 / Telegram / Slack 等）
- 用 **state.json** 记录已处理到的最新时间戳，避免 cron 重复告警

## CSV 格式

脚本兼容 Cursor Dashboard 导出的标准格式，表头类似：

```csv
Date,Model,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost,Cost to you
```

花费字段说明：

- `Cost to you`：你实际承担的费用（默认用于告警）
- `Cost`：API 成本
- 值为 `Included` 或空时按 $0 处理

可在配置里用 `"costField": "costToYou" | "apiCost" | "max"` 切换。

## 快速开始

### 1. 准备配置

```bash
cd /workspace/scripts/cursor-usage-monitor
cp config.example.json config.json
```

编辑 `config.json`：

```json
{
  "csvSource": {
    "localPath": "/Users/you/Downloads/cursor-usage.csv",
    "url": null,
    "urlHeaders": {}
  },
  "thresholds": {
    "singleRecordTokens": 1000000,
    "hourlyCostUsd": 5,
    "hourlyWindowMs": 3600000,
    "hourlyAlertCooldownMs": 3600000
  },
  "webhook": {
    "url": "https://your-webhook.example.com/notify",
    "timeoutMs": 15000
  },
  "stateFile": "./state.json",
  "costField": "costToYou"
}
```

**数据源二选一：**

| 方式 | 配置 |
|------|------|
| 本地文件 | `"localPath": "/absolute/path/to/usage.csv"` |
| URL 下载 | `"url": "https://..."`，可选 `"urlHeaders"` 放 Cookie / Token |

从 URL 拉取时示例（需自行替换 session token）：

```json
{
  "csvSource": {
    "localPath": null,
    "url": "https://cursor.com/api/dashboard/export-usage-events-csv?strategy=tokens",
    "urlHeaders": {
      "Cookie": "WorkosCursorSessionToken=YOUR_SESSION_TOKEN"
    }
  }
}
```

> 注意：Session token 会过期，生产环境更推荐定时把 Dashboard CSV 导出到本地，再让脚本读 `localPath`。

### 2. 手动运行

```bash
cd /workspace/scripts/cursor-usage-monitor
node monitor.mjs
```

**试运行（不发 webhook、不写 state）：**

```bash
node monitor.mjs --dry-run
```

**指定配置文件：**

```bash
node monitor.mjs --config /path/to/my-config.json
```

### 3. cron 定时任务

建议每 **5–15 分钟** 跑一次。示例 crontab（每 10 分钟）：

```cron
# Cursor usage 监控 — 每 10 分钟
*/10 * * * * /usr/bin/node /workspace/scripts/cursor-usage-monitor/monitor.mjs >> /tmp/cursor-usage-monitor.log 2>&1
```

编辑 crontab：

```bash
crontab -e
```

若 Node 不在 `/usr/bin/node`，先用 `which node` 查路径。

**配合自动导出 CSV（可选）：** 可用另一个 cron 任务定期从 Dashboard 下载最新 CSV 到固定路径，本脚本只读该文件。

## 告警去重逻辑

| 场景 | 策略 |
|------|------|
| 单条 token 超限 | 仅对 `lastProcessedTimestamp` **之后的新记录**检查 |
| 小时累计花费 | 滚动窗口内总和超阈值，且窗口内有**新记录**；同一金额不会反复告警（cooldown + 金额增量检测） |
| checkpoint | 每次成功运行后，把 `lastProcessedTimestamp` 更新为 CSV 中最新记录时间 |

`state.json` 示例：

```json
{
  "lastProcessedTimestamp": "2026-08-21T12:30:00.000Z",
  "lastHourlyAlert": {
    "at": "2026-08-21T12:10:00.000Z",
    "sum": 5.42
  }
}
```

## Webhook 载荷

POST JSON，结构示例：

```json
{
  "source": "cursor-usage-monitor",
  "type": "single_record_tokens",
  "timestamp": "2026-08-21T12:59:00.000Z",
  "message": "Single request exceeded token threshold: 1,234,567 tokens (claude-sonnet-4)",
  "details": {
    "date": "2026-08-21T12:58:00.000Z",
    "model": "claude-sonnet-4",
    "totalTokens": 1234567,
    "costUsd": 0.82,
    "thresholdTokens": 1000000
  }
}
```

### 企业微信机器人适配示例

企业微信需 `msgtype: text` 包装。可在 webhook 前加一层转发，或用 Cloudflare Worker / 小型中间服务把上述 JSON 转成：

```json
{
  "msgtype": "text",
  "text": {
    "content": "【Cursor 告警】单条 token 超限\n模型: claude-sonnet-4\nToken: 1,234,567"
  }
}
```

### Telegram Bot 适配示例

Telegram 需 `sendMessage` 格式：

```json
{
  "chat_id": "YOUR_CHAT_ID",
  "text": "【Cursor 告警】..."
}
```

同样建议用中间层转换，或把 bot token URL 直接配进 `webhook.url` 并自行改 `monitor.mjs` 的 payload 格式。

## 配置项参考

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `thresholds.singleRecordTokens` | `1000000` | 单条 token 告警阈值 |
| `thresholds.hourlyCostUsd` | `5` | 滚动窗口花费告警阈值（美元） |
| `thresholds.hourlyWindowMs` | `3600000` | 滚动窗口长度（毫秒），默认 1 小时 |
| `thresholds.hourlyAlertCooldownMs` | `3600000` | 小时告警冷却时间 |
| `webhook.url` | 占位 URL | 告警 POST 地址 |
| `webhook.timeoutMs` | `15000` | 请求超时 |
| `stateFile` | `./state.json` | 去重状态文件路径 |
| `costField` | `costToYou` | 花费字段：`costToYou` / `apiCost` / `max` |

## 依赖

- **Node.js ≥ 18**（使用内置 `fetch`，无第三方 npm 依赖）

## 故障排查

| 现象 | 处理 |
|------|------|
| `CSV file not found` | 检查 `localPath` 是否为绝对路径且文件存在 |
| `Failed to download CSV` | 检查 URL、Cookie/Token 是否有效 |
| 花费始终为 0 | 个人/Teams 计划可能 CSV 不含美元列；改看 Dashboard → Spending，或换 Enterprise 导出 |
| 重复告警 | 确认 cron 用的同一 `stateFile` 路径；检查是否有多个并行任务 |
| webhook 超时 | 增大 `timeoutMs` 或检查网络 |

## 许可

仓库内工具脚本，随项目私有使用。
